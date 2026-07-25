"use client";

import { motion } from "motion/react";


import { MotionButton } from "@/components/motion/MotionButton";
import { fadeUpInView, heroImageDelay, staggerDelay } from "@/lib/animations";
import Image from "next/image";
import HeroImage from "@/assets/images/HeroImage.png";

import styles from "./Hero.module.css";

export function HeroContent() {
  return (
    <>
      <motion.div className={styles.container} {...fadeUpInView(0 * staggerDelay)}>
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
        {" "}Cервис по продаже криптовалюты <br /> с доплатой{" "}
        <span>+7%</span> к курсу
      </motion.h1>

      <motion.p className={styles.subtitle} {...fadeUpInView(2 * staggerDelay)}>
        Продавай USDT, BTC и LTC в один клик. Автоматический мэтчинг
        покупателей, честный курс и прозрачные параметры.
      </motion.p>

      <motion.div className={styles.actions} {...fadeUpInView(3 * staggerDelay)}>
        <MotionButton type="button">Создать аккаунт</MotionButton>
        <MotionButton type="button">Подробнее о сервисе</MotionButton>
      </motion.div>

      <motion.p className={styles.note} {...fadeUpInView(4 * staggerDelay)}>
        Мин. 1 000 ₽ · Макс. 50 000 ₽ · Минимум пополнения — эквивалент 10
        USDT
      </motion.p>

      <motion.div {...fadeUpInView(heroImageDelay)}>
         <Image src={HeroImage} alt="Hero Image"  style={{ borderRadius: '15px', width: '1136px', height: '712px', marginTop: '50px'}} />
      </motion.div>
    </>
  );
}
