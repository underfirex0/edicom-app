// Converts a <input type="datetime-local"> value (timezone-naive wall-clock
// time, e.g. "2026-07-27T09:30") into a correct UTC ISO string.
//
// IMPORTANT: this must run in the browser, not on the server. A
// datetime-local string has no timezone info, so `new Date(value)` resolves
// it using whatever timezone the *current process* is running in. In the
// browser that's the admin's real local time (Morocco) — correct. On a
// Vercel serverless function it's UTC — which silently shifted every
// scheduled interview time by an hour. Always convert client-side and send
// the resulting ISO string to the server, never the raw input value.
export function localInputToISO(value: string): string {
  if (!value) return "";
  return new Date(value).toISOString();
}
