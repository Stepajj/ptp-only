import type { SupportFaqItem } from "@/features/support/model/support.types";

import styles from "./SupportFaq.module.css";

interface SupportFaqProps {
  items: SupportFaqItem[];
}

export function SupportFaq({
  items,
}: SupportFaqProps) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>
        Частые вопросы
      </h2>

      <div className={styles.list}>
        {items.map((item) => (
          <article
            key={item.id}
            className={styles.item}
          >
            <h3 className={styles.question}>
              {item.question}
            </h3>

            <p className={styles.answer}>
              {item.answer}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}