#!/usr/bin/env python3
"""
Script to find JSDoc annotations that might interfere with docs generation.
"""
import os
import re
from pathlib import Path

def find_problematic_jsdoc(file_path):
    """Find JSDoc comments with potentially problematic annotations."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return []

    issues = []

    # Find JSDoc comments with problematic annotations
    jsdoc_pattern = r'/\*\*[\s\S]*?\*/'

    for match in re.finditer(jsdoc_pattern, content):
        jsdoc_content = match.group(0)

        # Check for specific problematic annotations
        problematic_annotations = ['@type', '@property', '@method', '@description', '@param', '@returns']
        found_annotations = []

        for annotation in problematic_annotations:
            if annotation in jsdoc_content:
                found_annotations.append(annotation)

        if found_annotations:
            # Get context around the JSDoc
            start = max(0, match.start() - 50)
            end = min(len(content), match.end() + 100)
            context = content[start:end]

            issues.append({
                'file': str(file_path),
                'annotations': found_annotations,
                'content': jsdoc_content[:200] + '...' if len(jsdoc_content) > 200 else jsdoc_content,
                'line': content[:match.start()].count('\n') + 1
            })

    return issues

def scan_directory(directory):
    """Scan directory for TypeScript files with problematic JSDoc."""
    issues = []
    ts_files = list(Path(directory).rglob('*.ts'))

    for ts_file in ts_files:
        file_issues = find_problematic_jsdoc(ts_file)
        issues.extend(file_issues)

    return issues

def main():
    """Main function."""
    print("[SCANNING] TypeScript files for potentially problematic JSDoc annotations...")

    # Scan specific directories
    directories = ['src/functions', 'src/types', 'src/classes']
    all_issues = []

    for directory in directories:
        if Path(directory).exists():
            print(f"\n[SCANNING] {directory}...")
            issues = scan_directory(directory)
            all_issues.extend(issues)

    # Group and display results
    if all_issues:
        print(f"\n[FOUND] {len(all_issues)} potential JSDoc annotation issues:")

        for issue in all_issues:
            print(f"\n📁 {issue['file']}:{issue['line']}")
            print(f"   Annotations: {', '.join(issue['annotations'])}")
            print(f"   Preview: {issue['content'][:100]}...")
    else:
        print("\n✅ No problematic JSDoc annotations found!")

if __name__ == "__main__":
    main()