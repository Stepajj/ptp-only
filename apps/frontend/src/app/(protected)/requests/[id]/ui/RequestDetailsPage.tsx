"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  confirmIncomingRequest,
  getIncomingRequests,
  type IncomingRequest,
} from "@/features/requests/api/requests.api";

import styles from "./RequestDetailsPage.module.css";

export function RequestDetailsPage({ requestId }: { requestId: string }) {
  const [request, setRequest] = useState<IncomingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const loadRequest = useCallback(async () => {
    try {
      setError(null);
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
      await confirmIncomingRequest(request.id);
      await loadRequest();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось подтвердить получение");
    } finally {
      setConfirming(false);
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
          <div>
            <div className={styles.amount}>{formatRub(request.amountRub)}</div>
            <div className={styles.meta}>Заявка #{request.id} · перевод по {request.method === "sbp" ? "СБП" : "карте"}</div>
          </div>
          <div className={styles.timer}>{timer}</div>
        </div>
        <div className={styles.fields}>
          <div><span>Покупатель</span><strong>{request.bank} · {request.requisite}</strong></div>
          <div><span>Ваш реквизит</span><strong>{request.fio}</strong></div>
        </div>
        {request.status === "finished" ? <p className={styles.success}>Получение денег подтверждено {request.dateFinished ? formatDate(request.dateFinished) : ""}</p> : <p className={styles.notice}>Подтверждайте получение только после фактического поступления денег на счёт.</p>}
        {canConfirm && <button type="button" className={styles.confirm} onClick={() => void confirm()} disabled={confirming}>{confirming ? "Подтверждение..." : "Подтвердить получение"}</button>}
      </section>
    </main>
  );
}

function formatRub(value: number) { return `${value.toLocaleString("ru-RU")} ₽`; }
function formatDate(value: string) { return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }
