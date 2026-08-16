import Link from "next/link";

import type { SupportTopic } from "@/features/support/model/support.types";

import styles from "./SupportTopicCard.module.css";

interface SupportTopicCardProps {
  topic: SupportTopic;
}

export function SupportTopicCard({
  topic,
}: SupportTopicCardProps) {
  return (
    <Link
      href={`/support/chat?topic=${topic.id}`}
      className={styles.card}
    >
      <div className={styles.icon}>
        {topic.icon}
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>
          {topic.title}
        </h2>

        <p className={styles.description}>
          {topic.description}
        </p>
      </div>
    </Link>
  );
}   