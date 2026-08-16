import type { SupportTopic } from "@/features/support/model/support.types";

import { SupportTopicCard } from "./SupportTopicCard";

import styles from "./SupportTopics.module.css";

interface SupportTopicsProps {
  topics: SupportTopic[];
}

export function SupportTopics({
  topics,
}: SupportTopicsProps) {
  return (
    <div className={styles.grid}>
      {topics.map((topic) => (
        <SupportTopicCard
          key={topic.id}
          topic={topic}
        />
      ))}
    </div>
  );
}