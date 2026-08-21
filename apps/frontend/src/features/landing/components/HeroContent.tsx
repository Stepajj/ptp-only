"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

import { MotionButton } from "@/components/motion/MotionButton";
import heroImage from "@/assets/images/HeroImage.png";
import { fadeUpInView, heroImageDelay, staggerDelay } from "@/lib/animations";

import styles from "./Hero.module.css";

export function HeroContent() {
  return (
    <>
      <motion.div
        className={styles.container}
        {...fadeUpInView(0 * staggerDelay)}
      >
        <div className={styles.item}>
          <span className={styles.dot}></span>
          <span className={styles.text}>БЕЗ KYC</span>
          <span className={`${styles.dot} ${styles.gray}`}></span>
        </div>

        <div className={styles.item}>
          <span className={styles.text}>БЕЗ ОЖИДАНИЯ</span>
        </div>
      </motion.div>

      <motion.h1 className={styles.title} {...fadeUpInView(1 * staggerDelay)}>
        Сервис работы с криптовалютой <br /> через инфраструктуру OnlyP2P
      </motion.h1>

      <motion.p className={styles.subtitle} {...fadeUpInView(2 * staggerDelay)}>
        Пополнение, реквизиты, входящие заявки и поддержка доступны в одном
        кабинете через backend-интеграцию с OnlyP2P.
      </motion.p>

      <motion.div
        className={styles.actions}
        {...fadeUpInView(3 * staggerDelay)}
      >
        <Link href="/register" className={styles.actionLink}>
          <MotionButton type="button">Создать аккаунт</MotionButton>
        </Link>
        <a href="#about-service" className={styles.actionLink}>
          <MotionButton type="button">Подробнее о сервисе</MotionButton>
        </a>
      </motion.div>

      <motion.p className={styles.note} {...fadeUpInView(4 * staggerDelay)}>
        Фактические лимиты и способы пополнения загружаются из OnlyP2P.
      </motion.p>

      <motion.div {...fadeUpInView(heroImageDelay)}>
        <Image
          src={heroImage}
          alt="Интерфейс сервиса ONLYp2p"
          className={styles.heroImage}
          priority
        />
      </motion.div>
    </>
  );
}
