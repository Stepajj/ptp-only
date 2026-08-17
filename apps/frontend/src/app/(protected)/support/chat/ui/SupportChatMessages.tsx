import type { SupportMessage } from '@/features/support/model/support.types';

import SupportChatMessage from './SupportChatMessage';

import styles from './SupportChatMessages.module.css';

interface SupportChatMessagesProps {
  messages: SupportMessage[];
  isLoading: boolean;
}

export default function SupportChatMessages({
  messages,
  isLoading,
}: SupportChatMessagesProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.messages}>
        {isLoading ? (
          <div className={styles.state}>
            Загрузка сообщений...
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.state}>
            Сообщений пока нет
          </div>
        ) : (
          messages.map((message) => (
            <SupportChatMessage
              key={message.id}
              message={message}
            />
          ))
        )}
      </div>
    </div>
  );
}