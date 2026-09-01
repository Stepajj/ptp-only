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
import SbpIcon from "../../../requisites/assets/icons/sbp.svg";
import TBankIcon from "../../../requisites/assets/icons/TBank.svg";

export function RequestDetailsPage({ requestId }: { requestId: string }) {
  const [request, setRequest] = useState<IncomingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [noMoneyOpen, setNoMoneyOpen] = useState(false);

  const loadRequest = useCallback(async () => {
    try {
      setError(null);
      const requests = await getIncomingRequests();
      setRequest(requests.find((item) => item.id === requestId) ?? null);
      setNow(Date.now());
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

  useEffect(() => {
    if (!request || request.status === "finished") return;

    const interval = window.setInterval(() => void loadRequest(), 15000);
    const refreshOnReturn = () => {
      if (document.visibilityState === "visible") void loadRequest();
    };
    window.addEventListener("focus", refreshOnReturn);
    document.addEventListener("visibilitychange", refreshOnReturn);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnReturn);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, [loadRequest, request]);

  const confirm = async () => {
    if (!request) return;
    try {
      setConfirming(true);
      setError(null);
      await confirmIncomingRequest(request.id);
      setConfirmOpen(false);
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
  const deadlineMs = request.deadline ? new Date(request.deadline).getTime() : NaN;
  const secondsLeft = Number.isFinite(deadlineMs)
    ? Math.max(0, Math.floor((deadlineMs - now) / 1000))
    : null;
  const timer = secondsLeft === null ? "—" : `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const timerLabel = request.status === "finished"
    ? `Закрыта${request.dateFinished ? ` ${formatDate(request.dateFinished)}` : " сервисом"}`
    : secondsLeft === null
      ? "Срок не передан сервисом"
      : secondsLeft === 0
        ? "Время истекло, уточняем статус"
        : `Осталось ${timer}`;
  const actionAvailable = canConfirm && (secondsLeft === null || secondsLeft > 0);
  const bankIcon = request.method === "sbp" ? SbpIcon : getBankIcon(request.bank);

  return (
    <main className={styles.page}>
      <Link href="/requests" className={styles.back}>← К списку заявок</Link>
      <section className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon} aria-hidden="true">
            {bankIcon ? <Image src={bankIcon} alt="" /> : request.bank.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className={styles.amount}>{formatRub(request.amountRub)}</div>
            <div className={styles.meta}>Заявка #{request.id} · перевод по {request.method === "sbp" ? "СБП" : "карте"}</div>
          </div>
          <div className={styles.timer}>
            <Image src={TimerIcon} alt="Таймер" />
            <span aria-live="polite">{timerLabel}</span></div>
        </div>
        <div className={styles.fields}>
          <div><span>Реквизит</span><strong>{request.bank} · {request.requisite}</strong></div>
          <div><span>Владелец реквизита</span><strong>{request.fio}</strong></div>
        </div>
        {request.status === "finished" ? <p className={styles.success}>Заявка закрыта сервисом{request.dateFinished ? ` ${formatDate(request.dateFinished)}` : ""}.</p> : request.status === "cancelled" && !request.awaitingProof ? <p className={styles.notice}>Заявка отменена сервисом.</p> : <p className={styles.warning}>{request.status === "waiting" ? "Если не выбрать действие до окончания первого срока, заявка перейдёт в окно ожидания решения. Если и там ничего не сделать, она автоматически завершится на полную сумму." : "Если до окончания срока, указанного сервисом, ничего не сделать, заявка автоматически завершится на полную сумму."} Проверяйте фактическое зачисление денег в банковском приложении, иначе вы можете потерять средства.</p>}
        {request.status === "cancelled" && request.awaitingProof && (
          <p className={styles.notice}>
            Заявка ждёт вашего решения. Если деньги пришли позднее, подтвердите получение. Если денег нет, загрузите видео или PDF-пруф до окончания срока.
          </p>
        )}
        {actionAvailable && (
          <div className={styles.actions}>
            <button type="button" className={styles.confirm} onClick={() => setConfirmOpen(true)} disabled={confirming}>
              Деньги получил
            </button>
            <button type="button" className={styles.noMoney} onClick={() => setNoMoneyOpen(true)}>
              Денег нет
            </button>
          </div>
        )}
        {request.status === "cancelled" && request.awaitingProof && <label className={styles.proof}>Загрузить пруф (видео или PDF)<input type="file" accept=".mp4,.mov,.avi,.mkv,.webm,.m4v,.gif,.pdf" onChange={(event) => void uploadProof(event)} disabled={uploading || secondsLeft === 0} />{uploading && <span>Отправка...</span>}</label>}
      </section>
      {confirmOpen && (
        <div className={styles.modalBackdrop} role="presentation">
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="confirm-receipt-title">
            <h2 id="confirm-receipt-title">Подтвердить получение денег?</h2>
            <p>Подтверждайте только после того, как проверили фактическое зачисление на счёт в банковском приложении.</p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.cancel} onClick={() => setConfirmOpen(false)} disabled={confirming}>Отмена</button>
              <button type="button" className={styles.confirm} onClick={() => void confirm()} disabled={confirming}>
                {confirming ? "Проверяем..." : "Деньги получил"}
              </button>
            </div>
          </div>
        </div>
      )}
      {noMoneyOpen && (
        <div className={styles.modalBackdrop} role="presentation">
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="no-money-title">
            <h2 id="no-money-title">Деньги не поступили?</h2>
            {request.status === "waiting" ? (
              <p>
                Не подтверждайте заявку. По документации OnlyP2P после истечения таймера заявка перейдёт в отменённую и откроет окно для позднего подтверждения или загрузки пруфа.
              </p>
            ) : (
              <p>
                Загрузите видео или PDF-пруф отсутствия платежа до окончания срока. Если нужна помощь оператора, откройте поддержку по этой заявке.
              </p>
            )}
            <div className={styles.modalActions}>
              <button type="button" className={styles.cancel} onClick={() => setNoMoneyOpen(false)}>Закрыть</button>
              <Link className={styles.supportLink} href={`/support/chat?requestId=${encodeURIComponent(request.id)}`}>
                Поддержка
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function formatRub(value: number) { return `${value.toLocaleString("ru-RU")} ₽`; }
function formatDate(value: string) { return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }

function getBankIcon(bank: string) {
  const normalized = bank.toLowerCase();
  return normalized.includes("т-банк") || normalized.includes("тинькофф") ? TBankIcon : null;
}
