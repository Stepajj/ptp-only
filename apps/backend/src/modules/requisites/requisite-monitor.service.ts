import { prisma } from "../../db/prisma";
import {
  editOnlyP2PRequisite,
  getOnlyP2PRequests,
  getOnlyP2PRequisites,
} from "../../integrations/only-p2p/only-p2p.client";
import { logger } from "../../shared/logger/logger";
import { findExternalClientByUserId } from "../auth/auth.repository";

const NO_REQUESTS_WINDOW_MS = 30 * 60 * 1000;
const RESPONSE_WINDOW_MS = 10 * 60 * 1000;
const POLL_INTERVAL_MS = 60 * 1000;

interface MonitorRecord {
  id: string;
  userId: string;
  requisiteId: number;
  state: string;
  noRequestsSince: Date;
  promptedAt: Date | null;
}

function latestRequestTime(requests: Awaited<ReturnType<typeof getOnlyP2PRequests>>, requisiteId: number): Date | null {
  let latest: Date | null = null;
  for (const request of requests) {
    const created = new Date(request.created);
    if (request.requisiteId !== requisiteId) continue;
    if (!Number.isNaN(created.getTime()) && (!latest || created > latest)) latest = created;
  }
  return latest;
}

async function monitorUser(userId: string, externalUserId: string): Promise<void> {
  const [requisites, requests] = await Promise.all([
    getOnlyP2PRequisites(externalUserId),
    getOnlyP2PRequests(externalUserId),
  ]);
  const activeIds = new Set(requisites.filter((item) => item.status === "on").map((item) => item.requisiteId));
  const now = new Date();
  const latestFor = (requisiteId: number) => latestRequestTime(requests, requisiteId);
  const monitors = await prisma.requisiteMonitor.findMany({ where: { userId } }) as MonitorRecord[];
  const monitoredIds = new Set(monitors.map((monitor) => monitor.requisiteId));
  for (const requisiteId of activeIds) {
    if (!monitoredIds.has(requisiteId)) {
      await prisma.requisiteMonitor.create({ data: { userId, requisiteId, noRequestsSince: now, state: "monitoring" } });
    }
  }
  const currentMonitors = monitors.concat(
    [...activeIds]
      .filter((requisiteId) => !monitoredIds.has(requisiteId))
      .map((requisiteId) => ({ id: "", userId, requisiteId, state: "monitoring", noRequestsSince: now, promptedAt: null })),
  );

  for (const monitor of currentMonitors) {
    if (!activeIds.has(monitor.requisiteId) && monitor.state !== "auto_disabled") {
      await prisma.requisiteMonitor.delete({ where: { id: monitor.id } });
      continue;
    }

    const latest = latestFor(monitor.requisiteId);
    if (latest && latest > monitor.noRequestsSince) {
      await prisma.requisiteMonitor.updateMany({
        where: { id: monitor.id },
        data: { state: "monitoring", noRequestsSince: latest, promptedAt: null },
      });
      continue;
    }

    if (monitor.state === "waiting_response" && monitor.promptedAt) {
      if (now.getTime() - monitor.promptedAt.getTime() >= RESPONSE_WINDOW_MS) {
        const claim = await prisma.requisiteMonitor.updateMany({
          where: { id: monitor.id, state: "waiting_response" },
          data: { state: "disabling" },
        });
        if (claim.count !== 1) continue;
        try {
          await editOnlyP2PRequisite(externalUserId, monitor.requisiteId, { status: "off" });
          await prisma.requisiteMonitor.updateMany({
            where: { id: monitor.id, state: "waiting_response" },
            data: { state: "auto_disabled", autoDisabledAt: now },
          });
          logger.info({ userId, requisiteId: monitor.requisiteId }, "requisite auto-disabled after no requests");
        } catch (error) {
          await prisma.requisiteMonitor.update({ where: { id: monitor.id }, data: { state: "waiting_response" } });
          logger.error({ err: error, userId, requisiteId: monitor.requisiteId }, "failed to auto-disable requisite");
        }
      }
      continue;
    }

    if (monitor.state === "monitoring" && now.getTime() - monitor.noRequestsSince.getTime() >= NO_REQUESTS_WINDOW_MS) {
      const result = await prisma.requisiteMonitor.updateMany({
        where: { id: monitor.id, state: "monitoring" },
        data: { state: "waiting_response", promptedAt: now },
      });
      if (result.count === 1) logger.info({ userId, requisiteId: monitor.requisiteId }, "requisite monitoring requires user decision");
    }
  }
}

export async function ensureRequisiteMonitor(userId: string, requisiteId: number, status: "on" | "off"): Promise<void> {
  if (status === "off") {
    await prisma.requisiteMonitor.deleteMany({ where: { userId, requisiteId } });
    return;
  }

  await prisma.requisiteMonitor.upsert({
    where: { userId_requisiteId: { userId, requisiteId } },
    create: { userId, requisiteId, noRequestsSince: new Date(), state: "monitoring" },
    update: { state: "monitoring", noRequestsSince: new Date(), promptedAt: null, autoDisabledAt: null },
  });
}

export async function removeRequisiteMonitor(userId: string, requisiteId: number): Promise<void> {
  await prisma.requisiteMonitor.deleteMany({ where: { userId, requisiteId } });
}

export async function listRequisiteMonitoringPrompts(userId: string) {
  return prisma.requisiteMonitor.findMany({
    where: { userId, state: { in: ["waiting_response", "auto_disabled"] } },
    select: { requisiteId: true, promptedAt: true, state: true, autoDisabledAt: true },
    orderBy: { promptedAt: "asc" },
  });
}

export async function answerRequisiteMonitoring(userId: string, requisiteId: number, keepEnabled: boolean): Promise<void> {
  const monitor = await prisma.requisiteMonitor.findFirst({ where: { userId, requisiteId, state: "waiting_response" } });
  if (!monitor) return;

  if (keepEnabled) {
    await prisma.requisiteMonitor.updateMany({
      where: { id: monitor.id, state: "waiting_response" },
      data: { state: "monitoring", noRequestsSince: new Date(), promptedAt: null },
    });
    return;
  }

  const claim = await prisma.requisiteMonitor.updateMany({
    where: { id: monitor.id, state: "waiting_response" },
    data: { state: "disabling" },
  });
  if (claim.count !== 1) return;

  const externalClient = await findExternalClientByUserId(userId);
  if (!externalClient) {
    await prisma.requisiteMonitor.update({ where: { id: monitor.id }, data: { state: "monitoring", promptedAt: new Date() } });
    return;
  }
  try {
    await editOnlyP2PRequisite(externalClient.externalUserId, requisiteId, { status: "off" });
    await prisma.requisiteMonitor.update({ where: { id: monitor.id }, data: { state: "auto_disabled", autoDisabledAt: new Date() } });
  } catch (error) {
    await prisma.requisiteMonitor.update({ where: { id: monitor.id }, data: { state: "waiting_response" } });
    throw error;
  }
}

let monitorTimer: NodeJS.Timeout | null = null;
let monitorRunning = false;

export async function runRequisiteMonitoring(): Promise<void> {
  if (monitorRunning) return;
  monitorRunning = true;
  try {
    const clients = await prisma.externalClient.findMany({ select: { userId: true, externalUserId: true } });
    for (const client of clients) {
      try {
        await monitorUser(client.userId, client.externalUserId);
      } catch (error) {
        logger.error({ err: error, userId: client.userId }, "requisite monitoring poll failed");
      }
    }
  } finally {
    monitorRunning = false;
  }
}

export function startRequisiteMonitoring(): void {
  if (monitorTimer) return;
  monitorTimer = setInterval(() => void runRequisiteMonitoring(), POLL_INTERVAL_MS);
  monitorTimer.unref();
  void runRequisiteMonitoring();
}

export function stopRequisiteMonitoring(): void {
  if (monitorTimer) clearInterval(monitorTimer);
  monitorTimer = null;
}
