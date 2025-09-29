#!/usr/bin/env python3
import os
import re
from pathlib import Path

def clean_jsdoc_annotations(file_path):
    """Remove problematic JSDoc annotations from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Remove @type, @description, @param, @returns, @callback annotations
        # Pattern to match JSDoc comments with these annotations
        jsdoc_pattern = r'/\*\*\s*\n(\s*\*[^\n]*\n)*\s*\*/'

        def clean_jsdoc_block(match):
            block = match.group(0)
            lines = block.split('\n')

            # Check if this block contains problematic annotations
            has_problematic_annotations = any(
                '@type' in line or '@description' in line or
                '@param' in line or '@returns' in line or '@callback' in line
                for line in lines
            )

            if has_problematic_annotations:
                # Extract the description without annotations
                description_lines = []
                in_description = False

                for line in lines:
                    if line.strip().startswith('/**'):
                        description_lines.append(line)
                        in_description = True
                    elif line.strip().startswith('*/'):
                        description_lines.append(line)
                        break
                    elif line.strip().startswith('*') and not any(
                        f'@{tag}' in line for tag in ['type', 'description', 'param', 'returns', 'callback']
                    ):
                        # This is a description line without annotations
                        description_lines.append(line)
                    elif line.strip().startswith('* @description'):
                        # Convert @description line to regular description
                        desc_text = line.replace('* @description', '*')
                        if desc_text.strip() != '*':
                            description_lines.append(desc_text)
                        in_description = True
                    elif not line.strip().startswith('* @'):
                        # Regular line (might be part of description)
                        if in_description and line.strip().startswith('*'):
                            description_lines.append(line)

                return '\n'.join(description_lines)

            return block

        # Apply the cleaning to all JSDoc blocks
        content = re.sub(jsdoc_pattern, clean_jsdoc_block, content, flags=re.MULTILINE)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True

        return False

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Clean remaining problematic annotations from all TypeScript files"""
    files_processed = 0
    files_changed = 0

    # Process all .ts files in src directory
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith('.ts'):
                file_path = os.path.join(root, file)
                files_processed += 1

                if clean_jsdoc_annotations(file_path):
                    files_changed += 1
                    print(f"[CLEANED] {file_path}")

    print(f"\n=== SUMMARY ===")
    print(f"Files processed: {files_processed}")
    print(f"Files changed: {files_changed}")

if __name__ == "__main__":
    main()