import type { HistoryItem as HistoryItemData } from "@/features/history/model/history.types";

import { HistoryStatus } from "./HistoryStatus";
import styles from "./HistoryItem.module.css";

interface HistoryItemProps {
  item: HistoryItemData;
}

function formatAmount(
  amount: number,
  currency: string,
) {
  const currencyMap: Record<string, string> = {
    RUB: "₽",
    USD: "$",
    EUR: "€",
  };

  return `${amount.toLocaleString("ru-RU")} ${
    currencyMap[currency] ?? currency
  }`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  const today = new Date();

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    return `сегодня ${date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function HistoryItem({
  item,
}: HistoryItemProps) {
  return (
    <article className={styles.item}>
      <div className={styles.icon}>
        <span>➤</span>
      </div>

      <div className={styles.content}>
        <div className={styles.amount}>
          {formatAmount(
            item.amount,
            item.currency,
          )}
          {item.uiMock ? " · Демо" : null}
        </div>

        <div className={styles.meta}>
          #{item.orderNumber}
          {" · "}
          {item.paymentMethod}
          {" "}
          {item.bankName}
          {" · "}
          {formatDate(item.createdAt)}
        </div>
      </div>

      <HistoryStatus status={item.status} />
    </article>
  );
}
