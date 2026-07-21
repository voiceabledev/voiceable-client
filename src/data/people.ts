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

/** CRM people list — empty until wired to the API. */
export const people: Person[] = [];

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
