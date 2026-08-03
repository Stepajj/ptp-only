import Image from "next/image";
import Link from "next/link";

import { AnimatedSection } from "@/components/motion/AnimatedSection";
import { LAYOUT } from "@/constants/layout";
import logo from "@/assets/images/logo.svg";

import { HeaderActions } from "./HeaderActions";

import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <AnimatedSection
        as="div"
        className={styles.inner}
        style={{
          maxWidth: LAYOUT.CONTAINER_MAX_WIDTH,
        }}
      >
        <Link href="/" className={styles.logo}>
          <Image
            src={logo}
            alt="Логотип"
            width={109}
            height={29}
          />
        </Link>

        <nav
          className={styles.nav}
          aria-label="Основное меню"
        >
          <ul className={styles.menu}>
            <li>
              <a href="#">О сервисе</a>
            </li>

            <li>
              <a href="#">Как работает</a>
            </li>

            <li>
              <a href="#">Тарифы</a>
            </li>

            <li>
              <a href="#">Партнерам</a>
            </li>

            <li>
              <a href="#">FAQ</a>
            </li>
          </ul>
        </nav>

        <HeaderActions />
      </AnimatedSection>
    </header>
  );
}