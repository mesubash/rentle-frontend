import type { Metadata } from "next";
import { BookingDetailView } from "@/components/booking-detail-view";
export const metadata: Metadata = { title: "Booking details" };
export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <BookingDetailView bookingId={id} />; }
