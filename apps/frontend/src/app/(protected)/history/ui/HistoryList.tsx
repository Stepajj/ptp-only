import type { HistoryItem } from "@/features/history/model/history.types";

import { HistoryItem as HistoryItemComponent } from "./HistoryItem";
import styles from "./HistoryList.module.css";

interface HistoryListProps {
  items: HistoryItem[];
}

export function HistoryList({
  items,
}: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        История пуста
      </div>
    );
  }

  return (
    <section className={styles.list}>
      {items.map((item) => (
        <HistoryItemComponent
          key={item.id}
          item={item}
        />
      ))}
    </section>
  );
}