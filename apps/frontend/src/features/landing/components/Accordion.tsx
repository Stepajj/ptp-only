"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { faqTransition } from "@/lib/animations";

import styles from "./Accordion.module.css";

const faqItems = [
  {
    question: "Какие способы пополнения доступны?",
    answer: "Доступные способы и адреса пополнения загружаются из OnlyP2P через backend после выбора способа.",
  },
  {
    question: "Как подключить реквизит?",
    answer: "Откройте раздел «Реквизиты», выберите банк и заполните данные карты или СБП. Система отправит их в OnlyP2P на проверку.",
  },
  {
    question: "Как приходят новые заявки?",
    answer: "Backend получает заявки через периодический опрос OnlyP2P и показывает их в разделе «Приём заявок».",
  },
  {
    question: "Почему подтверждение даю я, а не тот, кто переводит деньги?",
    answer: "Деньги поступают на ваш реквизит, поэтому только вы можете подтвердить фактическое получение перевода.",
  },
  {
    question: "Что делать, если перевод не пришёл?",
    answer: "Не подтверждайте заявку. Откройте её детали и используйте доступное действие для дальнейшей обработки.",
  },
  {
    question: "Как связаться с поддержкой?",
    answer: "Авторизуйтесь и откройте раздел «Поддержка». Сообщения передаются оператору через backend-интеграцию.",
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
          <article key={index} className={styles.item}>
            <button
              type="button"
              className={styles.trigger}
              onClick={() => handleToggle(index)}
              aria-expanded={isOpen}
              aria-controls={`faq-content-${index}`}
            >
              <span className={styles.question}>{item.question}</span>

              <motion.span
                className={styles.icon}
                aria-hidden="true"
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={faqTransition}
              >
                +
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key={`faq-content-${index}`}
                  id={`faq-content-${index}`}
                  className={styles.content}
                  layout
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={faqTransition}
                >
                  <div className={styles.contentInner}>
                    <p className={styles.answer}>{item.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        );
      })}
    </div>
  );
}
