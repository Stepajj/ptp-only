import type { ReactNode } from 'react';
import styles from './AuthLayout.module.css';
import logo from '../../../assets/images/logo.svg';
import CoinsImage from '../../../assets/images/loginIMG.svg';
import Image from 'next/image';
import { AuthTabs } from '../AuthTabs/AuthTabs';

interface Props {
  children: ReactNode;
}

export function AuthLayout({ children }: Props) {
  return (
    <main className={styles.root}>
      <section className={styles.left}>
        <div className={styles.pinkBlur} />
        <div className={styles.blueBlur} />
        <header className={styles.logo}>
          <Image src={logo} alt="Логотип" width={109} height={29} />
        </header>

        <div className={styles.illustration}>
          <Image src={CoinsImage} alt="Логотип"  />
        </div>

        <footer className={styles.info}>
          <h2 className={styles.title}>
            Продавайте крипту
            <br />
            на 7% выше курса
          </h2>

          <p className={styles.description}>
            73 000 пользователей • 6 лет стабильной работы • часть экосистемы
            only
          </p>
        </footer>
      </section>

      <section className={styles.right}>
        <div className={styles.content}>
            <AuthTabs/>
            {children}
            
            </div>
      </section>
    </main>
  );
}