"use client";

import Link from "next/link";
import Image from "next/image";

type AuthBrandLinkProps = {
  href?: string;
};

/** Top-left brand mark for auth screens (login, signup-demo). */
export function AuthBrandLink({ href = "/" }: AuthBrandLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      aria-label="Upriser home"
    >
      <Image
        src="/upriser-logo.png"
        alt="Upriser"
        width={151}
        height={48}
        className="h-9 w-auto"
        priority
      />
    </Link>
  );
}
