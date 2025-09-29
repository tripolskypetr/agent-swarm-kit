#!/usr/bin/env python3
import os
import re
from pathlib import Path

def find_empty_param_descriptions():
    """Find markdown files with empty parameter descriptions"""

    docs_functions_dir = Path("docs/functions")
    if not docs_functions_dir.exists():
        print("docs/functions directory not found")
        return []

    empty_param_files = []

    for md_file in docs_functions_dir.glob("*.md"):
        try:
            content = md_file.read_text(encoding='utf-8')

            # Check if file has Parameters table
            if "## Parameters" not in content:
                continue

            # Find empty parameter descriptions (| `param` | |)
            empty_param_pattern = r'\|\s*`([^`]+)`\s*\|\s*\|\s*$'
            empty_params = re.findall(empty_param_pattern, content, re.MULTILINE)

            if empty_params:
                empty_param_files.append({
                    'file': str(md_file),
                    'function': md_file.stem,
                    'empty_params': empty_params
                })

        except Exception as e:
            print(f"Error reading {md_file}: {e}")

    return empty_param_files

def main():
    """Find and report functions with empty parameter descriptions"""

    empty_files = find_empty_param_descriptions()

    if not empty_files:
        print("[OK] No functions with empty parameter descriptions found!")
        return

    print(f"Found {len(empty_files)} functions with empty parameter descriptions:")
    print("=" * 80)

    for func_info in empty_files:
        print(f"Function: {func_info['function']}")
        print(f"File: {func_info['file']}")
        print(f"Empty params: {', '.join(func_info['empty_params'])}")
        print("-" * 40)

    # Also suggest the source files that need to be fixed
    print("\nSource files that likely need @param annotations fixed:")
    for func_info in empty_files:
        function_name = func_info['function']
        print(f"- src/functions/**/{function_name}.ts")

if __name__ == "__main__":
    main()