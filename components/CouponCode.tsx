"use client";

import { useState } from "react";
import styles from "@/components/couponCode.module.css";

interface ICouponCodeProps {
  name: string;
  discount: string;
  conditions: string;
}

export default function CouponCode({
  name,
  discount,
  conditions,
}: ICouponCodeProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(name).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className={styles.coupon}>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.discount}>
          {discount}
          {conditions && ` · ${conditions}`}
        </span>
      </div>
      <button className={styles.copy} onClick={handleCopy} type="button">
        {copied ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
