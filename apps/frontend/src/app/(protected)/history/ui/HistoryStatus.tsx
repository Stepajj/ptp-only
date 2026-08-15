import type { HistoryStatus } from "@/features/history/model/history.types";

import styles from "./HistoryStatus.module.css";

interface HistoryStatusProps {
  status: HistoryStatus;
}

const statusLabels: Record<HistoryStatus, string> = {
  pending: "Ожидает",
  completed: "Завершено",
  processing: "В обработке",
  cancelled: "Отменено",
};

export function HistoryStatus({
  status,
}: HistoryStatusProps) {
  return (
    <span
      className={`${styles.status} ${styles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}