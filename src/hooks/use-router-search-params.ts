"use client";

import { useSearchParams as useNextSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

type SetSearchInput = URLSearchParams | Record<string, string | undefined | null>;

/**
 * React-router-compatible [searchParams, setSearchParams] for Next.js App Router.
 */
export function useRouterSearchParams(): [
  URLSearchParams,
  (next: SetSearchInput, opts?: { replace?: boolean }) => void,
] {
  const nextParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useMemo(
    () => new URLSearchParams(nextParams?.toString() ?? ""),
    [nextParams],
  );

  const setSearchParams = useCallback(
    (next: SetSearchInput, opts?: { replace?: boolean }) => {
      let p: URLSearchParams;
      if (next instanceof URLSearchParams) {
        p = new URLSearchParams(next.toString());
      } else {
        p = new URLSearchParams(searchParams.toString());
        Object.entries(next).forEach(([k, v]) => {
          if (v === undefined || v === null || v === "") p.delete(k);
          else p.set(k, v);
        });
      }

      const qs = p.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (opts?.replace) router.replace(url);
      else router.push(url);
    },
    [pathname, router, searchParams],
  );

  return [searchParams, setSearchParams];
}
