import { redirect } from "next/navigation";

export default async function LegacyVerifyPage({ searchParams }: { searchParams: Promise<{ phone?: string }> }) {
  const { phone } = await searchParams;
  redirect(phone ? `/verify?phone=${encodeURIComponent(phone)}` : "/verify");
}
