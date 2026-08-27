"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import TimerIcon from "../../assets/icons/timer.svg";

import {
  confirmIncomingRequest,
  getIncomingRequests,
  uploadRequestProof,
  type IncomingRequest,
} from "@/features/requests/api/requests.api";

import styles from "./RequestDetailsPage.module.css";
import SbpIcon from "../../assets/icons/sbp.svg";
import TBankIcon from "../../../requisites/assets/icons/TBank.svg";

const demoActiveRequest: IncomingRequest = {
  id: "ui-demo-request-active",
  amountRub: 24000,
  receivedRubAmount: null,
  requisiteId: -900005,
  requisite: "•••• 4242",
  fio: "Демо владелец",
  bank: "Сбербанк",
  method: "card",
  status: "waiting",
  awaitingProof: false,
  deadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  created: new Date().toISOString(),
  dateFinished: null,
};

export function RequestDetailsPage({ requestId }: { requestId: string }) {
  const [request, setRequest] = useState<IncomingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const loadRequest = useCallback(async () => {
    try {
      setError(null);
      if (requestId === demoActiveRequest.id) {
        setRequest(demoActiveRequest);
        setLoading(false);
        return;
      }
      const requests = await getIncomingRequests();
      setRequest(requests.find((item) => item.id === requestId) ?? null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось загрузить заявку");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    queueMicrotask(() => void loadRequest());
  }, [loadRequest]);

  useEffect(() => {
    if (!request?.deadline) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [request]);

  const confirm = async () => {
    if (!request) return;
    try {
      setConfirming(true);
      setError(null);
      if (request.id === demoActiveRequest.id) {
        setRequest((current) => current ? {
          ...current,
          status: "finished",
          receivedRubAmount: current.amountRub,
          dateFinished: new Date().toISOString(),
          deadline: null,
        } : current);
        return;
      }
      await confirmIncomingRequest(request.id);
      await loadRequest();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось подтвердить получение");
    } finally {
      setConfirming(false);
    }
  };

  const uploadProof = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !request) return;
    try {
      setUploading(true);
      setError(null);
      await uploadRequestProof(request.id, file);
      await loadRequest();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось отправить пруф");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  if (loading) return <main className={styles.page}>Загрузка заявки...</main>;
  if (error) return <main className={styles.page}><div className={styles.error}>{error}</div></main>;
  if (!request) return <main className={styles.page}><div className={styles.error}>Заявка не найдена</div></main>;

  const canConfirm = request.status === "waiting" || (request.status === "cancelled" && request.awaitingProof);
  const secondsLeft = request.deadline
    ? Math.max(0, Math.floor((new Date(request.deadline).getTime() - now) / 1000))
    : null;
  const timer = secondsLeft === null ? "—" : `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <main className={styles.page}>
      <Link href="/requests" className={styles.back}>← К списку заявок</Link>
      <section className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon} aria-hidden="true">
            <Image src={request.method === "sbp" ? SbpIcon : getBankIcon(request.bank)} alt="" />
          </div>
          <div>
            <div className={styles.amount}>{formatRub(request.amountRub)}</div>
            <div className={styles.meta}>Заявка #{request.id} · перевод по {request.method === "sbp" ? "СБП" : "карте"}</div>
          </div>
          <div className={styles.timer}>
            <Image src={TimerIcon} alt="Таймер" />
            {timer}</div>
        </div>
        <div className={styles.fields}>
          <div><span>Реквизит</span><strong>{request.bank} · {request.requisite}</strong></div>
          <div><span>Владелец реквизита</span><strong>{request.fio}</strong></div>
        </div>
        {request.status === "finished" ? <p className={styles.success}>Получение денег подтверждено {request.dateFinished ? formatDate(request.dateFinished) : ""}</p> : <p className={styles.notice}>Подтверждайте получение только после фактического поступления денег на счёт.</p>}
        {canConfirm && <button type="button" className={styles.confirm} onClick={() => void confirm()} disabled={confirming}>{confirming ? "Подтверждение..." : "Подтвердить получение"}</button>}
        {request.status === "cancelled" && request.awaitingProof && <label className={styles.proof}>Загрузить пруф (видео или PDF)<input type="file" accept=".mp4,.mov,.avi,.mkv,.webm,.m4v,.gif,.pdf" onChange={(event) => void uploadProof(event)} disabled={uploading} />{uploading && <span>Отправка...</span>}</label>}
      </section>
    </main>
  );
}

function formatRub(value: number) { return `${value.toLocaleString("ru-RU")} ₽`; }
function formatDate(value: string) { return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }

function getBankIcon(bank: string) {
  const normalized = bank.toLowerCase();
  return normalized.includes("т-банк") || normalized.includes("тинькофф") ? TBankIcon : SbpIcon;
}
