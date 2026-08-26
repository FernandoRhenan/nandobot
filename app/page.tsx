import Link from "next/link";
import styles from "@/app/page.module.css";

export default function Home() {
  return (
    <div className={styles.basicStyle}>
      <Link href="/scraper">Scraper</Link>
      <Link href="/publisher">Publisher</Link>
    </div>
  );
}
