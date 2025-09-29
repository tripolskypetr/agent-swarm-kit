/**
 * Converts a duration in milliseconds to a formatted time string in the format "HH:MM:SS.ms".
 * Handles hours, minutes, seconds, and milliseconds, padding single-digit values with leading zeros for consistency.
 *
 *
 * @example
 * // Basic usage with various durations
 * console.log(msToTime(12345678)); // "03:25:45.678"
 * console.log(msToTime(3600000));  // "01:00:00.0"
 * console.log(msToTime(61000));    // "00:01:01.0"
 * console.log(msToTime(500));      // "00:00:00.500"
 * console.log(msToTime(0));        // ""
 *
 * @example
 * // Edge cases
 * console.log(msToTime(999));      // "00:00:00.999"
 * console.log(msToTime(60 * 1000 + 500)); // "00:01:00.500"
 *
 * @remarks
 * This function:
 * - Breaks down milliseconds into hours, minutes, seconds, and remaining milliseconds using integer division and modulo operations.
 * - Pads hours, minutes, and seconds with leading zeros if they are single-digit (e.g., "5" becomes "05").
 * - Includes milliseconds with no leading zeros, fixed to zero decimal places for simplicity (e.g., "500" not "500.0").
 * - Omits leading components (hours or minutes) if they are zero, but always includes seconds and milliseconds if any time is present.
 * - Returns an empty string for an input of 0, treating it as no duration.
 * Useful in the agent swarm system for logging execution times, profiling operations, or displaying human-readable durations.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed|Number.toFixed}
 * for details on millisecond formatting.
 */
export const msToTime = (s: number) => {
  const ms = s % 1000;
  s = (s - ms) / 1000;
  const secs = String(s % 60);
  s = (s - +secs) / 60;
  const mins = String(s % 60);
  const hrs = String((s - +mins) / 60);
  let output = "";
  if (hrs) {
    output += hrs.length === 1 ? "0" + hrs : hrs;
    output += ":";
  }
  if (mins) {
    output += mins.length === 1 ? "0" + mins : mins;
    output += ":";
  }
  if (secs) {
    output += secs.length === 1 ? "0" + secs : secs;
  }
  if (output) {
    output += `.${ms.toFixed(0)}`;
  }
  return output;
};

export default msToTime;
