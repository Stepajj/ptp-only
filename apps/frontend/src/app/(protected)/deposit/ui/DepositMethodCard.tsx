import Link from "next/link";
import Image from "next/image";

import type { DepositMethod } from "@/features/deposit/model/deposit.types";

import styles from "./DepositMethodCard.module.css";

interface DepositMethodCardProps {
  method: DepositMethod;
}

export function DepositMethodCard({
  method,
}: DepositMethodCardProps) {
  return (
    <Link
      href={method.href}
      className={styles.card}
      aria-label={`Пополнить через ${method.title}`}
    >
      <div className={`${styles.icon} ${styles[method.variant]}`}>
        <Image src={method.icon} alt=""  />
        
      </div>

      <div className={styles.content}>
        <div className={styles.title}>{method.title}</div>

        <div className={styles.details}>
          {method.details.map((detail, index) => (
            <span key={detail} className={styles.detail}>
              {index > 0 && <span className={styles.dot}>•</span>}
              {detail}
            </span>
          ))}
        </div>
      </div>

      <span className={styles.arrow} aria-hidden="true">
        &gt;
      </span>
    </Link>
  );
}