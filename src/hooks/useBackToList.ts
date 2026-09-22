import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

/**
 * Back handler for a detail screen that must always return to its own list.
 *
 * `navigation.canGoBack()` is true when THIS navigator *or any ancestor* can go
 * back. A detail screen reached by a cross-tab deep link — the dashboard
 * opening a collector, say — is the only entry in its stack, but the tab
 * navigator can still go back, so `canGoBack()` answers true and `goBack()`
 * pops the TAB. The user asks to return to the collectors list and lands on the
 * previous tab instead.
 *
 * Asking the stack directly is the reliable test: `index > 0` means there is a
 * screen underneath *here*, so a pop stays inside this stack.
 */
export function useBackToList(listRoute: string): () => void {
  // Each caller navigates to a different list, so the route name is a plain
  // string rather than a per-stack union.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = useNavigation<any>();

  return useCallback(() => {
    const state = nav.getState?.();
    if (state && typeof state.index === 'number' && state.index > 0) {
      nav.goBack();
      return;
    }
    nav.navigate(listRoute);
  }, [nav, listRoute]);
}
