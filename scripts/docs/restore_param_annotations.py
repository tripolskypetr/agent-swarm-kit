#!/usr/bin/env python3
import os
import re
import subprocess
from pathlib import Path

def restore_param_annotations(file_path):
    """Restore @param annotations for function parameters"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Pattern to find exported functions with JSDoc
        function_pattern = r'(/\*\*[\s\S]*?\*/)\s*export\s+(async\s+)?function\s+(\w+)\s*\(([^)]*)\)'

        def process_function(match):
            jsdoc_block = match.group(1)
            async_keyword = match.group(2) or ""
            function_name = match.group(3)
            params_str = match.group(4)

            # Parse parameters
            if not params_str.strip():
                return match.group(0)  # No parameters, keep as is

            # Simple parameter parsing (handle basic cases)
            params = []
            for param in params_str.split(','):
                param = param.strip()
                if not param:
                    continue

                # Extract parameter name (before colon or equals)
                param_name = param.split(':')[0].split('=')[0].strip()
                # Remove destructuring, default values, etc. - just get the base name
                param_name = re.sub(r'[{}\[\]?]', '', param_name).strip()

                if param_name and param_name not in ['...args', '...rest']:
                    # Check if parameter has type annotation
                    param_type = 'any'
                    if ':' in param:
                        type_part = param.split(':', 1)[1].split('=')[0].strip()
                        param_type = type_part

                    # Check if parameter is optional
                    is_optional = '?' in param or '=' in param
                    optional_text = " (optional)" if is_optional else ""

                    params.append({
                        'name': param_name,
                        'type': param_type,
                        'optional': optional_text
                    })

            if not params:
                return match.group(0)  # No valid parameters found

            # Check if JSDoc already has @param annotations
            if '@param' in jsdoc_block:
                return match.group(0)  # Already has @param, don't modify

            # Add @param annotations before @throws or at the end
            lines = jsdoc_block.split('\n')

            # Find where to insert @param annotations
            insert_index = -2  # Before the closing */
            for i, line in enumerate(lines):
                if '@throws' in line or '@returns' in line or '@example' in line:
                    insert_index = i
                    break

            # Create @param annotations
            param_lines = []
            if insert_index >= 0 and insert_index < len(lines) - 1:
                param_lines.append(' *')  # Empty line before @param

            for param in params:
                param_line = f" * @param {{{param['type']}}} {param['name']} - The {param['name']} parameter{param['optional']}."
                param_lines.append(param_line)

            # Insert @param lines
            if insert_index == -2:
                # Insert before closing */
                lines = lines[:-1] + param_lines + [lines[-1]]
            else:
                # Insert before @throws/@returns/@example
                lines = lines[:insert_index] + param_lines + lines[insert_index:]

            new_jsdoc = '\n'.join(lines)

            return f"{new_jsdoc}\nexport {async_keyword}function {function_name}({params_str})"

        # Apply the transformation
        content = re.sub(function_pattern, process_function, content, flags=re.MULTILINE)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True

        return False

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Restore @param annotations in all TypeScript files"""
    files_processed = 0
    files_changed = 0

    # Process all .ts files in src directory
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith('.ts'):
                file_path = os.path.join(root, file)
                files_processed += 1

                if restore_param_annotations(file_path):
                    files_changed += 1
                    print(f"[UPDATED] {file_path}")

    print(f"\n=== SUMMARY ===")
    print(f"Files processed: {files_processed}")
    print(f"Files changed: {files_changed}")

if __name__ == "__main__":
    main()