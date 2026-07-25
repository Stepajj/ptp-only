import { LAYOUT } from "@/constants/layout";
import styles from "./Container.module.css";

type ContainerProps = {
  children: React.ReactNode;
};

export function Container({ children }: ContainerProps) {
  return (
    <div
      className={styles.container}
      style={{
        maxWidth: LAYOUT.CONTAINER_MAX_WIDTH,
        borderLeftWidth: LAYOUT.CONTENT_BORDER_WIDTH,
        borderRightWidth: LAYOUT.CONTENT_BORDER_WIDTH,
        borderLeftColor: LAYOUT.CONTENT_BORDER_COLOR,
        borderRightColor: LAYOUT.CONTENT_BORDER_COLOR,
      }}
    >
      {children}
    </div>
  );
}
