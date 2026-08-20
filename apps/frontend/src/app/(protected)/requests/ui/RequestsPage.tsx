"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ArrowsIcon from "@/assets/icons/EmptyArrows.svg";
import Image from 'next/image';
import Link from "next/link";

import {
  confirmIncomingRequest,
  getIncomingRequests,
  type IncomingRequest,
  type IncomingRequestStatus,
} from "@/features/requests/api/requests.api";

import styles from "./RequestsPage.module.css";

const tabs: Array<{ status: IncomingRequestStatus; label: string }> = [
  { status: "waiting", label: "Ожидают" },
  { status: "cancelled", label: "Отменённые" },
  { status: "finished", label: "Завершённые" },
];

export function RequestsPage() {
  const [activeStatus, setActiveStatus] = useState<IncomingRequestStatus>("waiting");
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [receivedAmounts, setReceivedAmounts] = useState<Record<string, string>>({});

  const visibleRequests = useMemo(
    () => requests.filter((request) => request.status === activeStatus),
    [requests, activeStatus],
  );

  const counts = useMemo(() => {
    return requests.reduce<Record<IncomingRequestStatus, number>>(
      (accumulator, request) => {
        accumulator[request.status] += 1;
        return accumulator;
      },
      { waiting: 0, cancelled: 0, finished: 0 },
    );
  }, [requests]);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRequests(await getIncomingRequests());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadRequests();
    });
  }, [loadRequests]);

  const handleConfirm = async (request: IncomingRequest) => {
    const customAmount = receivedAmounts[request.id]?.trim();
    const amount = customAmount ? Number(customAmount) : undefined;

    if (amount !== undefined && (!Number.isInteger(amount) || amount <= 0)) {
      setError("Введите корректную сумму в рублях");
      return;
    }

    try {
      setConfirmingId(request.id);
      setError(null);
      await confirmIncomingRequest(request.id, amount);
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось подтвердить заявку");
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.status}
              type="button"
              className={`${styles.tab} ${activeStatus === tab.status ? styles.activeTab : ""}`}
              onClick={() => setActiveStatus(tab.status)}
            >
              {tab.label} {counts[tab.status]}
            </button>
          ))}
        </div>

        <button type="button" className={styles.historyButton} onClick={() => setActiveStatus("finished")}>
          История заявок
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {loading && (
        <div className={styles.state}>
          Загрузка заявок...
        </div>
      )}

      {!loading && visibleRequests.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Image alt="" src={ArrowsIcon}/>
           
          </div>
          <h3 className={styles.emptyTitle}>Пока нет заявок на приём</h3>
          <p className={styles.emptyDescription}>
           Чтобы система начала подбирать вам входящие переводы, подключите реквизит — карту или СБП. Это один шаг до первой продажи.
          </p>
          <div className={styles.reqSteps}>
            <div className={styles.reqStep}>

              <div className={styles.reqStepCircle}>1</div>
              <div className={styles.reqStepContent}>Крипта залита</div>
            </div>
            <div className={styles.reqStepArrow}>- </div>
            <div className={`${styles.reqStep} ${styles.blueStep}`}>

              <div className={styles.reqStepCircle}>2</div>
              <div className={styles.reqStepContent}>Крипта залита</div>
            </div>
            <div className={styles.reqStepArrow}>-</div>
            <div className={styles.reqStep}>

              <div className={styles.reqStepCircle}>1</div>
              <div className={styles.reqStepContent}>Крипта залита</div>
            </div>
            <div className={styles.reqStepArrow}>-</div>
          </div>
          <button type="button" className={styles.reloadButton} onClick={() => void loadRequests()}>
            Обновить список
          </button>
        </div>
      )}

      {!loading && visibleRequests.length > 0 && (
        <div className={styles.list}>
          {visibleRequests.map((request) => (
            <article key={request.id} className={styles.item}>
              <Link href={`/requests/${encodeURIComponent(request.id)}`} className={styles.itemLink}>
                <div className={styles.icon}>▶</div>
                <div className={styles.content}>
                  <div className={styles.amount}>{formatRub(request.amountRub)}</div>
                  <div className={styles.meta}>
                    Покупатель · {request.bank} → ваш {request.method === "sbp" ? "СБП" : "реквизит"}
                  </div>
                  <div className={styles.requisite}>{request.requisite}</div>
                </div>
              </Link>

              <div className={styles.actions}>
                <span className={`${styles.status} ${styles[request.status]}`}>
                  {getStatusLabel(request)}
                </span>

                {request.status !== "finished" && (
                  <>
                    <input
                      className={styles.amountInput}
                      type="number"
                      min="1"
                      step="1"
                      value={receivedAmounts[request.id] ?? ""}
                      onChange={(event) =>
                        setReceivedAmounts((current) => ({
                          ...current,
                          [request.id]: event.target.value,
                        }))
                      }
                      placeholder="Другая сумма"
                      disabled={confirmingId === request.id}
                    />

                    <button
                      type="button"
                      className={styles.confirmButton}
                      onClick={() => void handleConfirm(request)}
                      disabled={confirmingId === request.id}
                    >
                      {confirmingId === request.id ? "..." : "Подтвердить"}
                    </button>
                  </>
                )}

                <span className={styles.deadline}>
                  {formatDeadline(request)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function formatRub(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusLabel(request: IncomingRequest): string {
  if (request.status === "waiting") {
    return "Ожидает";
  }

  if (request.status === "cancelled" && request.awaitingProof) {
    return "Нужен ответ";
  }

  if (request.status === "cancelled") {
    return "Отменена";
  }

  return "Завершена";
}

function formatDeadline(request: IncomingRequest): string {
  if (request.dateFinished) {
    return `Завершена ${formatDate(request.dateFinished)}`;
  }

  if (!request.deadline) {
    return "Осталось 00:00";
  }

  const remainingMs = new Date(request.deadline).getTime() - Date.now();
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `Осталось ${minutes}:${seconds}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}