"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Linkedin, Mail, MapPin, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getPersonById, getInitials } from "@/data/people";

export default function PersonProfile() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const person = getPersonById(id);

  if (!person) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">This person could not be found.</p>
        <Button variant="outline" onClick={() => router.push("/people")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to People
        </Button>
      </div>
    );
  }

  const details = [
    { icon: Briefcase, label: "Role", value: person.role },
    { icon: Building2, label: "Company", value: person.company },
    { icon: MapPin, label: "Location", value: person.location },
    { icon: Mail, label: "Email", value: person.email },
  ].filter((d) => d.value);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <button
          onClick={() => router.push("/people")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          People
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile card */}
          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
              <Avatar className="h-20 w-20 text-xl">
                {person.avatar && <AvatarImage src={person.avatar} alt={person.name} />}
                <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight">{person.name}</h1>
                <p className="text-muted-foreground">
                  {person.role} · {person.company}
                </p>
              </div>
              <a href={person.linkedin} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              </a>
            </div>

            {person.bio && (
              <p className="mt-6 text-sm md:text-base text-muted-foreground leading-relaxed">
                {person.bio}
              </p>
            )}
          </div>

          {/* Details */}
          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Details
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary flex-shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium text-foreground break-words">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
