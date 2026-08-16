import type { SupportData } from "@/features/support/model/support.types";

import { SupportActions } from "./SupportActions";
import { SupportFaq } from "./SupportFaq";
import { SupportNotice } from "./SupportNotice";
import { SupportTopics } from "./SupportTopics";

import styles from "./SupportPage.module.css";

interface SupportPageProps {
  data: SupportData;
}

export function SupportPage({
  data,
}: SupportPageProps) {
  return (
    <main className={styles.page}>
      <div className={styles.columns}>
        <section className={styles.leftColumn}>
          <h1 className={styles.sectionTitle}>
            С чем нужна помощь?
          </h1>

          <SupportTopics topics={data.topics} />

          <SupportActions />

          <SupportNotice />
        </section>

        <SupportFaq items={data.faq} />
      </div>
    </main>
  );
}