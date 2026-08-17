'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  getSupportMessages,
  sendSupportMessage,
} from '@/features/support/api/support.api';
import type { SupportMessage } from '@/features/support/model/support.types';

import SupportChatHeader from './SupportChatHeader';
import SupportChatMessages from './SupportChatMessages';
import SupportChatInput from './SupportChatInput';

import styles from './SupportChatPage.module.css';

export default function SupportChatPage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');

  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const lastMessageId = useMemo(() => {
    if (!messages.length) {
      return undefined;
    }

    return messages[messages.length - 1].id;
  }, [messages]);

  const loadMessages = useCallback(async (afterId?: number) => {
    try {
      const response = await getSupportMessages(afterId);

      if (!response.success) {
        return;
      }

      if (afterId === undefined) {
        setMessages(response.data);
        return;
      }

      if (!response.data.length) {
        return;
      }

      setMessages((current) => {
        const existingIds = new Set(current.map((message) => message.id));

        const newMessages = response.data.filter(
          (message) => !existingIds.has(message.id),
        );

        if (!newMessages.length) {
          return current;
        }

        return [...current, ...newMessages];
      });
    } catch (error) {
      console.error('Failed to load support messages:', error);
    }
  }, []);

  useEffect(() => {
    const initializeMessages = async () => {
      setIsLoading(true);

      try {
        await loadMessages();
      } finally {
        setIsLoading(false);
      }
    };

    initializeMessages();
  }, [loadMessages]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (lastMessageId === undefined) {
        return;
      }

      loadMessages(lastMessageId);
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [lastMessageId, loadMessages]);

  const handleSendMessage = async (text: string) => {
    setIsSending(true);

    try {
      const response = await sendSupportMessage(text);

      if (!response.success) {
        return;
      }

      await loadMessages(lastMessageId);
    } catch (error) {
      console.error('Failed to send support message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className={styles.page}>
      <a className={styles.backLink} href="/support">
        <span className={styles.backIcon} aria-hidden="true">
          ‹
        </span>

        <span>К темам поддержки</span>
      </a>

      <section className={styles.chat}>
        <SupportChatHeader topic={topic} />

        <SupportChatMessages
          messages={messages}
          isLoading={isLoading}
        />

        <SupportChatInput
          isSending={isSending}
          onSend={handleSendMessage}
        />
      </section>
    </main>
  );
}