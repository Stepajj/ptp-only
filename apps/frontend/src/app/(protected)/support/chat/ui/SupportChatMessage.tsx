import type { SupportMessage } from '@/features/support/model/support.types';

import styles from './SupportChatMessage.module.css';

interface SupportChatMessageProps {
  message: SupportMessage;
}

export default function SupportChatMessage({
  message,
}: SupportChatMessageProps) {
  const isOperatorMessage = message.from_operator;

  return (
    <div
      className={`${styles.messageRow} ${
        isOperatorMessage
          ? styles.messageRowOperator
          : styles.messageRowUser
      }`}
    >
      <div
        className={`${styles.message} ${
          isOperatorMessage
            ? styles.messageOperator
            : styles.messageUser
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}