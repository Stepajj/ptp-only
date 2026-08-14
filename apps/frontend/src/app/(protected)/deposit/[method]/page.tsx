import { DepositCryptoPage } from "../ui/DepositCryptoPage";

interface DepositPageProps {
  params: Promise<{
    method: string;
  }>;
}

export default async function Page({
  params,
}: DepositPageProps) {
  const { method } = await params;

  return <DepositCryptoPage methodId={method} />;
}