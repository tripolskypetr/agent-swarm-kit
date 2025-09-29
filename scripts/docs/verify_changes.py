#!/usr/bin/env python3
import subprocess
import re
import sys

def analyze_file_changes(file_path):
    """Analyze changes in a single file to detect non-JSDoc modifications"""
    try:
        result = subprocess.run(['git', 'diff', '1.1.156..HEAD', '--', file_path],
                              capture_output=True, text=True)
        if result.returncode != 0:
            return {"error": f"Git diff failed for {file_path}"}

        diff_content = result.stdout
        if not diff_content.strip():
            return {"no_changes": True}

        lines = diff_content.split('\n')

        # Track different types of changes
        changes = {
            "jsdoc_only": True,
            "added_lines": [],
            "removed_lines": [],
            "suspicious_changes": []
        }

        in_jsdoc = False
        jsdoc_depth = 0

        for line in lines:
            if line.startswith('@@'):
                continue
            if line.startswith('diff --git') or line.startswith('index') or line.startswith('+++') or line.startswith('---'):
                continue

            if line.startswith('+') or line.startswith('-'):
                content = line[1:].strip()

                # Check if we're entering/exiting JSDoc
                if '/**' in content:
                    in_jsdoc = True
                    jsdoc_depth += content.count('/**')
                if '*/' in content:
                    jsdoc_depth -= content.count('*/')
                    if jsdoc_depth <= 0:
                        in_jsdoc = False
                        jsdoc_depth = 0

                # Skip empty lines and lines with only whitespace
                if not content:
                    continue

                # Check if line is JSDoc related
                is_jsdoc_line = (
                    in_jsdoc or
                    content.startswith('*') or
                    content.startswith('/**') or
                    content.startswith('*/') or
                    '@param' in content or
                    '@returns' in content or
                    '@callback' in content or
                    '@type' in content or
                    '@description' in content or
                    '@typedef' in content or
                    '@private' in content or
                    '@module' in content
                )

                if line.startswith('+'):
                    changes["added_lines"].append(content)
                    if not is_jsdoc_line:
                        changes["jsdoc_only"] = False
                        changes["suspicious_changes"].append(f"ADDED NON-JSDOC: {content}")

                elif line.startswith('-'):
                    changes["removed_lines"].append(content)
                    if not is_jsdoc_line:
                        changes["jsdoc_only"] = False
                        changes["suspicious_changes"].append(f"REMOVED NON-JSDOC: {content}")

        return changes

    except Exception as e:
        return {"error": f"Exception analyzing {file_path}: {str(e)}"}

def main():
    """Check all changed TypeScript files for non-JSDoc modifications"""

    # Get all changed TypeScript files
    result = subprocess.run(['git', 'diff', '1.1.156..HEAD', '--name-only'],
                          capture_output=True, text=True)

    if result.returncode != 0:
        print("Failed to get changed files")
        sys.exit(1)

    files = [f for f in result.stdout.strip().split('\n') if f.endswith('.ts') and f.startswith('src/')]

    print(f"Analyzing {len(files)} TypeScript files...")

    suspicious_files = []
    jsdoc_only_files = 0

    for file_path in files:
        if not file_path.strip():
            continue

        changes = analyze_file_changes(file_path)

        if "error" in changes:
            print(f"ERROR: {changes['error']}")
            continue

        if "no_changes" in changes:
            continue

        if changes["jsdoc_only"]:
            jsdoc_only_files += 1
        else:
            suspicious_files.append({
                "file": file_path,
                "issues": changes["suspicious_changes"]
            })
            print(f"\n[SUSPICIOUS] {file_path}")
            for issue in changes["suspicious_changes"][:3]:  # Show first 3 issues
                print(f"  - {issue}")
            if len(changes["suspicious_changes"]) > 3:
                print(f"  ... and {len(changes['suspicious_changes']) - 3} more issues")

    print(f"\n=== SUMMARY ===")
    print(f"Total TypeScript files analyzed: {len(files)}")
    print(f"Files with JSDoc-only changes: {jsdoc_only_files}")
    print(f"Files with suspicious changes: {len(suspicious_files)}")

    if suspicious_files:
        print(f"\nSUSPICIOUS FILES:")
        for item in suspicious_files:
            print(f"- {item['file']} ({len(item['issues'])} issues)")
    else:
        print(f"\n[OK] ALL CHANGES APPEAR TO BE JSDoc-ONLY")

if __name__ == "__main__":
    main()