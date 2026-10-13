'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import heroImage from '@/assets/images/HeroImage.png';
import { fadeUpInView, heroImageDelay, staggerDelay } from '@/lib/animations';
import styles from './Hero.module.css';


export function HeroContent() {
  return <>
    <motion.div className={styles.container} {...fadeUpInView(0 * staggerDelay)}>
      <div className={styles.item}><span className={styles.dot} /><span className={styles.text}>BTC · LTC</span><span className={`${styles.dot} ${styles.gray}`} /></div>
      <div className={styles.item}><span className={styles.text}>USDT TRC20</span></div>
    </motion.div>
    <motion.h1 className={styles.title} {...fadeUpInView(staggerDelay)}>Продайте криптовалюту за рубли с доплатой <span>+7%</span></motion.h1>
    <motion.p className={styles.subtitle} {...fadeUpInView(2 * staggerDelay)}>OnlyP2P соединяет продавцов криптовалюты и плательщиков. Пополните баланс криптовалютой, получите рубли на балансе сервиса и принимайте переводы на подключённую карту или СБП.</motion.p>
    <motion.p className={styles.subtitle} {...fadeUpInView(2 * staggerDelay)}>При конвертации OnlyP2P добавляет +7% к рассчитанной рублёвой сумме.</motion.p>
    <motion.div className={styles.actions} {...fadeUpInView(3 * staggerDelay)}>
      <Link href="/register" className={styles.actionLink} data-cta-destination="web" data-cta-placement="hero">Создать аккаунт</Link>
      <Link href="/how-it-works" className={styles.actionLink} data-cta-destination="web" data-cta-placement="hero">Как работает OnlyP2P</Link>
    </motion.div>
    <motion.div {...fadeUpInView(heroImageDelay)}><Image src={heroImage} alt="Интерфейс сервиса OnlyP2P" className={styles.heroImage} priority /></motion.div>
  </>;
}
