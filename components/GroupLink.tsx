import Image from "next/image";
import Link from "next/link";
import styles from "@/components/groupLink.module.css";

interface IGroupLinkProps {
  href: string;
  imageSrc: string;
  name: string;
}

export default function GroupLink({ href, imageSrc, name }: IGroupLinkProps) {
  return (
    <Link className={styles.groupLink} href={href}>
      <span className={styles.avatarCard}>
        <Image
          className={styles.avatar}
          src={imageSrc}
          alt={name}
          width={200}
          height={200}
        />
      </span>
      <span className={styles.name}>{name}</span>
    </Link>
  );
}
