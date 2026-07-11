import { AuthForm } from "@/components/auth-form";
export default async function VerifyPhonePage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone = "+977" } = await searchParams;
  return <AuthForm mode="otp" initialPhone={phone} />;
}
