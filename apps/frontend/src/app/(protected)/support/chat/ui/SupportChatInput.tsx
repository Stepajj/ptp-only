'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';

import styles from './SupportChatInput.module.css';

interface SupportChatInputProps {
  isSending: boolean;
  onSend: (text: string, file: File | null) => Promise<void>;
}

export default function SupportChatInput({
  isSending,
  onSend,
}: SupportChatInputProps) {
  const [value, setValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = value.trim();

    if ((!text && !file) || isSending) {
      return;
    }

    try {
      await onSend(text, file);
    } catch {
      return;
    }

    setValue('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    if (nextFile && nextFile.size > 50 * 1024 * 1024) {
      event.target.value = '';
      return;
    }
    setFile(nextFile);
  };

  return (
    <form
      className={styles.footer}
      onSubmit={handleSubmit}
    >
      <input ref={fileInputRef} className={styles.fileInput} type="file" onChange={handleFileChange} disabled={isSending} />
      <button type="button" className={styles.attachButton} onClick={() => fileInputRef.current?.click()} disabled={isSending} aria-label="Прикрепить файл">
        +
      </button>
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
        disabled={isSending || (!value.trim() && !file)}
      >
        {isSending ? 'Отправка...' : 'Отправить'}
      </button>
      {file && <span className={styles.fileName} title={file.name}>{file.name}</span>}
    </form>
  );
}
