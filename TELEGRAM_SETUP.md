# Настройка Telegram Login для приложения

## Инструкция по настройке BotFather

### 1. Создание бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям:
   - Введите имя бота (например: `YourApp Bot`)
   - Введите username бота (например: `yourapp_bot`)
4. Сохраните полученный **Bot Token**

### 2. Настройка Login Widget

1. В [@BotFather](https://t.me/BotFather) выберите вашего бота
2. Нажмите **Login Widget**
3. Добавьте **Allowed URLs**:
   - Для локальной разработки: `http://localhost:3000`
   - Для production: `https://yourdomain.com`
   - Для OIDC callback: `https://yourdomain.com/auth/callback` (если используется)
4. Сохраните **Client ID** и **Client Secret** из этого раздела

### 3. Настройка переменных окружения

#### Backend (apps/backend/.env)

```env
TELEGRAM_BOT_TOKEN=ваш_bot_token_от_шага_1
TELEGRAM_BOT_USERNAME=@ваш_username_бота
TELEGRAM_CLIENT_ID=client_id_от_шага_2
TELEGRAM_CLIENT_SECRET=client_secret_от_шага_2
```

#### Frontend (apps/frontend/.env.local)

```env
NEXT_PUBLIC_TELEGRAM_CLIENT_ID=client_id_от_шага_2
```

### 4. Важные требования

- **Allowed URLs** должны включать все домены, где будет использоваться виджет
- **Client ID** - это число, полученное в BotFather в разделе Login Widget
- **Client Secret** - также получен в BotFather в разделе Login Widget
- Bot Token используется для API вызовов, а Client ID/Secret - для OIDC

### 5. Проверка работоспособности

После настройки:
1. Запустите backend и frontend
2. Перейдите на страницу логина
3. Нажмите кнопку "Войти через Telegram"
4. Должно открыться popup окно Telegram
5. После авторизации пользователь будет перенаправлен обратно в приложение

### 6. Устранение проблем

Если сообщение не приходит в Telegram:
- Убедитесь, что Allowed URLs настроены правильно
- Проверьте, что используется актуальный Telegram Login JS API (v22+)
- Убедитесь, что Client ID и Client Secret указаны верно
- Проверьте консоль браузера на наличие ошибок

## Миграция со старого виджета

Старый виджет (data-telegram-login) устарел. Новый подход использует:
- `Telegram.Login.auth()` JS API
- OpenID Connect с ID токенами
- JWKS для верификации подписи

Все параметры старого виджета (data-request-access, data-onauth и т.д.) больше не используются.
