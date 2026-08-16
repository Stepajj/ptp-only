export type SupportTopicId =
  | "order"
  | "requisites"
  | "deposit"
  | "partnership";

export interface SupportTopic {
  id: SupportTopicId;
  title: string;
  description: string;
  icon: string;
}

export interface SupportFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SupportData {
  topics: SupportTopic[];
  faq: SupportFaqItem[];
}