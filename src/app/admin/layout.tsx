import { AdminShell } from "@/components/admin-shell";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-scope"><AdminShell>{children}</AdminShell></div>;
}
