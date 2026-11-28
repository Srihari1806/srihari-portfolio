/** "What I carry" lives folded inside the ADMIT ONE ticket; the ticket stub and the drawer talk through this event. */
export const SUITCASE_EVENT = 'srihari:suitcase';
export type SuitcaseDetail = { open: boolean };
export function setSuitcase(open: boolean) {
  window.dispatchEvent(new CustomEvent<SuitcaseDetail>(SUITCASE_EVENT, { detail: { open } }));
}
