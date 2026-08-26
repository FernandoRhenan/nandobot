import styles from "@/components/groupSelector.module.css";
import { IWhatsappGroup } from "@/app/api/v1/whatsapp/groups/route";
import Text from "@/components/Text";

interface IGroupSelectorProps {
  groups: IWhatsappGroup[];
  selectedGroupIds: string[];
  onChange: (groupIds: string[]) => void;
}

export default function GroupSelector({
  groups,
  selectedGroupIds,
  onChange,
}: IGroupSelectorProps) {
  function toggleGroup(groupId: string) {
    const isSelected = selectedGroupIds.includes(groupId);
    const nextSelectedGroupIds = isSelected
      ? selectedGroupIds.filter((id) => id !== groupId)
      : [...selectedGroupIds, groupId];

    onChange(nextSelectedGroupIds);
  }

  return (
    <div className={styles.groupList}>
      {groups.map((group) => (
        <label key={group.id} className={styles.groupItem}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={selectedGroupIds.includes(group.id)}
            onChange={() => toggleGroup(group.id)}
          />
          <span className={styles.groupInfo}>
            <Text size={13}>{group.subject}</Text>
            <Text size={12} color="faint">
              {group.size} participantes
            </Text>
          </span>
        </label>
      ))}
    </div>
  );
}
