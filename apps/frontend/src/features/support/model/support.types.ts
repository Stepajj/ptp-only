export type SupportTopicId =
  | "order"
  | "requisites"
  | "deposit"
  | "partnership";

export interface SupportTopic {
  id: SupportTopicId;
  title: string;
  description: string;
  icon: string ;
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

export interface SupportMessage {
  id: number;
  user_id?: number | string;
  from_operator: boolean;
  text: string;
  created: string;
}

export interface SupportMessagesResponse {
  success: boolean;
  data: SupportMessage[];
}

export interface SupportSendResponse {
  success: boolean;
}
