import { RequestDetailsPage } from "./ui/RequestDetailsPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestDetailsPage requestId={id} />;
}
