import QRCode from "react-qr-code";
import styles from "@/components/qrCodeReader.module.css";

interface IQrCodeReaderProps {
  value: string;
}

export default function QrCodeReader({ value }: IQrCodeReaderProps) {
  return (
    <div className={styles.qrCodeArea}>
      <QRCode value={value} bgColor="#ffffff" fgColor="#0a0a0a" />
    </div>
  );
}
