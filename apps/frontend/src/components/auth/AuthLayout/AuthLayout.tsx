import type { ReactNode } from 'react';
import styles from './AuthLayout.module.css';
import logo from '../../../assets/images/logo.svg';
import CoinsImage from '../../../assets/images/loginIMG.svg';
import Image from 'next/image';
import { AuthTabs } from '../AuthTabs/AuthTabs';
import Link from 'next/link';


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
          <Link href="/" className={styles.logoLink}>
            <Image
              src={logo}
              alt="Логотип"
              width={109}
              height={29}
              priority
            />
          </Link>
        </header>

        <div className={styles.illustration}>
          <Image src={CoinsImage} alt="Логотип"  />
        </div>

        <footer className={styles.info}>
          <h2 className={styles.title}>
            Работайте с криптовалютой
            <br />
            через инфраструктуру OnlyP2P
          </h2>

          <p className={styles.description}>
            Пополнение, реквизиты, заявки и поддержка в одном кабинете.
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
