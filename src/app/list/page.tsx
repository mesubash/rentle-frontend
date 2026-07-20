import type { Metadata } from "next";
import { ListingWizard } from "@/components/listing-wizard";
import { SiteFooter } from "@/components/site-footer";
export const metadata: Metadata = { title: "List an item" };
export default function ListItemPage() {
  return <>
    <ListingWizard />
    <SiteFooter prompt={{
      title: "Need to finish this later?",
      description: "Your text draft stays on this device until you return.",
      href: "/listings/manage",
      label: "Back to my listings",
    }} />
  </>;
}
