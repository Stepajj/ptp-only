import type {
  SupportData,
  SupportMessage,
} from "../model/support.types";

export const supportMock: SupportData = {
  topics: [
    {
      id: "order",
      title: "Проблема с заявкой",
      description: "Перевод не пришёл, спор по сумме",
      icon: "⇄",
    },
    {
      id: "requisites",
      title: "Реквизиты и лимиты",
      description: "Блокировки, привязка карты",
      icon: "▤",
    },
    {
      id: "deposit",
      title: "Пополнение",
      description: "Не зачислилась крипта",
      icon: "+",
    },
    {
      id: "partnership",
      title: "Партнёрство",
      description: "White Label, API",
      icon: "⚒",
    },
  ],

  faq: [
    {
      id: "faq-1",
      question: "Почему подтверждения даю я, а не плательщик?",
      answer:
        "Деньги приходят на вашу карту — вы первым видите перевод. Это защищает от ложных заявок.",
    },
    {
      id: "faq-2",
      question: "Что делать, если деньги не пришли?",
      answer:
        "Нажмите «Денег нет» → заявка отменится. В течение 25 минут можно подтвердить задним числом или приложить пруф.",
    },
    {
      id: "faq-3",
      question: "Почему баланс в рублях?",
      answer:
        "Пополнение сразу конвертируется по курсу с премией +7%. Вы работаете с фиксированной рублёвой суммой.",
    },
    {
      id: "faq-4",
      question: "Можно ли вывести крипту обратно?",
      answer:
        "Нет. Заработанные рубли выводятся через приём входящих заявок на карту или СБП.",
    },
  ],
};

export const supportMessagesMock: SupportMessage[] = [
  {
    id: 1,
    user_id: 48213,
    from_operator: true,
    text: "Здравствуйте! Опишите проблему — оператор ответит в течение нескольких минут.",
    created: "2026-08-17T01:00:00+00:00",
  },
  {
    id: 2,
    user_id: 48213,
    from_operator: false,
    text: "Банк отклонил входящий перевод по заявке #10482, что делать?",
    created: "2026-08-17T01:01:00+00:00",
  },
];