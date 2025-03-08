/**
 * Converts milliseconds to a time string in the format "HH:MM:SS.ms".
 *
 * @param {number} s - The number of milliseconds.
 * @returns {string} The formatted time string.
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
