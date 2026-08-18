import { supportCatalog } from "@/features/support/model/support.catalog";

import { SupportPage } from "./ui/SupportPage";

export default function Page() {
  return <SupportPage data={supportCatalog} />;
}
