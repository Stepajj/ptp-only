"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { AnimatedSection } from "@/components/motion/AnimatedSection";
import { LAYOUT } from "@/constants/layout";
import logo from "@/assets/images/logo.svg";

import { HeaderActions } from "./HeaderActions";

import styles from "./Header.module.css";

export function Header() {
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const closeMobileMenu = () => mobileMenuRef.current?.removeAttribute("open");

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
              <a href="#about-service">О сервисе</a>
            </li>

            <li>
              <a href="#how-it-works">Как работает</a>
            </li>

            <li>
              <a href="#limits">Тарифы</a>
            </li>

            <li>
              <a href="https://t.me/O_onlypays" target="_blank" rel="noreferrer">Партнёрам</a>
            </li>

            <li>
              <a href="#faq">FAQ</a>
            </li>
          </ul>
        </nav>

        <details ref={mobileMenuRef} className={styles.mobileMenu}>
          <summary aria-label="Открыть меню" className={styles.mobileMenuButton}>
            <span />
            <span />
            <span />
          </summary>
          <nav className={styles.mobileNav} aria-label="Мобильное меню">
            <a href="#about-service" onClick={closeMobileMenu}>О сервисе</a>
            <a href="#how-it-works" onClick={closeMobileMenu}>Как работает</a>
            <a href="#limits" onClick={closeMobileMenu}>Тарифы</a>
            <a href="https://t.me/O_onlypays" target="_blank" rel="noreferrer" onClick={closeMobileMenu}>Партнёрам</a>
            <a href="#faq" onClick={closeMobileMenu}>FAQ</a>
            <a href="/login" onClick={closeMobileMenu}>Войти</a>
            <a href="/register" onClick={closeMobileMenu}>Создать аккаунт</a>
          </nav>
        </details>

        <HeaderActions />
      </AnimatedSection>
    </header>
  );
}
