"use client";

import { useState } from "react";

import type {
  DepositDetails,
  DepositMethod,
} from "@/features/deposit/model/deposit.types";

import styles from "./DepositAddressCard.module.css";

interface DepositAddressCardProps {
  method: DepositMethod;
  details: DepositDetails;
}

function isUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function DepositAddressCard({
  method,
  details,
}: DepositAddressCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(details.address);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  const iconClass = `${styles.badgeIcon} ${styles[method.variant]}`;

  return (
    <section className={styles.card}>
      <div className={styles.qrWrapper}>
        <MockQrCode value={details.address} />
      </div>

      <div className={styles.networkBadge}>
        {details.badgeIcon && (
          <span className={iconClass}>
            {details.badgeIcon}
          </span>
        )}

        <span className={styles.networkText}>
          {details.networkLabel}
        </span>
      </div>

      <div className={styles.addressSection}>
        <div className={styles.addressLabel}>
          Адрес для пополнения
        </div>

        <div className={styles.addressField}>
          <span
            className={`${styles.addressValue} ${
              isUrl(details.address)
                ? styles.urlValue
                : ""
            }`}
          >
            {details.address}
          </span>

          <button
            type="button"
            className={styles.copyButton}
            onClick={handleCopy}
            aria-label="Скопировать адрес"
          >
            <span className={styles.copyIcon}>
              ⧉
            </span>

            {copied && (
              <span className={styles.copiedTooltip}>
                Скопировано
              </span>
            )}
          </button>
        </div>
      </div>

      <div className={styles.infoList}>
        <div className={styles.infoItem}>
          <span className={styles.infoKey}>
            Минимум
          </span>

          <span className={styles.infoValue}>
            {details.minimum}
          </span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoKey}>
            Зачисление
          </span>

          <span className={styles.infoValue}>
            {details.crediting}
          </span>
        </div>
      </div>

      <div className={styles.waiting}>
        <span className={styles.spinner} />

        <span>
          Ждём поступление средств...
        </span>
      </div>
    </section>
  );
}

interface MockQrCodeProps {
  value: string;
}

function MockQrCode({ value }: MockQrCodeProps) {
  const cells = Array.from({ length: 29 * 29 }, (_, index) => {
    const row = Math.floor(index / 29);
    const col = index % 29;

    if (isFinderCell(row, col, 0, 0)) return true;
    if (isFinderCell(row, col, 0, 22)) return true;
    if (isFinderCell(row, col, 22, 0)) return true;

    const seed =
      value.charCodeAt((row * 29 + col) % value.length) +
      row * 13 +
      col * 7;

    return seed % 5 < 2;
  });

  return (
    <div
      className={styles.qr}
      role="img"
      aria-label="QR-код для пополнения"
    >
      {cells.map((filled, index) => (
        <span
          key={index}
          className={
            filled ? styles.qrCellFilled : styles.qrCell
          }
        />
      ))}
    </div>
  );
}

function isFinderCell(
  row: number,
  col: number,
  startRow: number,
  startCol: number,
) {
  if (
    row < startRow ||
    row >= startRow + 7 ||
    col < startCol ||
    col >= startCol + 7
  ) {
    return false;
  }

  const localRow = row - startRow;
  const localCol = col - startCol;

  const outer =
    localRow === 0 ||
    localRow === 6 ||
    localCol === 0 ||
    localCol === 6;

  const inner =
    localRow >= 2 &&
    localRow <= 4 &&
    localCol >= 2 &&
    localCol <= 4;

  return outer || inner;
}