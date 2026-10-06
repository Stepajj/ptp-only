'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import heroImage from '@/assets/images/HeroImage.png';
import { fadeUpInView, heroImageDelay, staggerDelay } from '@/lib/animations';
import { fallbackReferralUrl } from '@/features/content/referrals';
import styles from './Hero.module.css';


export function HeroContent() {
  return <>
    <motion.div className={styles.container} {...fadeUpInView(0 * staggerDelay)}>
      <div className={styles.item}><span className={styles.dot} /><span className={styles.text}>БЕЗ KYC</span><span className={`${styles.dot} ${styles.gray}`} /></div>
      <div className={styles.item}><span className={styles.text}>БЕЗ ОЖИДАНИЯ</span></div>
    </motion.div>
    <motion.h1 className={styles.title} {...fadeUpInView(staggerDelay)}>Сервис по продаже криптовалюты <br />с доплатой <span>+7%</span> к курсу</motion.h1>
    <motion.p className={styles.subtitle} {...fadeUpInView(2 * staggerDelay)}>Продавай USDT, BTC и LTC в один клик. Автоматический мэтчинг покупателей, честный курс и прозрачные параметры.</motion.p>
    <motion.div className={styles.actions} {...fadeUpInView(3 * staggerDelay)}>
      <Link href="/register" className={styles.actionLink} data-cta-destination="web" data-cta-placement="hero">Создать аккаунт</Link>
      <a href={fallbackReferralUrl} className={styles.actionLink} data-cta-destination="bot" data-cta-placement="hero">Открыть Telegram-бот</a>
    </motion.div>
    <motion.p className={styles.note} {...fadeUpInView(4 * staggerDelay)}>Мин. 1 000 ₽ · Макс. 50 000 ₽ · Минимум пополнения — эквивалент 10 USDT</motion.p>
    <motion.div {...fadeUpInView(heroImageDelay)}><Image src={heroImage} alt="Интерфейс сервиса OnlyP2P" className={styles.heroImage} priority /></motion.div>
  </>;
}
