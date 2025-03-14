import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import os from "os";

const IS_WINDOWS = os.platform() === 'win32';

interface Options {
  encoding?: BufferEncoding | undefined;
  mode?: number | undefined;
  tmpPrefix?: string;
}

/**
 * Atomically writes data to a file, ensuring the write operation is either
 * fully complete or doesn't happen at all (preventing partial writes).
 *
 * @param {string} file - The path to the file to write
 * @param {string|Buffer} data - The data to write to the file
 * @param {Object} options - Optional settings
 * @param {string} options.encoding - File encoding (default: 'utf8')
 * @param {number} options.mode - File mode (default: 0o666)
 * @param {string} options.tmpPrefix - Prefix for temp file (default: '.tmp-')
 * @returns {Promise<void>} - Resolves when write completes successfully
 */
export async function writeFileAtomic(
  file: string,
  data: string | Buffer,
  options: Options | BufferEncoding = {}
) {

  if (IS_WINDOWS) {
    await fs.writeFile(file, data, options);
    return;
  }

  if (typeof options === "string") {
    options = { encoding: options };
  } else if (!options) {
    options = {};
  }

  const { encoding = "utf8", mode = 0o666, tmpPrefix = ".tmp-" } = options;

  // Create a temporary filename in the same directory
  const dir = path.dirname(file);
  const filename = path.basename(file);
  const tmpFile = path.join(
    dir,
    `${tmpPrefix}${crypto.randomBytes(6).toString("hex")}-${filename}`
  );

  let fileHandle = null;

  try {
    // Create and write to temporary file
    fileHandle = await fs.open(tmpFile, "w", mode);

    // Write data to the temp file
    await fileHandle.writeFile(data, { encoding });

    // Ensure data is flushed to disk
    await fileHandle.sync();

    // Close the file before rename
    await fileHandle.close();
    fileHandle = null;

    // Atomically replace the target file with our temp file
    await fs.rename(tmpFile, file);
  } catch (error) {
    // Clean up if something went wrong
    if (fileHandle) {
      await fileHandle.close().catch(() => {});
    }

    // Try to remove the temporary file
    try {
      await fs.unlink(tmpFile).catch(() => {});
    } catch (_) {
      // Ignore errors during cleanup
    }

    throw error;
  }
}
