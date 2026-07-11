import { AuthForm } from "@/components/auth-form";

export default async function VerifyPhonePage({ searchParams }: { searchParams: Promise<{ phone?: string }> }) {
  const { phone = "" } = await searchParams;
  return <AuthForm mode="otp" initialPhone={phone} />;
}
