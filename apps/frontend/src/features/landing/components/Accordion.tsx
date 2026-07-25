"use client";

import { useState } from "react";

import styles from "./Accordion.module.css";

const faqItems = [
  {
    question:
      "Почему подтверждение даю я, а не тот, кто переводит деньги?",
    answer:
      "Потому что именно вы получаете деньги на свою карту — вы первым видите, пришёл перевод или нет. Это защищает от ложных заявок со стороны отправителя.",
  },
  {
    question:
      "Почему подтверждение даю я, а не тот, кто переводит деньги?",
    answer:
      "Потому что именно вы получаете деньги на свою карту — вы первым видите, пришёл перевод или нет. Это защищает от ложных заявок со стороны отправителя.",
  },
  {
    question:
      "Почему подтверждение даю я, а не тот, кто переводит деньги?",
    answer:
      "Потому что именно вы получаете деньги на свою карту — вы первым видите, пришёл перевод или нет. Это защищает от ложных заявок со стороны отправителя.",
  },
  {
    question:
      "Почему подтверждение даю я, а не тот, кто переводит деньги?",
    answer:
      "Потому что именно вы получаете деньги на свою карту — вы первым видите, пришёл перевод или нет. Это защищает от ложных заявок со стороны отправителя.",
  },
  {
    question:
      "Почему подтверждение даю я, а не тот, кто переводит деньги?",
    answer:
      "Потому что именно вы получаете деньги на свою карту — вы первым видите, пришёл перевод или нет. Это защищает от ложных заявок со стороны отправителя.",
  },
  {
    question:
      "Почему подтверждение даю я, а не тот, кто переводит деньги?",
    answer:
      "Потому что именно вы получаете деньги на свою карту — вы первым видите, пришёл перевод или нет. Это защищает от ложных заявок со стороны отправителя.",
  },
];

export function Accordion() {
  const [activeIndex, setActiveIndex] = useState(0);

  function handleToggle(index: number) {
    setActiveIndex((prev) => (prev === index ? -1 : index));
  }

  return (
    <div className={styles.wrapper}>
      {faqItems.map((item, index) => {
        const isOpen = activeIndex === index;

        return (
          <article
            key={index}
            className={styles.item}
          >
            <button
              type="button"
              className={styles.trigger}
              onClick={() => handleToggle(index)}
              aria-expanded={isOpen}
              aria-controls={`faq-content-${index}`}
            >
              <span className={styles.question}>
                {item.question}
              </span>

              <span
                className={`${styles.icon} ${
                  isOpen ? styles.iconOpen : ""
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>

            <div
              id={`faq-content-${index}`}
              className={`${styles.content} ${
                isOpen ? styles.contentOpen : ""
              }`}
            >
              <div className={styles.contentInner}>
                <p className={styles.answer}>
                  {item.answer}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}