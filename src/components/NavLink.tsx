"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  href?: string;
  className?: string | ((opts: { isActive: boolean; isPending: boolean }) => string);
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, href, ...props }, ref) => {
    const pathname = usePathname();
    const dest = href ?? to;
    const isActive = pathname === dest || (dest !== "/" && pathname.startsWith(`${dest}/`));
    const isPending = false;

    const resolvedClass =
      typeof className === "function"
        ? className({ isActive, isPending })
        : cn(className, isActive && activeClassName, isPending && pendingClassName);

    return <Link ref={ref} href={dest} className={resolvedClass} {...props} />;
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
