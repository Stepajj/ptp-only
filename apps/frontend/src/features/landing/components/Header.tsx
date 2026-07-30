import Image from "next/image";

import { AnimatedSection } from "@/components/motion/AnimatedSection";
import { MotionButton } from "@/components/motion/MotionButton";
import { LAYOUT } from "@/constants/layout";
import logo from "@/assets/images/logo.svg";

import styles from "./Header.module.css";
import Link from "next/link";

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
        <div className={styles.logo}>
          <Image src={logo} alt="Логотип" width={109} height={29} />
        </div>

        <nav className={styles.nav} aria-label="Основное меню">
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

       <div className={styles.actions}>
  <Link href="/login" className={styles.actionLink}>
    <MotionButton type="button" className={styles.loginButton}>
      Войти
    </MotionButton>
  </Link>

  <Link href="/register" className={styles.actionLink}>
    <MotionButton type="button" className={styles.registerButton}>
      Создать аккаунт
    </MotionButton>
  </Link>
</div>
      </AnimatedSection>
    </header>
  );
}
