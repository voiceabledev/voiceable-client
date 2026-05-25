import type { Metadata } from "next";
import Landing4 from "@/views/Landing4";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "AI Booking Assistant for Small Businesses | Voiceable",
  description:
    "Book appointments, answer questions, and manage your schedule 24/7 with AI voice agents for salons, spas, barbershops, studios, and restaurants.",
  path: "/small-business",
  keywords: [
    "AI booking assistant",
    "appointment scheduling",
    "small business AI",
    "salon booking",
    "spa booking",
    "barbershop scheduling",
    "fitness studio booking",
    "restaurant reservations",
    "AI receptionist",
    "automated appointment booking",
    "small business automation",
    "voice AI for small business",
  ],
});

export default function SmallBusinessPage() {
  return <Landing4 />;
}
