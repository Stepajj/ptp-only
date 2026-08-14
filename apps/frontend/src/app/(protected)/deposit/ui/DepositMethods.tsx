import type { DepositMethod } from "@/features/deposit/model/deposit.types";

import { DepositMethodCard } from "./DepositMethodCard";
import styles from "./DepositMethods.module.css";

interface DepositMethodsProps {
  methods: DepositMethod[];
}

export function DepositMethods({
  methods,
}: DepositMethodsProps) {
  return (
    <div className={styles.grid}>
      {methods.map((method) => (
        <DepositMethodCard
          key={method.id}
          method={method}
        />
      ))}
    </div>
  );
}