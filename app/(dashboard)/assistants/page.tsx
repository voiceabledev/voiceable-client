import type { Metadata } from "next";
import AssistantsList from "@/views/AssistantsList";
import { SITE_URL } from "@/constants/site";

export const metadata: Metadata = {
  title: "Assistants | Voiceable",
  alternates: { canonical: `${SITE_URL}/assistants` },
  robots: { index: false, follow: true },
};

export default AssistantsList;
