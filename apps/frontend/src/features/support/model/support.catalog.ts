import type { SupportData } from './support.types';

import Plus from '../../../app/(protected)/support/assets/icons/plusTopic.svg';
import ProblemArrows from '../../../app/(protected)/support/assets/icons/problemArrows.svg';
import CardIcon from '../../../app/(protected)/support/assets/icons/cardIcon.svg';
import Handshake from '../../../app/(protected)/support/assets/icons/handshake.svg';

export const supportCatalog: SupportData = {
  topics: [
    { id: 'order', title: 'Проблема с заявкой', description: 'Перевод не пришёл, спор по сумме', icon: ProblemArrows },
    { id: 'requisites', title: 'Реквизиты и лимиты', description: 'Блокировки, привязка карты', icon: CardIcon },
    { id: 'deposit', title: 'Пополнение', description: 'Не зачислилась крипта', icon: Plus },
    { id: 'partnership', title: 'Партнёрство', description: 'White Label, API', icon: Handshake},
  ],
  faq: [
    { id: 'faq-1', question: 'Почему подтверждения даю я, а не плательщик?', answer: 'Деньги приходят на вашу карту — вы первым видите перевод. Это защищает от ложных заявок.' },
    { id: 'faq-2', question: 'Что делать, если деньги не пришли?', answer: 'Если перевод не поступил, не подтверждайте заявку. При спорной заявке используйте доступное действие подтверждения или загрузки пруфа.' },
    { id: 'faq-3', question: 'Почему баланс в рублях?', answer: 'Баланс и входящие заявки в OnlyP2P учитываются в рублях.' },
    { id: 'faq-4', question: 'Можно ли вывести крипту обратно?', answer: 'Доступные операции определяются правилами OnlyP2P и текущими возможностями проекта.' },
  ],
};
