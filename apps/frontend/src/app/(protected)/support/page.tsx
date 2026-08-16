import { supportMock } from "@/features/support/mocks/support.mock";

import { SupportPage } from "./ui/SupportPage";

export default function Page() {
  return <SupportPage data={supportMock} />;
}