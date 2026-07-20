export interface Person {
  id: string;
  name: string;
  company: string;
  role: string;
  linkedin: string;
  avatar?: string;
  email?: string;
  location?: string;
  bio?: string;
}

export const people: Person[] = [
  {
    id: "amelia-hart",
    name: "Amelia Hart",
    company: "Northwind Labs",
    role: "VP of Sales",
    linkedin: "https://www.linkedin.com/in/amelia-hart",
    email: "amelia.hart@northwindlabs.com",
    location: "San Francisco, CA",
    bio: "Revenue leader focused on outbound motion and pipeline efficiency across B2B SaaS.",
  },
  {
    id: "daniel-okafor",
    name: "Daniel Okafor",
    company: "Brightpath",
    role: "Head of Customer Success",
    linkedin: "https://www.linkedin.com/in/daniel-okafor",
    email: "daniel@brightpath.io",
    location: "Austin, TX",
    bio: "Builds retention and onboarding programs that scale with the customer base.",
  },
  {
    id: "sofia-navarro",
    name: "Sofia Navarro",
    company: "Cobalt Retail",
    role: "Director of Operations",
    linkedin: "https://www.linkedin.com/in/sofia-navarro",
    email: "sofia.navarro@cobaltretail.com",
    location: "Miami, FL",
    bio: "Operations lead streamlining fulfillment and support workflows for e-commerce.",
  },
  {
    id: "james-liu",
    name: "James Liu",
    company: "Quorum AI",
    role: "Co-founder & CTO",
    linkedin: "https://www.linkedin.com/in/james-liu",
    email: "james@quorum.ai",
    location: "Seattle, WA",
    bio: "Engineering leader shipping voice and conversational AI products end to end.",
  },
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    company: "Helio Health",
    role: "Product Manager",
    linkedin: "https://www.linkedin.com/in/priya-sharma",
    email: "priya.sharma@heliohealth.com",
    location: "Boston, MA",
    bio: "PM at the intersection of healthcare and automation, obsessed with user outcomes.",
  },
  {
    id: "marcus-bell",
    name: "Marcus Bell",
    company: "Ledger & Co.",
    role: "Founder",
    linkedin: "https://www.linkedin.com/in/marcus-bell",
    email: "marcus@ledgerco.com",
    location: "New York, NY",
    bio: "Founder building financial tooling for small businesses and independent operators.",
  },
];

export function getPersonById(id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
