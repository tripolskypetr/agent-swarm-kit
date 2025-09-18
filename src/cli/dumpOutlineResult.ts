import * as fs from "fs/promises";
import * as path from "path";
import { IOutlineResult } from "../interfaces/Outline.interface";
import beginContext from "../utils/beginContext";

export const dumpOutlineResult = beginContext(
  async (result: IOutlineResult, outputDir = "./dump/outline") => {
    if (!result.isValid) {
      return;
    }

    // Extract system messages and system reminders from existing data
    const systemMessages = result.history.filter((m) => m.role === "system");
    const userMessages = result.history.filter((m) => m.role === "user");
    const subfolderPath = path.join(outputDir, result.resultId);

    try {
      await fs.access(subfolderPath);
      return;
    } catch {
      await fs.mkdir(subfolderPath, { recursive: true });
    }

    {
      let summary = `# Outline Result Summary\n`;

      {
        summary += `\n`;
        summary += `**ResultId**: ${result.resultId}\n`;
        summary += `**Generation Date**: ${new Date().toISOString()}\n`;
        summary += `\n`;
      }

      if (result.param) {
        summary += `## Input Parameters\n\n`;
        summary += "```json\n";
        summary += JSON.stringify(result.param, null, 2);
        summary += "\n```\n\n";
      }

      if (result.data) {
        summary += `## Generated Data\n\n`;
        summary += "```json\n";
        summary += JSON.stringify(result.data, null, 2);
        summary += "\n```\n\n";
      }

      // Add system messages to summary
      if (systemMessages.length > 0) {
        summary += `## System Messages\n\n`;
        systemMessages.forEach((msg, idx) => {
          summary += `### System Message ${idx + 1}\n\n`;
          summary += msg.content;
          summary += "\n";
        });
      }

      const summaryFile = path.join(subfolderPath, "00_system_prompt.md");
      await fs.writeFile(summaryFile, summary, "utf8");
    }

    {
      await Promise.all(
        Array.from(userMessages.entries()).map(async ([idx, message]) => {
          const messageNum = String(idx + 1).padStart(2, "0");
          const contentFileName = `${messageNum}_user_message.md`;
          const contentFilePath = path.join(subfolderPath, contentFileName);

          let content = `# User Input ${idx + 1}\n\n`;
          content += `**ResultId**: ${result.resultId}\n\n`;
          content += message.content;
          content += "\n";

          await fs.writeFile(contentFilePath, content, "utf8");
        })
      );
    }

    {
      const messageNum = String(userMessages.length + 1).padStart(2, "0");
      const contentFileName = `${messageNum}_llm_output.md`;
      const contentFilePath = path.join(subfolderPath, contentFileName);

      let content = `# Full Outline Result\n\n`;
      content += `**ResultId**: ${result.resultId}\n\n`;

      if (result.param) {
        content += `## Completion Input Data\n\n`;
        content += "```json\n";
        content += JSON.stringify(result.param, null, 2);
        content += "\n```\n\n";
      }

      if (result.data) {
        content += `## Completion Output Data\n\n`;
        content += "```json\n";
        content += JSON.stringify(result.data, null, 2);
        content += "\n```\n";
      }

      await fs.writeFile(contentFilePath, content, "utf8");
    }
  }
);
