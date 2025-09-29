#!/usr/bin/env python3
import os
import re
from pathlib import Path

def fix_jsdoc_annotations(file_path):
    """Remove problematic JSDoc annotations from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Remove problematic annotations
        patterns_to_remove = [
            r'^\s*\*\s*@type\s+.*$',
            r'^\s*\*\s*@typedef\s+.*$',
            r'^\s*\*\s*@description\s+.*$',
            r'^\s*\*\s*@param\s+\{[^}]*\}\s+\w+\s+-\s+.*$',
            r'^\s*\*\s*@returns?\s+\{[^}]*\}\s+.*$',
            r'^\s*\*\s*@callback\s+.*$',
            r'^\s*\*\s*@property\s+.*$',
        ]

        for pattern in patterns_to_remove:
            content = re.sub(pattern, '', content, flags=re.MULTILINE)

        # Clean up extra blank lines in JSDoc blocks
        content = re.sub(r'(/\*\*[^*]*)\n\s*\*\s*\n\s*\*\s*\n', r'\1\n *\n', content)
        content = re.sub(r'\n\s*\*\s*\n\s*\*/', r'\n */', content)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True

        return False

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Remove problematic JSDoc annotations from all TypeScript files"""
    files_processed = 0
    files_changed = 0

    # Process all .ts files in src directory
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith('.ts'):
                file_path = os.path.join(root, file)
                files_processed += 1

                if fix_jsdoc_annotations(file_path):
                    files_changed += 1
                    print(f"[FIXED] {file_path}")

    print(f"\n=== SUMMARY ===")
    print(f"Files processed: {files_processed}")
    print(f"Files changed: {files_changed}")
    print(f"[COMPLETED] Fixed {files_changed} files")

if __name__ == "__main__":
    main()