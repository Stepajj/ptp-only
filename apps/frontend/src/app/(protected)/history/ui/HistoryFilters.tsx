"use client";

import type {
  HistoryPeriod,
  HistoryStatus,
} from "@/features/history/model/history.types";

import styles from "./HistoryFilters.module.css";

interface HistoryFiltersProps {
  period: HistoryPeriod;
  requisite: string;
  status: HistoryStatus | "all";
  onPeriodChange: (value: HistoryPeriod) => void;
  onRequisiteChange: (value: string) => void;
  onStatusChange: (value: HistoryStatus | "all") => void;
}

export function HistoryFilters({
  period,
  requisite,
  status,
  onPeriodChange,
  onRequisiteChange,
  onStatusChange,
}: HistoryFiltersProps) {

  return (
    <div className={styles.filters}>
      <select
        value={period}
        onChange={(event) => onPeriodChange(event.target.value as HistoryPeriod)}
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
        onChange={(event) => onRequisiteChange(event.target.value)}
        className={styles.select}
      >
        <option value="all">
          Реквизит: любой
        </option>

        <option value="sbp">
          Реквизит: СБП
        </option>

        <option value="card">
          Реквизит: карта
        </option>
      </select>

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as HistoryStatus | "all")}
        className={styles.select}
      >
        <option value="all">
          Только: все
        </option>

        <option value="completed">
          Только: завершённые
        </option>

      </select>
    </div>
  );
}
