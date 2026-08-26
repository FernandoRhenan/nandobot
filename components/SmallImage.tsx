import Image from "next/image";
import styles from "@/components/smallImage.module.css";

interface ISmallImageProps {
  url: string;
  alt: string;
}

export default function SmallImage({ alt, url }: ISmallImageProps) {
  return (
    <Image
      className={styles.image}
      alt={alt}
      src={url}
      height={40}
      width={40}
    />
  );
}
