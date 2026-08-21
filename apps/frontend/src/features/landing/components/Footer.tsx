import Image from "next/image";

import { Container } from "@/components/Container/Container";
import {
  StaggerContainer,
  StaggerGroup,
  StaggerItem,
} from "@/components/motion/StaggerContainer";
import logo from "@/assets/images/footerLogo.svg";

import styles from "./Footer.module.css";

const footerColumns = [
  {
    title: "Сервис",
    links: [
      { label: "О сервисе", href: "#about-service" },
      { label: "Как работает", href: "#how-it-works" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Контакты",
    links: [
      { label: "Telegram-бот", href: "https://t.me/p2ponlywhitelabelbot" },
      { label: "Партнёрство", href: "https://t.me/O_onlypays" },
      { label: "OnlyP2P", href: "https://onlypays.net" },
    ],
  },
];

export function Footer() {
  return (
    <Container>
      <StaggerContainer as="footer" className={styles.footer} variant="section">
        <StaggerGroup className={styles.content}>
          <StaggerItem className={styles.brand}>
            <Image src={logo} alt="Логотип" width={56} height={44} />

            <p className={styles.description}>
              Сервис по продаже криптовалюты с
              <br />
              через инфраструктуру OnlyP2P.
            </p>
          </StaggerItem>

          {footerColumns.map((column) => (
            <StaggerItem key={column.title}>
              <nav className={styles.column}>
                <h3 className={styles.title}>{column.title}</h3>

                <ul className={styles.list}>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className={styles.link}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </StaggerContainer>
    </Container>
  );
}
