"use client";

import { useState } from "react";

import type {
  HistoryPeriod,
  HistoryStatus,
} from "@/features/history/model/history.types";

import styles from "./HistoryFilters.module.css";

export function HistoryFilters() {
  const [period, setPeriod] =
    useState<HistoryPeriod>("7d");

  const [requisite, setRequisite] =
    useState("all");

  const [status, setStatus] =
    useState<HistoryStatus | "all">("completed");

  return (
    <div className={styles.filters}>
      <select
        value={period}
        onChange={(event) =>
          setPeriod(
            event.target
              .value as HistoryPeriod,
          )
        }
        className={styles.select}
      >
        <option value="1d">
          Период: 1 день
        </option>

        <option value="7d">
          Период: 7 дней
        </option>

        <option value="30d">
          Период: 30 дней
        </option>

        <option value="all">
          Период: всё время
        </option>
      </select>

      <select
        value={requisite}
        onChange={(event) =>
          setRequisite(event.target.value)
        }
        className={styles.select}
      >
        <option value="all">
          Реквизит: любой
        </option>

        <option value="sbp">
          Реквизит: СБП
        </option>
      </select>

      <select
        value={status}
        onChange={(event) =>
          setStatus(
            event.target.value as
              | HistoryStatus
              | "all",
          )
        }
        className={styles.select}
      >
        <option value="all">
          Только: все
        </option>

        <option value="completed">
          Только: завершённые
        </option>

        <option value="pending">
          Только: ожидающие
        </option>

        <option value="processing">
          Только: в обработке
        </option>

        <option value="cancelled">
          Только: отменённые
        </option>
      </select>
    </div>
  );
}