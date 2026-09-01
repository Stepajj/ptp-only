"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from 'next/image';
import SbpIcon from '../../requisites/assets/icons/sbp.svg';
import TBankIcon from '../../requisites/assets/icons/TBank.svg';
import ArrowsIcon from "../assets/icons/EmptyArrows.svg";
import GreenCircle from "../assets/icons/GreenCircle.svg";
import StepsArrow from "../assets/icons/StepsArrow.svg";
import Link from "next/link";
import { getBalance } from "@/features/auth/api/auth.api";
import { getAuthAccessToken } from "@/features/auth/lib/getAuthAccessToken";
import { getRequisites } from "@/features/requisites/api/requisites.api";

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

const MOCK_REQUEST_ID = "mock-active-request";
const MOCK_ACTIVE_REQUEST: IncomingRequest = {
  id: MOCK_REQUEST_ID,
  amountRub: 2350,
  receivedRubAmount: null,
  requisiteId: -900001,
  requisite: "••• 4821",
  fio: "Демо владелец",
  bank: "Т-Банк",
  method: "card",
  status: "waiting",
  awaitingProof: false,
  deadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  created: new Date().toISOString(),
  dateFinished: null,
};

export function RequestsPage() {
  const [activeStatus, setActiveStatus] = useState<IncomingRequestStatus>("waiting");
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [receivedAmounts, setReceivedAmounts] = useState<Record<string, string>>({});
  const [setup, setSetup] = useState<{ currentStep: 1 | 2 | 3 } | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

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

  const loadRequests = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const data = await getIncomingRequests();
      setRequests([
        ...data.filter((request) => request.id !== MOCK_REQUEST_ID),
        MOCK_ACTIVE_REQUEST,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSetup = useCallback(async () => {
    try {
      setSetupError(null);
      const accessToken = getAuthAccessToken();
      if (!accessToken) {
        throw new Error("Сессия недоступна");
      }

      const [balanceResponse, requisites] = await Promise.all([
        getBalance(accessToken),
        getRequisites(),
      ]);
      const hasBalance = balanceResponse.data.balance > 0;
      const hasActiveRequisite = requisites.some((requisite) => requisite.status === "on");

      setSetup({
        currentStep: !hasBalance ? 1 : !hasActiveRequisite ? 2 : 3,
      });
    } catch (reason) {
      setSetup(null);
      setSetupError(reason instanceof Error ? reason.message : "Не удалось определить состояние аккаунта");
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadRequests(), loadSetup()]);
  }, [loadRequests, loadSetup]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadAll();
    });
    const intervalId = window.setInterval(() => {
      void loadRequests(false);
    }, 15_000);

    return () => window.clearInterval(intervalId);
  }, [loadAll, loadRequests]);

  useEffect(() => {
    if (!requests.some((request) => request.deadline && !request.dateFinished)) return;
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [requests]);

  const handleConfirm = async (request: IncomingRequest) => {
    if (request.id === MOCK_REQUEST_ID) {
      setError("Это демонстрационная заявка: действие не отправляется в API.");
      return;
    }

    const customAmount = receivedAmounts[request.id]?.trim();
    const amount = customAmount ? Number(customAmount) : undefined;

    if (amount !== undefined && (!Number.isInteger(amount) || amount <= 0)) {
      setError("Введите корректную сумму в рублях");
      return;
    }

    if (!window.confirm("Подтверждайте получение только после проверки фактического зачисления денег на счёт.")) {
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

        <Link href="/history" className={styles.historyButton}>
          История заявок
        </Link>
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
            {setup ? getSetupDescription(setup.currentStep) : setupError ?? "Проверяем состояние аккаунта..."}
          </p>
          {setup && <div className={styles.reqSteps}>
            <Link href="/deposit" className={`${styles.reqStep} ${getStepClass(1, setup.currentStep)}`}>
              <div className={`${styles.reqStepCircle} ${getStepCircleClass(1, setup.currentStep)}`}>{getStepMarker(1, setup.currentStep)}</div>
              <div className={styles.reqStepContent}>{getStepLabel(1, setup.currentStep)}</div>
            </Link>
            <div className={styles.reqStepArrow}><Image alt="" src={StepsArrow} /> </div>
            <Link href="/requisites" className={`${styles.reqStep} ${getStepClass(2, setup.currentStep)}`}>
              <div className={`${styles.reqStepCircle} ${getStepCircleClass(2, setup.currentStep)}`}>{getStepMarker(2, setup.currentStep)}</div>
              <div className={styles.reqStepContent}>{getStepLabel(2, setup.currentStep)}</div>
            </Link>
            <div className={styles.reqStepArrow}><Image alt="" src={StepsArrow} /></div>
            <Link href="/requests" className={`${styles.reqStep} ${getStepClass(3, setup.currentStep)}`}>
              <div className={`${styles.reqStepCircle} ${getStepCircleClass(3, setup.currentStep)}`}>{getStepMarker(3, setup.currentStep)}</div>
              <div className={styles.reqStepContent}>Приём заявок</div>
            </Link>
            
          </div>}
          <button type="button" className={styles.reloadButton} onClick={() => void loadAll()}>
            Обновить список
          </button>
        </div>
      )}

      {!loading && visibleRequests.length > 0 && (
        <div className={styles.list}>
          {visibleRequests.map((request) => (
            <article key={request.id} className={styles.item}>
              <Link href={`/requests/${encodeURIComponent(request.id)}`} className={styles.itemLink}>
                <RequestIcon request={request} />
                <div className={styles.content}>
                  <div className={styles.amount}>{formatRub(request.amountRub)}</div>
                  <div className={styles.meta}>
                    Перевод · {request.bank} → ваш {request.method === "sbp" ? "СБП" : "реквизит"}
                  </div>
                  <div className={styles.requisite}>{request.requisite}</div>
                </div>
              </Link>

              <div className={styles.actions}>
                <span className={`${styles.status} ${styles[request.status]}`}>
                  {getStatusLabel(request)}
                </span>

                {(request.status === "waiting" || (request.status === "cancelled" && request.awaitingProof)) && (
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
                      {confirmingId === request.id ? "..." : "Деньги получил"}
                    </button>
                  </>
                )}

                <span className={styles.deadline} aria-live="polite">
                  {formatDeadline(request, now)}
                </span>
              </div>
              {(request.status === "waiting" || (request.status === "cancelled" && request.awaitingProof)) && (
                 <p className={styles.warning}>
                   {request.status === "waiting"
                     ? "Если не выбрать действие до окончания первого срока, заявка перейдёт в окно ожидания решения. Если и там ничего не сделать, она автоматически завершится на полную сумму."
                     : "Если до окончания срока, указанного сервисом, ничего не сделать, заявка автоматически завершится на полную сумму."} Проверяйте фактическое зачисление денег в банковском приложении, иначе вы можете потерять средства.
                 </p>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function getStepClass(step: 1 | 2 | 3, currentStep: 1 | 2 | 3): string {
  if (step === currentStep) return styles.blueStep;
  return "";
}

function getStepMarker(step: 1 | 2 | 3, currentStep: 1 | 2 | 3): React.ReactNode {
  if (step < currentStep) return <Image alt="" src={GreenCircle} />;
  return step;
}

function getStepCircleClass(step: 1 | 2 | 3, currentStep: 1 | 2 | 3): string {
  if (step === currentStep) return styles.blueCircle;
  if (step > currentStep) return styles.grayCircle;
  return "";
}

function getSetupDescription(currentStep: 1 | 2 | 3): string {
  if (currentStep === 1) return "Пополните баланс, чтобы система могла начать подбирать входящие переводы.";
  if (currentStep === 2) return "Подключите и включите карту или СБП, чтобы система могла подбирать входящие переводы.";
  return "Реквизит подключён. Когда OnlyP2P назначит реальный перевод, заявка появится здесь.";
}

function getStepLabel(step: 1 | 2, currentStep: 1 | 2 | 3): string {
  if (step === 1) return currentStep > 1 ? "Крипта залита" : "Залить крипту";
  return currentStep > 2 ? "Реквизиты подключены" : "Подключить реквизиты";
}

function formatRub(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

function RequestIcon({ request }: { request: IncomingRequest }) {
  const isSbp = request.method === 'sbp';
  const isTBank = request.bank.toLowerCase().includes('т-банк') || request.bank.toLowerCase().includes('тинькофф');
  const icon = isSbp ? SbpIcon : isTBank ? TBankIcon : null;

  return (
    <div className={styles.icon} aria-hidden="true">
      {icon ? <Image src={icon} alt="" /> : request.bank.charAt(0).toUpperCase()}
    </div>
  );
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

function formatDeadline(request: IncomingRequest, now: number): string {
  if (request.dateFinished) {
    return `Завершена ${formatDate(request.dateFinished)}`;
  }

  if (!request.deadline) {
    return "Срок не передан сервисом";
  }

  const deadlineMs = new Date(request.deadline).getTime();
  if (!Number.isFinite(deadlineMs)) {
    return "Срок недоступен";
  }

  const remainingMs = deadlineMs - now;
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
