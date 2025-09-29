#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Directory containing the markdown files
docs_dir = Path("docs")

# Pattern to find code blocks and check for descriptions
pattern = r'```ts\s*\n([^`]+)\n```\s*\n?'

def analyze_md_files():
    """Analyze all markdown files in docs directory for missing descriptions"""
    types_dir = docs_dir / "types"
    interfaces_dir = docs_dir / "interfaces"
    classes_dir = docs_dir / "classes"

    all_dirs = [types_dir, interfaces_dir, classes_dir]

    issues_found = []
    files_analyzed = 0

    for directory in all_dirs:
        if not directory.exists():
            continue

        print(f"\n=== Analyzing {directory} ===")

        for md_file in directory.glob("*.md"):
            files_analyzed += 1
            content = md_file.read_text(encoding='utf-8')

            # Find code blocks
            matches = re.findall(pattern, content)

            if not matches:
                issues_found.append(f"[NO_CODE_BLOCK] {md_file.name} - No TypeScript code block found")
                continue

            # Check if there's any text after the code block
            parts = re.split(pattern, content)
            if len(parts) >= 3:
                after_code = parts[2].strip()
                if not after_code or len(after_code) < 10:
                    issues_found.append(f"[NEEDS_FIX] {md_file.name} - Missing or too short JSDoc description")
                else:
                    print(f"[OK] {md_file.name} - Has description")
            else:
                issues_found.append(f"[NEEDS_FIX] {md_file.name} - Missing JSDoc description")

    print(f"\n=== SUMMARY ===")
    print(f"Files analyzed: {files_analyzed}")
    print(f"Issues found: {len(issues_found)}")

    if issues_found:
        print(f"\n=== ISSUES ===")
        for issue in issues_found:
            print(issue)
    else:
        print("\n[OK] All files have proper descriptions!")

if __name__ == "__main__":
    analyze_md_files()