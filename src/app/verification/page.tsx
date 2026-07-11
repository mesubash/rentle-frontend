import type { Metadata } from "next";
import { VerificationForm } from "@/components/verification-form";
export const metadata: Metadata = { title: "Verify citizenship" };
export default function VerificationPage() { return <main className="page"><div className="container verification-page"><VerificationForm /></div></main>; }
