import Link from "next/link";

import { depositDetails, depositMethods } from "@/features/deposit/mocks/deposit.mock";

import { DepositAddressCard } from "./DepositAddressCard";
import styles from "./DepositCryptoPage.module.css";

interface DepositCryptoPageProps {
  methodId: string;
}

export function DepositCryptoPage({
  methodId,
}: DepositCryptoPageProps) {
  const method = depositMethods.find(
    (item) => item.id === methodId,
  );

  const details = depositDetails[methodId];

  if (!method || !details) {
    return (
      <main className={styles.page}>
        <div className={styles.notFound}>
          Способ пополнения не найден
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Link
        href="/deposit"
        className={styles.backLink}
      >
        <span className={styles.backArrow}>
          ‹
        </span>

        <span className={styles.backText}>
          К способам пополнения
        </span>
      </Link>

      <DepositAddressCard
        method={method}
        details={details}
      />
    </main>
  );
}