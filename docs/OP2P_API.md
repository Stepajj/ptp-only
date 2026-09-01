# Only P2P API (v1)

REST-API для внешних проектов. Клиенты внешнего проекта пользуются функционалом Only P2P (баланс, пополнение, реквизиты, заявки, поддержка). Вся обработка и балансы остаются на нашей стороне — клиент проекта ведёт себя как обычный пользователь Only P2P нашего бота.

## Общие правила

- Базовый адрес: `https://<домен>/op2p_api/...`
- Все эндпоинты — **POST**.
- Тело запроса — **JSON** (`Content-Type: application/json`), кроме `request_proof` (там `multipart/form-data`).
- Любой ответ — JSON вида:
  - успех: `{"success": true, ...}`
  - ошибка: `{"success": false, "error": "<описание>"}`
- Все даты/время возвращаются строками в формате **ISO 8601, UTC** (например `2026-06-14T12:30:00+00:00`).
- Доставка событий — **опрос (pull)**. Никаких Telegram-уведомлений клиентам не отправляется. Новые заявки, ответы поддержки и т.д. проект получает, периодически запрашивая соответствующие эндпоинты.

## Аутентификация

В каждом запросе обязательны:

| Поле | Тип | Описание |
|------|-----|----------|
| `api_id` | string | ID проекта (выдаётся в админке) |
| `secret_key` | string | Секретный ключ проекта |

Запросы, относящиеся к конкретному клиенту, дополнительно требуют:

| Поле | Тип | Описание |
|------|-----|----------|
| `user_id` | integer | Наш внутренний ID клиента (получен из `create_client`) |

Общие ошибки аутентификации: `api_id not provided`, `secret_key not provided`, `wrong api_id or secret_key`, `project is disabled`, `user_id not provided`, `user_id is invalid`, `client not found`.

Для эндпоинтов **списка** (`requisites`, `requests`, `support_messages`) поле `user_id` **необязательно**: если его передать — данные вернутся по одному клиенту, если не передавать — по всем клиентам проекта сразу (удобно для опроса). В таком «проектном» режиме каждый элемент ответа содержит `user_id` клиента, к которому он относится.

При внутренней ошибке любой эндпоинт возвращает `{"success": false, "error": "data error"}`.

---

## 1. Создание клиента

`POST /op2p_api/create_client`

Создаёт нового клиента проекта. Внешний ID клиента не хранится — проект сам сопоставляет свой ID с нашим `user_id`.

Запрос:

| Поле | Тип | Обяз. |
|------|-----|-------|
| `api_id` | string | да |
| `secret_key` | string | да |

Ответ:

```json
{"success": true, "user_id": 723456789012345678}
```

---

## 2. Баланс

`POST /op2p_api/balance`

Запрос: `api_id`, `secret_key`, `user_id`.

Ответ:

```json
{"success": true, "data": {
  "balance": 150000,
  "frozen": 20000,
  "total_profit": 5400
}}
```

- `balance` — баланс Only P2P клиента, RUB.
- `frozen` — заморожено в активных/спорных заявках, RUB.
- `total_profit` — суммарный профит клиента с пополнений, RUB.

---

## 3. Пополнение

`POST /op2p_api/topup`

Запрос:

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `api_id` | string | да | |
| `secret_key` | string | да | |
| `user_id` | integer | да | |
| `method` | string | да | `btc`, `ltc`, `usdt`, `cb`, `xr` |
| `amount` | number | да для `cb`/`xr` | сумма в USDT |

Для `btc`/`ltc`/`usdt` возвращается адрес для пополнения (генерируется один раз и закрепляется за клиентом):

```json
{"success": true, "data": {"method": "usdt", "address": "TXXXXXXXXXXXXXXXXXXXXXXXXXXX"}}
```

Для `cb` (CryptoBot) / `xr` (xRocket) создаётся инвойс на указанную сумму и возвращается ссылка на оплату:

```json
{"success": true, "data": {"method": "cb", "pay_url": "https://t.me/..."}}
```

Зачисление на баланс происходит автоматически после подтверждения платежа (с учётом наценки проекта). Текущий баланс проверяется через `balance`.

Ошибки: `method not provided`, `method is invalid`, `amount not provided`, `amount is invalid`, `amount is less than minimum`, `amount is greater than maximum`.

---

## 4. Список банков

`POST /op2p_api/banks`

Запрос: `api_id`, `secret_key`.

Ответ — банки, доступные для создания реквизитов:

```json
{"success": true, "data": [
  {"id": 12, "name": "Сбербанк", "tier_1": true},
  {"id": 15, "name": "Т-Банк", "tier_1": true}
]}
```

`id` используется как `bank_id` при создании реквизита.

---

## 5. Список реквизитов

`POST /op2p_api/requisites`

Запрос: `api_id`, `secret_key`, `user_id` (необязательно).

- С `user_id` — реквизиты одного клиента.
- Без `user_id` — реквизиты всех клиентов проекта (для опроса).

Ответ:

```json
{"success": true, "data": [
  {
    "requisite_id": 501,
    "user_id": 723456789012345678,
    "card": "2200 1234 5678 9012",
    "phone": "+7 900 123 45 67",
    "fio": "Иван Иванов",
    "bank": "Сбербанк",
    "bank_id": 12,
    "tier_1": true,
    "status": "on",
    "method": "both",
    "min_amount": 1000,
    "max_amount": 50000,
    "limit_amount": 200000,
    "limit_amount_minutes": 1440,
    "exact_amount_only": false
  }
]}
```

- `user_id` — клиент-владелец реквизита.
- `status` — `on` (в работе) или `off`.
- `method` — при `on`: `both` (карта+СБП), `card`, `sbp`; при `off`: `null`.
- `card`/`phone` — `"-"`, если не задано.

---

## 6. Создание реквизита

`POST /op2p_api/requisite_create`

Запрос:

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `api_id` | string | да | |
| `secret_key` | string | да | |
| `user_id` | integer | да | |
| `bank_id` | integer | да | из `banks` |
| `fio` | string | да | ФИО владельца |
| `phone` | string | одно из | телефон (10–12 цифр) |
| `card` | string | одно из | номер карты (16 цифр) |

Нужно передать как минимум одно из `phone` / `card` (можно оба). Карта проверяется по контрольной сумме, BIN и на дубликат.

Ответ:

```json
{"success": true, "data": {"requisite_id": 501}}
```

Реквизит создаётся выключенным (`off`). Включение — через `requisite_edit`.

Ошибки: `bank_id not provided`, `bank_id is invalid`, `bank not found`, `fio not provided`, `fio is empty`, `phone or card must be provided`, `phone is invalid`, `card is invalid`, `card bin is not allowed`, `card already added`.

---

## 7. Редактирование реквизита (настройки)

`POST /op2p_api/requisite_edit`

Все настройки реквизита меняются через этот эндпоинт. Передавайте только те поля, которые нужно изменить.

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `api_id` | string | да | |
| `secret_key` | string | да | |
| `user_id` | integer | да | |
| `requisite_id` | integer | да | |
| `status` | string | нет | `on` / `off` |
| `min_amount` | integer | нет | мин. сумма заявки, RUB |
| `max_amount` | integer | нет | макс. сумма заявки, RUB |
| `limit_amount` | integer | нет | лимит суммы заявок, RUB (вместе с `limit_amount_minutes`) |
| `limit_amount_minutes` | integer | нет | период лимита, минут (1–1440) |
| `exact_amount_only` | bool | нет | принимать только точную сумму |
| `reset_limits` | bool | нет | `true` — сбросить все лимиты |

- `limit_amount` и `limit_amount_minutes` передаются **только вместе**.
- `min_amount`/`max_amount` должны быть в пределах общих лимитов системы.
- `limit_amount`: 1000–100000000; `limit_amount_minutes`: 1–1440.

Ответ: `{"success": true}`

Ошибки: `requisite_id not provided`, `requisite_id is invalid`, `requisite not found`, `status is invalid`, `turning on requisites is disabled`, `min_amount is invalid`, `min_amount is less than minimum`, `min_amount is greater than maximum`, `max_amount is invalid`, `max_amount is less than minimum`, `max_amount is greater than maximum`, `exact_amount_only is invalid`, `reset_limits is invalid`, `limit_amount and limit_amount_minutes must be provided together`, `limit_amount is invalid`, `limit_amount is less than minimum`, `limit_amount is greater than maximum`, `limit_amount_minutes is invalid`, `limit_amount_minutes is less than minimum`, `limit_amount_minutes is greater than maximum`.

---

## 8. Удаление реквизита

`POST /op2p_api/requisite_delete`

Запрос: `api_id`, `secret_key`, `user_id`, `requisite_id`.

Ответ: `{"success": true}`

Ошибки: `requisite_id not provided`, `requisite_id is invalid`, `requisite not found`.

---

## 9. Список заявок

`POST /op2p_api/requests`

Запрос:

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `api_id` | string | да | |
| `secret_key` | string | да | |
| `user_id` | integer | нет | если не указан — заявки всех клиентов проекта |
| `status` | string | нет | фильтр: `waiting`, `cancelled`, `finished` |

Ответ (последние заявки, до 200; с `user_id` — одного клиента, без него — всех клиентов проекта):

```json
{"success": true, "data": [
  {
    "id": "a1b2c3d4e5",
    "user_id": 723456789012345678,
    "amount_rub": 5000,
    "received_rub_amount": null,
    "requisite_id": 501,
    "requisite": "2200 1234 5678 9012",
    "fio": "Иван Иванов",
    "bank": "Сбербанк",
    "method": "card",
    "status": "cancelled",
    "awaiting_proof": true,
    "deadline": "2026-06-14T12:45:00+00:00",
    "created": "2026-06-14T12:30:00+00:00",
    "date_finished": null
  }
]}
```

- `user_id` — клиент, которому принадлежит заявка.
- `status` — `waiting` (ждёт оплаты), `cancelled` (отменена), `finished` (завершена).
- `awaiting_proof` — `true`, если заявка отменена и ждёт подтверждения или пруфа от клиента до `deadline`. Если ничего не сделать до `deadline`, заявка автоматически закрывается как завершённая.
- `method` — `card` или `sbp`. `requisite` — карта или телефон в зависимости от метода.

### Жизненный цикл заявки

1. Заявка приходит со статусом `waiting`. Клиент должен подтвердить получение оплаты (`request_confirm`).
2. Если клиент не подтвердил вовремя, заявка переходит в `cancelled` с `awaiting_proof: true` и `deadline` (≈15 минут). В этом окне клиент может:
   - подтвердить, что оплата всё же получена — `request_confirm` (полной или другой суммой), либо
   - залить пруф — `request_proof`.
3. Если за окно ничего не сделано — заявка автоматически завершается на полную сумму.

---

## 10. Подтверждение заявки

`POST /op2p_api/request_confirm`

Подтверждение получения оплаты (для `waiting` и для отменённых `cancelled`, ожидающих решения).

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `api_id` | string | да | |
| `secret_key` | string | да | |
| `user_id` | integer | да | |
| `request_id` | string | да | `id` заявки |
| `amount` | integer | нет | другая полученная сумма, RUB |

- Без `amount` — заявка завершается на полную сумму заявки.
- С `amount` — завершается на другую сумму. Сумма должна быть в допустимых пределах завершения (мин./макс. коэффициент от суммы заявки, как в боте).

Ответ: `{"success": true}`

Ошибки: `request_id not provided`, `request not found`, `request already finished`, `amount is invalid`, `amount is less than allowed`, `amount is greater than allowed`.

---

## 11. Загрузка пруфа

`POST /op2p_api/request_proof`

**`Content-Type: multipart/form-data`.** Используется для спорных (отменённых, `awaiting_proof: true`) заявок.

Поля формы:

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `api_id` | string | да | |
| `secret_key` | string | да | |
| `user_id` | integer | да | |
| `request_id` | string | да | `id` заявки |
| `file` | файл | да | видео или PDF |

Допустимые файлы: видео (`.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`, `.m4v`, `.gif`) или `.pdf`.

Ответ: `{"success": true}`

После загрузки пруф уходит на рассмотрение; заявка остаётся замороженной до решения оператора.

Ошибки: `request_id not provided`, `file not provided`, `request not found`, `request is not awaiting proof`, `proof already sent or request finished`, `file must be a video or a pdf`.

---

## 12. Отправка сообщения в поддержку

`POST /op2p_api/support_send`

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `api_id` | string | да | |
| `secret_key` | string | да | |
| `user_id` | integer | да | |
| `text` | string | да | текст (до 4000 символов) |

Поддержка — только текст. Сообщение попадает оператору; ответы оператора клиент получает через `support_messages`.

Ответ: `{"success": true}`

Ошибки: `text not provided`, `text is empty`, `text is too long`.

---

## 13. Получение переписки с поддержкой

`POST /op2p_api/support_messages`

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `api_id` | string | да | |
| `secret_key` | string | да | |
| `user_id` | integer | нет | если не указан — сообщения всех клиентов проекта |
| `after_id` | integer | нет | вернуть только сообщения с `id` больше указанного |

Ответ (обе стороны переписки, по возрастанию `id`, до 1000 за запрос):

```json
{"success": true, "data": [
  {"id": 10, "user_id": 723456789012345678, "from_operator": false, "text": "Здравствуйте", "created": "2026-06-14T12:00:00+00:00"},
  {"id": 11, "user_id": 723456789012345678, "from_operator": true, "text": "Слушаю вас", "created": "2026-06-14T12:01:00+00:00"}
]}
```

- `user_id` — клиент, к чьей переписке относится сообщение.
- `from_operator` — `true`, если сообщение от оператора поддержки; `false`, если от клиента.

`id` — сквозной возрастающий идентификатор по всей системе, поэтому для опроса новых ответов (в т.ч. сразу по всему проекту) храните максимальный полученный `id` и передавайте его в `after_id`. За один запрос возвращается до 1000 сообщений — если получили ровно 1000, повторите запрос с новым `after_id`.

Ошибки: `after_id is invalid`.

---

## Пример сценария

1. `create_client` → получили `user_id`.
2. `topup` (`usdt`) → дали клиенту адрес; после зачисления `balance` показывает баланс.
3. `banks` → `requisite_create` → `requisite_edit` (`status: on`).
4. Опрос `requests` → новая `waiting` заявка → `request_confirm` (или `request_proof`, если отменена и оспаривается).
5. `support_send` / опрос `support_messages` — общение с поддержкой.
