import styles from "@/components/discountTypeSelect.module.css";
import { DiscountType } from "@/app/api/v1/coupons/route";

const discountTypeOptions: { value: DiscountType; label: string }[] = [
  { value: "percentage", label: "Porcentagem (%)" },
  { value: "fixed", label: "Valor fixo (R$)" },
];

interface IDiscountTypeSelectProps {
  value: DiscountType;
  onChange: (value: DiscountType) => void;
}

export default function DiscountTypeSelect({
  value,
  onChange,
}: IDiscountTypeSelectProps) {
  return (
    <select
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value as DiscountType)}
    >
      {discountTypeOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
