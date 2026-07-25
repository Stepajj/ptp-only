import styles from "./AboutService.module.css";

type SectionHeaderProps = {
  badge: string;
  children: React.ReactNode;
  badgeStyle?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
};

export function SectionHeader({
  badge,
  children,
  badgeStyle,
  titleStyle,
}: SectionHeaderProps) {
  return (
    <>
      <span
        style={badgeStyle}
        className={styles.aboveTitle}
      >
        {badge}
      </span>

      <h2
        style={titleStyle}
        className={styles.title}
      >
        {children}
      </h2>
    </>
  );
}