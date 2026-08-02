/**
 * In-memory session for the CPK analysis page.
 *
 * Keeps the user's analysis state (input, specs, result) alive across
 * navigation — e.g. switching to the AI Assistant and coming back —
 * without persisting any raw data to disk.
 */
import type { CapabilityOutcome } from './adapter';

export interface CpkSessionState {
  dataText: string;
  lsl: string;
  usl: string;
  target: string;
  benchmark: string;
  itemName: string;
  outcome: CapabilityOutcome | null;
}

let session: CpkSessionState | null = null;

export function saveCpkSession(state: CpkSessionState): void {
  session = state;
}

export function loadCpkSession(): CpkSessionState | null {
  return session;
}

export function clearCpkSession(): void {
  session = null;
}
