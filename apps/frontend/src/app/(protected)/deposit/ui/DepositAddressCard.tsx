"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

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
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(details.address, { margin: 1, errorCorrectionLevel: "M", width: 220 })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => { cancelled = true; };
  }, [details.address]);

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
        {qrDataUrl ? <Image src={qrDataUrl} alt="QR-код для пополнения" width={220} height={220} unoptimized /> : <div className={styles.qrLoading}>Генерация QR-кода...</div>}
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
          {details.addressLabel}
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
          {details.waitingText}
        </span>
      </div>
    </section>
  );
}
