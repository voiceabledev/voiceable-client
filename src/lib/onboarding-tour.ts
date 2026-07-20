/**
 * Tracks the /registration onboarding hand-off across page navigations.
 *
 * Flow: /registration -> agent wizard -> agent detail page (guided tour) ->
 * on tour completion, jump to the Widget tab and run the Design Studio tour.
 *
 * Uses sessionStorage so the flag dies with the tab and never re-fires for a
 * returning user.
 */
const WIDGET_TOUR_KEY = "voiceable_onboarding_widget_tour_pending";

export function markOnboardingWidgetTourPending(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(WIDGET_TOUR_KEY, "true");
  } catch {
    /* ignore quota */
  }
}

/** Non-destructive read — safe to call during render. */
export function isOnboardingWidgetTourPending(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(WIDGET_TOUR_KEY) === "true";
  } catch {
    return false;
  }
}

/** Reads and clears the flag so the tour runs exactly once. */
export function consumeOnboardingWidgetTourPending(): boolean {
  const pending = isOnboardingWidgetTourPending();
  clearOnboardingWidgetTourPending();
  return pending;
}

export function clearOnboardingWidgetTourPending(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(WIDGET_TOUR_KEY);
  } catch {
    /* ignore */
  }
}
