import Image from "next/image";

import { Container } from "@/components/Container/Container";

import logo from "@/assets/images/footerLogo.svg";

import styles from "./Footer.module.css";

const footerColumns = [
  {
    title: "Сервис",
    links: [
      "О сервисе",
      "Как работает",
      "Тарифы и лимиты",
      "Партнерам",
    ],
  },
  {
    title: "Контакты",
    links: [
      "Telegram-bot",
      "Поддержка",
      "Telegram-канал",
    ],
  },
  {
    title: "Документы",
    links: [
      "Пользовательское соглашение",
      "Политика конфиденциальности",
      "Регламент работы с реквизитами",
    ],
  },
];

export function Footer() {
  return (
    <Container>
    <footer className={styles.footer}>
      
        <div className={styles.content}>
          <div className={styles.brand}>
            <Image
              src={logo}
              alt="Логотип"
              width={56}
              height={44}
            />

            <p className={styles.description}>
              Сервис по продаже криптовалюты с
              <br />
              доплатой +7% к курсу. Продавайте
              <br />
              криптовалюту без посредников.
            </p>
          </div>

          {footerColumns.map((column) => (
            <nav
              key={column.title}
              className={styles.column}
            >
              <h3 className={styles.title}>
                {column.title}
              </h3>

              <ul className={styles.list}>
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className={styles.link}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      
    </footer>
    </Container>
  );
}