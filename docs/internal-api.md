# Internal API reference (Only P2P endpoints)

Ниже приведён перечень реальных внешних эндпоинтов Only P2P, как описано в `OP2P_API.md`.
Этот файл не придумывает новые пути — он копирует спецификацию внешнего API для использования внутри Backend (Backend вызывает эти эндпоинты).

Базовый адрес: `https://<домен>/op2p_api/...`

Общие правила

- Все эндпоинты — POST.
- Тело запроса — JSON (`Content-Type: application/json`), кроме `request_proof` (там `multipart/form-data`).
- Любой ответ — JSON:
  - успех: `{"success": true, ...}`
  - ошибка: `{"success": false, "error": "<описание>"}`
- Все даты/время — ISO 8601, UTC.
- Аутентификация каждого запроса: `api_id` и `secret_key`.

Примечание: для некоторых клиентских операций требуется дополнительно `user_id` (внутренний ID клиента, получаемый через `create_client`).

Список эндпоинтов

1) `POST /op2p_api/create_client`
   - Описание: создаёт клиента в системе Only P2P.
   - Обязательные поля: `api_id`, `secret_key`.
   - Пример ответа:
     ```json
     {"success": true, "user_id": 723456789012345678}
     ```

2) `POST /op2p_api/balance`
   - Описание: возвращает баланс клиента.
   - Поля: `api_id`, `secret_key`, `user_id`.
   - Пример ответа:
     ```json
     {"success": true, "data": {"balance": 150000, "frozen": 20000, "total_profit": 5400}}
     ```

3) `POST /op2p_api/topup`
   - Описание: запрос на пополнение; поведение зависит от `method`.
   - Поля: `api_id`, `secret_key`, `user_id`, `method`, `amount` (для `cb`/`xr` обязательна сумма в USDT).
   - Возможные методы: `btc`, `ltc`, `usdt`, `cb`, `xr`.
   - Примеры ответов:
     - Для крипто-адреса:
       ```json
       {"success": true, "data": {"method": "usdt", "address": "TXXXXXXXXXXXXXXXXXXXXXXXXXXX"}}
       ```
     - Для инвойса (`cb`/`xr`):
       ```json
       {"success": true, "data": {"method": "cb", "pay_url": "https://t.me/..."}}
       ```

4) `POST /op2p_api/banks`
   - Описание: возвращает список банков, доступных для создания реквизитов.
   - Поля: `api_id`, `secret_key`.
   - Пример ответа:
     ```json
     {"success": true, "data": [{"id": 12, "name": "Сбербанк", "tier_1": true}]}
     ```

5) `POST /op2p_api/requisites`
   - Описание: список реквизитов. `user_id` необязателен — если отсутствует, возвращаются реквизиты всех клиентов проекта.
   - Поля: `api_id`, `secret_key`, `user_id` (необязательно).
   - Пример ответа приведён в `OP2P_API.md` (масcив реквизитов с полями `requisite_id`, `user_id`, `card`, `phone`, `fio`, `bank`, `bank_id`, `status`, `method`, `min_amount`, `max_amount`, `limit_amount`, `limit_amount_minutes`, `exact_amount_only`).

6) `POST /op2p_api/requisite_create`
   - Описание: создать реквизит.
   - Обязательные поля: `api_id`, `secret_key`, `user_id`, `bank_id`, `fio`; минимум одно из `phone`/`card`.
   - Создаёт реквизит в статусе `off`.
   - Пример ответа:
     ```json
     {"success": true, "data": {"requisite_id": 501}}
     ```

7) `POST /op2p_api/requisite_edit`
   - Описание: редактирование настроек реквизита. Передавать только изменяемые поля.
   - Обязательные поля: `api_id`, `secret_key`, `user_id`, `requisite_id`.
   - Поддерживаемые поля: `status`, `min_amount`, `max_amount`, `limit_amount`, `limit_amount_minutes`, `exact_amount_only`, `reset_limits`.
   - Примечание: `limit_amount` и `limit_amount_minutes` передаются только вместе.
   - Ответ: `{"success": true}`

8) `POST /op2p_api/requisite_delete`
   - Описание: удалить реквизит.
   - Поля: `api_id`, `secret_key`, `user_id`, `requisite_id`.
   - Ответ: `{"success": true}`

### Локальный мониторинг включённых реквизитов

Backend периодически опрашивает Only P2P и хранит состояние мониторинга в PostgreSQL. Если включённый реквизит 30 минут не получил ни одной заявки, authenticated frontend получает предупреждение через `GET /requisites/monitoring`. Пользователь может ответить через `POST /requisites/:requisiteId/monitoring` с телом `{"keepEnabled": true|false}`. При отсутствии ответа 10 минут backend вызывает документированный `requisite_edit` со статусом `off`. Ответ `true` запускает новый 30-минутный период наблюдения.

Этот механизм является локальной политикой проекта и не зависит от открытой вкладки. Он не изменяет правила Only P2P и не должен считаться заменой внешнего жизненного цикла заявки.

9) `POST /op2p_api/requests`
   - Описание: получить список заявок. `user_id` необязателен (по всем клиентам проекта).
   - Поля: `api_id`, `secret_key`, `user_id` (необязательно), `status` (необязательно: `waiting`, `cancelled`, `finished`).
   - Ответ: массив заявок (до 200), см. `OP2P_API.md`.

10) `POST /op2p_api/request_confirm`
    - Описание: подтвердить получение оплаты для `waiting` или `cancelled` (в ожидании решения).
    - Поля: `api_id`, `secret_key`, `user_id`, `request_id`, `amount` (необязательно — если отсутствует, завершается на полную сумму).
    - Ответ: `{"success": true}`

11) `POST /op2p_api/request_proof` (multipart/form-data)
    - Описание: загрузка пруфа (видео или PDF) для спорных заявок (`awaiting_proof: true`).
    - Поля формы: `api_id`, `secret_key`, `user_id`, `request_id`, `file` (видео или pdf).
    - Допустимые файлы: `.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`, `.m4v`, `.gif`, `.pdf`.
    - Ответ: `{"success": true}`

12) `POST /op2p_api/support_send`
    - Описание: отправка сообщения в поддержку.
    - Поля: `api_id`, `secret_key`, `user_id`, `text` (до 4000 символов).
    - Ответ: `{"success": true}`

13) `POST /op2p_api/support_messages`
    - Описание: получение переписки с поддержкой. `user_id` необязателен (если отсутствует — сообщения по всем клиентам проекта).
    - Поля: `api_id`, `secret_key`, `user_id` (необязательно), `after_id` (необязательно).
    - Ответ: массив сообщений (по возрастанию `id`, до 1000 за запрос), каждое сообщение содержит `id`, `user_id`, `from_operator`, `text`, `created`.

Пример сценария использования (из `OP2P_API.md`):

1. `create_client` → получили `user_id`.
2. `topup` (`usdt`) → дали клиенту адрес; после зачисления проверяем `balance`.
3. `banks` → `requisite_create` → `requisite_edit` (`status: on`).
4. Опрос `requests` → новая `waiting` заявка → `request_confirm` или `request_proof`.
5. `support_send` / опрос `support_messages` — переписка с поддержкой.

Ошибки и коды ошибок описаны в оригинальном `OP2P_API.md` и не повторяются здесь — см. исходный документ для полного списка ошибок по эндпоинтам.

---

Файл создан как точная выжимка внешней спецификации Only P2P; никаких внутренних, дополнительных или вымышленных эндпоинтов не добавлено.
