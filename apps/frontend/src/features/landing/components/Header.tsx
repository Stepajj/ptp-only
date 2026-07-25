import { Container } from "@/components/Container/Container";
import styles from "./Header.module.css";
import { LAYOUT } from "@/constants/layout";
import Image from 'next/image'
import logo from "@/assets/images/logo.svg";


export function Header() {
  return (
    <header className={styles.header}>
    
        <div className={styles.inner} style={{
                maxWidth: LAYOUT.CONTAINER_MAX_WIDTH,}}>

         
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
            <button type="button">Войти</button>
            <button type="button">Создать аккаунт</button>
          </div>
        </div>
   
   

    </header>
  );
}
