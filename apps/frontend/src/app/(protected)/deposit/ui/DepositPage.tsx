import { depositMethods } from "@/features/deposit/model/deposit.catalog";

import { DepositMethods } from "./DepositMethods";
import { DepositNotice } from "./DepositNotice";
import styles from "./DepositPage.module.css";

export function DepositPage() {
  return (
    <main className={styles.page}>
      <DepositNotice />

      <DepositMethods methods={depositMethods} />
    </main>
  );
}
