"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getBalance } from "@/features/auth/api/auth.api";
import { getAuthAccessToken } from "@/features/auth/lib/getAuthAccessToken";
import { createTopup } from "@/features/deposit/api/deposit.api";
import { getDepositMethod } from "@/features/deposit/model/deposit.catalog";
import type { DepositDetails, DepositMethod } from "@/features/deposit/model/deposit.types";

import { DepositAddressCard } from "./DepositAddressCard";
import styles from "./DepositCryptoPage.module.css";

interface DepositCryptoPageProps {
  methodId: string;
}

export function DepositCryptoPage({
  methodId,
}: DepositCryptoPageProps) {
  const method = getDepositMethod(methodId);
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState<DepositDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialBalance, setInitialBalance] = useState<number | null>(null);
  const [creditStatus, setCreditStatus] = useState<"waiting" | "credited" | "unknown">("waiting");

  const requiresAmount =
    method?.apiMethod === "cb" ||
    method?.apiMethod === "xr";

  useEffect(() => {
    if (!method || requiresAmount) {
      return;
    }

    let cancelled = false;

    async function loadAddress(currentMethod: DepositMethod) {
      try {
        setLoading(true);
        setError(null);
        const balanceBefore = await readCurrentBalance();
        if (cancelled) return;
        setInitialBalance(balanceBefore);
        setCreditStatus(balanceBefore === null ? "unknown" : "waiting");
        const result = await createTopup({ method: currentMethod.apiMethod });

        if (!result.address) {
          throw new Error("Не удалось получить адрес пополнения");
        }

        if (!cancelled) {
          setDetails(createDepositDetails(currentMethod, result.address));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Не удалось загрузить пополнение");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAddress(method);

    return () => {
      cancelled = true;
    };
  }, [method, requiresAmount]);

  useEffect(() => {
    if (!details || initialBalance === null || creditStatus === "credited") {
      return;
    }

    let cancelled = false;

    const checkBalance = async () => {
      const currentBalance = await readCurrentBalance();
      if (!cancelled && currentBalance !== null && currentBalance > initialBalance) {
        setCreditStatus("credited");
      }
    };

    void checkBalance();
    const intervalId = window.setInterval(() => void checkBalance(), 15_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [details, initialBalance, creditStatus]);

  const handleInvoiceSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!method || !requiresAmount) {
      return;
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Введите сумму пополнения в USDT");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const balanceBefore = await readCurrentBalance();
      setInitialBalance(balanceBefore);
      setCreditStatus(balanceBefore === null ? "unknown" : "waiting");
      const result = await createTopup({
        method: method.apiMethod,
        amount: parsedAmount,
      });

      if (!result.payUrl) {
        throw new Error("Не удалось получить ссылку на оплату");
      }

      setDetails(createDepositDetails(method, result.payUrl));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать пополнение");
    } finally {
      setLoading(false);
    }
  };

  if (!method) {
    return (
      <main className={styles.page}>
        <div className={styles.notFound}>
          Способ пополнения не найден
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Link
        href="/deposit"
        className={styles.backLink}
      >
        <span className={styles.backArrow}>
          ‹
        </span>

        <span className={styles.backText}>
          К способам пополнения
        </span>
      </Link>

      {requiresAmount && !details && (
        <form className={styles.invoiceForm} onSubmit={handleInvoiceSubmit}>
          <label className={styles.label} htmlFor="depositAmount">
            Сумма в USDT
          </label>

          <input
            id="depositAmount"
            className={styles.input}
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={loading}
            placeholder="100"
          />

          <button className={styles.submitButton} type="submit" disabled={loading}>
            {loading ? "Создание..." : "Создать ссылку"}
          </button>
        </form>
      )}

      {loading && !details && (
        <div className={styles.notFound}>
          Загрузка...
        </div>
      )}

      {error && (
        <div className={styles.notFound}>
          {error}
        </div>
      )}

      {details && (
        <DepositAddressCard
          method={method}
          details={details}
          creditStatus={creditStatus}
        />
      )}
    </main>
  );
}

function createDepositDetails(method: DepositMethod, value: string): DepositDetails {
  const isInvoice =
    method.apiMethod === "cb" ||
    method.apiMethod === "xr";

  return {
    methodId: method.id,
    address: value,
    addressLabel: isInvoice ? "Ссылка на оплату" : "Адрес для пополнения",
    minimum: method.minimum,
    crediting: isInvoice ? "После оплаты инвойса" : "После подтверждения сети",
    networkLabel: method.title,
    badgeIcon: method.icon,
    waitingText: isInvoice ? "Ждём оплату инвойса..." : "Ждём поступление средств...",
  };
}

async function readCurrentBalance(): Promise<number | null> {
  const accessToken = getAuthAccessToken();
  if (!accessToken) return null;

  try {
    const response = await getBalance(accessToken);
    return response.data.balance;
  } catch {
    return null;
  }
}
