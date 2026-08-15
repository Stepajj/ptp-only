import { historyMock } from "@/features/history/mocks/history.mock";

import { HistoryPage } from "./ui/HistoryPage";

export default function Page() {
  return <HistoryPage data={historyMock} />;
}