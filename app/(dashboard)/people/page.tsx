import type { Metadata } from "next";
import PeopleList from "@/views/PeopleList";
import { SITE_URL } from "@/constants/site";

export const metadata: Metadata = {
  title: "People | Upriser",
  alternates: { canonical: `${SITE_URL}/people` },
  robots: { index: false, follow: true },
};

export default PeopleList;
