import * as fs from 'fs/promises';
import * as path from 'path';
import {
  IOutlineData,
  IOutlineParam,
  IOutlineResult,
} from "src/interfaces/Outline.interface";

export const dumpOutlineResult = async <
  Data extends IOutlineData = IOutlineData,
  Param extends IOutlineParam = IOutlineParam
>(
  result: IOutlineResult<Data, Param>,
  outputDir = "./dump/outline"
) => {

  if (!result.isValid) {
    return;
  }

  try {
    await fs.access(outputDir);
  } catch {
    await fs.mkdir(outputDir, { recursive: true });
  }

  const datetime = new Date().toISOString();

  const subfolderPath = path.join(outputDir, result.resultId);

  try {
    await fs.access(subfolderPath);
  } catch {
    await fs.mkdir(subfolderPath, { recursive: true });
  }

  const createdFiles: string[] = [];

  let summary = `# Outline Result Summary\n`;

  {
    summary += `\n`;
    summary += `**ResultId**: ${result.resultId}\n`;
    summary += `**Generation Date**: ${datetime}\n`;
    summary += `\n`;
  }

  if (result.param) {
    summary += `## Input Parameters\n\n`;
    summary += '```json\n';
    summary += JSON.stringify(result.param, null, 2);
    summary += '\n```\n\n';
  }

  if (result.data) {
    summary += `## Generated Data\n\n`;
    summary += '```json\n';
    summary += JSON.stringify(result.data, null, 2);
    summary += '\n```\n\n';
  }

  // Extract system messages and system reminders from existing data
  const systemMessages = result.history.filter(m => m.role === 'system');

  // Add system messages to summary
  if (systemMessages.length > 0) {
    summary += `## System Messages\n\n`;
    systemMessages.forEach((msg, idx) => {
      summary += `### System Message ${idx + 1}\n\n`;
      summary += `**History Index**: ${msg.index}\n\n`;
      summary += '```\n';
      summary += msg.content;
      summary += '\n```\n\n';
    });
  }

  const summaryFile = path.join(subfolderPath, '00_summary.md');
  await fs.writeFile(summaryFile, summary, 'utf8');
  createdFiles.push(summaryFile);

  const userMessages = result.history.filter(m => m.role === 'user');
  for (const [idx, message] of userMessages.entries()) {
    const messageNum = String(idx + 1).padStart(2, '0');
    const fileName = `${messageNum}_user_message.md`;
    const filePath = path.join(subfolderPath, fileName);

    let content = `# User Input ${idx + 1}\n\n`;
    content += `**Role**: ${message.role}\n`;
    content += `**ResultId**: ${result.resultId}\n\n`;
    content += `## Content\n\n`;
    content += '```\n';
    content += message.content;
    content += '\n```\n';


    await fs.writeFile(filePath, content, 'utf8');
    createdFiles.push(filePath);
  }

  const fullDataFileName = `${String(userMessages.length + 1).padStart(2, '0')}_llm_output.md`;
  const fullDataFilePath = path.join(subfolderPath, fullDataFileName);

  let fullDataContent = `# Full Outline Result\n\n`;
  fullDataContent += `**ResultId**: ${result.resultId}\n\n`;

  if (result.param) {
    fullDataContent += `## Completion Input Data\n\n`;
    fullDataContent += '```json\n';
    fullDataContent += JSON.stringify(result.param, null, 2);
    fullDataContent += '\n```\n\n';
  }

  if (result.data) {
    fullDataContent += `## Completion Output Data\n\n`;
    fullDataContent += '```json\n';
    fullDataContent += JSON.stringify(result.data, null, 2);
    fullDataContent += '\n```\n';
  }

  await fs.writeFile(fullDataFilePath, fullDataContent, 'utf8');
  createdFiles.push(fullDataFilePath);
};
