#!/usr/bin/env python3
import os
import re

def find_functions_without_params():
    """Find all exported functions that have parameters but no @param annotations"""

    functions_without_params = []

    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith('.ts'):
                file_path = os.path.join(root, file)

                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Find exported functions with JSDoc
                    pattern = r'(/\*\*[\s\S]*?\*/)\s*export\s+(async\s+)?function\s+(\w+)\s*(?:<[^>]*>)?\s*\(([^)]+)\)'
                    matches = re.findall(pattern, content)

                    for jsdoc, async_kw, func_name, params in matches:
                        # Skip if function has no real parameters (just whitespace)
                        if not params.strip():
                            continue

                        # Check if JSDoc has @param
                        if '@param' not in jsdoc:
                            functions_without_params.append({
                                'file': file_path,
                                'function': func_name,
                                'params': params.strip(),
                                'jsdoc_length': len(jsdoc.split('\n'))
                            })

                except Exception as e:
                    print(f"Error reading {file_path}: {e}")

    return functions_without_params

def main():
    """Find and list functions without @param annotations"""

    functions = find_functions_without_params()

    print(f"Found {len(functions)} functions without @param annotations:")
    print("=" * 80)

    for func in functions:
        print(f"File: {func['file']}")
        print(f"Function: {func['function']}")
        print(f"Parameters: {func['params']}")
        print(f"JSDoc lines: {func['jsdoc_length']}")
        print("-" * 40)

if __name__ == "__main__":
    main()