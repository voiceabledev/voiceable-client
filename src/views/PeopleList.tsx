"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Linkedin, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { people, getInitials } from "@/data/people";

export default function PeopleList() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) =>
      [p.name, p.company, p.role].some((field) => field.toLowerCase().includes(q))
    );
  }, [query]);

  const isEmptyList = people.length === 0;
  const noSearchResults = !isEmptyList && filtered.length === 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 mb-1">
          <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <h1 className="text-lg md:text-xl font-semibold">People</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Contacts in your CRM. Click a name to view their profile.
        </p>
      </div>

      {/* Search */}
      {!isEmptyList && (
        <div className="p-4 md:p-6 pb-0 flex-shrink-0">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, or role"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Table / empty state */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {isEmptyList ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted ring-1 ring-border">
              <UserPlus className="h-6 w-6 text-muted-foreground" aria-hidden />
            </span>
            <p className="mt-4 text-base font-semibold text-foreground">No people yet</p>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              Your CRM contacts will show up here once they&apos;re added.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="text-right">LinkedIn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((person) => (
                  <TableRow
                    key={person.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/people/${person.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {person.avatar && <AvatarImage src={person.avatar} alt={person.name} />}
                          <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span className="font-medium text-foreground hover:underline">
                            {person.name}
                          </span>
                          <div className="md:hidden text-xs text-muted-foreground truncate">
                            {person.role} · {person.company}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {person.company}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {person.role}
                    </TableCell>
                    <TableCell className="text-right">
                      <a
                        href={person.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
                {noSearchResults && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      No people match “{query}”.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
