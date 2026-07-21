"use client";

import Link from "next/link";
import Image from "next/image";

type AuthBrandLinkProps = {
  href?: string;
  /**
   * "onDark" renders the mark in solid white. The PNG's "riser" wordmark is
   * near-black and disappears on a dark background; until there's a proper
   * light-variant asset, knocking it out to mono is the legible option.
   */
  variant?: "default" | "onDark";
};

/** Top-left brand mark for auth screens (login, signup-demo). */
export function AuthBrandLink({ href = "/", variant = "default" }: AuthBrandLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      aria-label="Upriser home"
    >
      {/*
        `unoptimized` serves the PNG straight from /public instead of routing it
        through /_next/image, which fails on the deployed host and renders a
        broken image. The file is 5 KB, so there is nothing to optimize anyway.
      */}
      <Image
        src="/upriser-logo.png"
        alt="Upriser"
        width={151}
        height={48}
        className={
          variant === "onDark"
            ? "h-9 w-auto brightness-0 invert"
            : "h-9 w-auto"
        }
        priority
        unoptimized
      />
    </Link>
  );
}
