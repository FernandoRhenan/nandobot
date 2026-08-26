"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/components/breadcrumbs.module.css";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className={styles.breadcrumbs} aria-label="breadcrumb">
      <Link href="/" className={styles.link}>
        home
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        return (
          <span key={href} className={styles.segment}>
            <span className={styles.separator}>/</span>
            {isLast ? (
              <span className={styles.current}>{segment}</span>
            ) : (
              <Link href={href} className={styles.link}>
                {segment}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
