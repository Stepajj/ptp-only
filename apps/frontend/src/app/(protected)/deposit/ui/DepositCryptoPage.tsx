"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Image from "next/image";

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

  const requiresAmount =
    method?.apiMethod === "cb" ||
    method?.apiMethod === "xr";

  useEffect(() => {
    if (!method || requiresAmount) {
      return;
    }

    async function loadAddress(currentMethod: DepositMethod) {
      try {
        setLoading(true);
        setError(null);
        const result = await createTopup({ method: currentMethod.apiMethod });

        if (!result.address) {
          throw new Error("Не удалось получить адрес пополнения");
        }

        setDetails(createDepositDetails(currentMethod, result.address));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить пополнение");
      } finally {
        setLoading(false);
      }
    }

    void loadAddress(method);
  }, [method, requiresAmount]);

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
    minimum: isInvoice ? "Зависит от лимитов OnlyP2P" : "По лимитам OnlyP2P",
    crediting: isInvoice ? "После оплаты инвойса" : "После подтверждения сети",
    networkLabel: method.title,
    badgeIcon: method.icon,
    waitingText: isInvoice ? "Ждём оплату инвойса..." : "Ждём поступление средств...",
  };
}
