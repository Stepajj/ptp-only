'use client';

import { FormEvent, useState } from 'react';

import styles from './SupportChatInput.module.css';

interface SupportChatInputProps {
  isSending: boolean;
  onSend: (text: string) => Promise<void>;
}

export default function SupportChatInput({
  isSending,
  onSend,
}: SupportChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = value.trim();

    if (!text || isSending) {
      return;
    }

    await onSend(text);

    setValue('');
  };

  return (
    <form
      className={styles.footer}
      onSubmit={handleSubmit}
    >
      <input
        className={styles.input}
        type="text"
        value={value}
        maxLength={4000}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Напишите сообщение..."
        disabled={isSending}
      />

      <button
        className={styles.button}
        type="submit"
        disabled={isSending || !value.trim()}
      >
        {isSending ? 'Отправка...' : 'Отправить'}
      </button>
    </form>
  );
}