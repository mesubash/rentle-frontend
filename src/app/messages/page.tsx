import type { Metadata } from "next";
import { MessagesWorkspace } from "@/components/messages-workspace";

export const metadata: Metadata = { title: "Messages" };
export default function MessagesPage() { return <MessagesWorkspace />; }
