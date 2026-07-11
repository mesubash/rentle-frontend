import { MessagesWorkspace } from "@/components/messages-workspace";

export default async function MessageThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MessagesWorkspace key={id} activeId={id} />;
}
