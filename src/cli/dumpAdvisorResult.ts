import * as fs from "fs/promises";
import * as path from "path";

/**
 * Dumps the advisor result into a folder structure with markdown files.
 *
 * - Creates a subfolder for each result using its resultId.
 * - Writes the response content to a markdown file.
 *
 * @function
 */
export const dumpAdvisorResult = async (resultId: string, content: string) => {
  const subfolderPath = path.join("./dump/advisor", resultId);

  try {
    await fs.access(subfolderPath);
    return;
  } catch {
    await fs.mkdir(subfolderPath, { recursive: true });
  }

  const markdown = `# Advisor Output\n\n${content}`;
  const filePath = path.join(subfolderPath, "response.md");
  await fs.writeFile(filePath, markdown, "utf8");
};
