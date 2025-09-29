#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Parameter name to description mapping
PARAM_DESCRIPTIONS = {
    'stateSchema': 'Partial state schema with updates to be applied to the existing state configuration.',
    'storageSchema': 'Partial storage schema with updates to be applied to the existing storage configuration.',
    'swarmSchema': 'Partial swarm schema with updates to be applied to the existing swarm configuration.',
    'agentSchema': 'Partial agent schema with updates to be applied to the existing agent configuration.',
    'toolSchema': 'Partial tool schema with updates to be applied to the existing tool configuration.',
    'completionSchema': 'Partial completion schema with updates to be applied to the existing completion configuration.',
    'policySchema': 'Partial policy schema with updates to be applied to the existing policy configuration.',
    'wikiSchema': 'Partial wiki schema with updates to be applied to the existing wiki configuration.',
    'mcpSchema': 'Partial MCP schema with updates to be applied to the existing MCP configuration.',
    'computeSchema': 'Partial compute schema with updates to be applied to the existing compute configuration.',
    'outlineSchema': 'Partial outline schema with updates to be applied to the existing outline configuration.',
    'pipelineSchema': 'Partial pipeline schema with updates to be applied to the existing pipeline configuration.',
    'embeddingSchema': 'Partial embedding schema with updates to be applied to the existing embedding configuration.',
    'runFn': 'Function to execute within the managed scope, receiving clientId and agentName as arguments.',
    'options': 'Configuration options for the scope operation including clientId, swarmName, and optional callbacks.',
    'config': 'Configuration object with connection parameters and settings.',
    'params': 'Parameters object containing the necessary configuration data.',
    'args': 'Arguments object containing the input data and context for the operation.',
    'callback': 'Callback function to be executed.',
    'handler': 'Event handler function to process the events.',
    'data': 'Data object to be processed or validated.',
    'payload': 'Payload object containing the data to be processed.',
    'context': 'Context object providing additional information for the operation.',
    'result': 'Result object from the previous operation.',
    'error': 'Error object containing error information.',
    'item': 'Item object to be processed.',
    'items': 'Array of items to be processed.',
    'value': 'Value to be processed or stored.',
    'key': 'Key identifier for the operation.',
}

def add_missing_param_annotations(file_path):
    """Add @param annotations to functions that are missing them"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Pattern for functions with JSDoc that might be missing @param
        function_pattern = r'(/\*\*[\s\S]*?\*/)\s*export\s+(async\s+)?function\s+(\w+)\s*(<[^>]*>)?\s*\(([^)]*)\)'

        def process_function(match):
            jsdoc_block = match.group(1)
            async_keyword = match.group(2) or ""
            function_name = match.group(3)
            generics = match.group(4) or ""
            params_str = match.group(5)

            # Skip if already has @param
            if '@param' in jsdoc_block:
                return match.group(0)

            # Skip if no parameters
            if not params_str.strip():
                return match.group(0)

            # Parse parameters
            params = []
            for param in params_str.split(','):
                param = param.strip()
                if not param:
                    continue

                # Extract parameter name (handle complex cases)
                param_name = param.split(':')[0].split('=')[0].strip()
                # Remove destructuring, rest operators, etc. - just get the base name
                param_name = re.sub(r'[{}\[\]?.]', '', param_name).strip()
                param_name = re.sub(r'^\.\.\.', '', param_name)  # Remove rest operator

                if param_name and param_name not in ['args', 'rest']:
                    # Get description for the parameter
                    description = PARAM_DESCRIPTIONS.get(param_name, f"The {param_name} parameter.")
                    params.append({
                        'name': param_name,
                        'description': description
                    })

            if not params:
                return match.group(0)  # No valid parameters found

            # Add @param annotations to JSDoc
            lines = jsdoc_block.split('\n')

            # Find insertion point (before @template, @throws, @returns, @example)
            insert_index = len(lines) - 1  # Before closing */
            for i, line in enumerate(lines):
                if any(tag in line for tag in ['@template', '@throws', '@returns', '@example']):
                    insert_index = i
                    break

            # Create @param lines (without types)
            param_lines = []
            if insert_index > 0 and insert_index < len(lines) - 1:
                param_lines.append(' *')  # Empty line before @param

            for param in params:
                param_line = f" * @param {param['name']} {param['description']}"
                param_lines.append(param_line)

            # Insert @param lines
            if insert_index == len(lines) - 1:
                # Insert before closing */
                lines = lines[:-1] + param_lines + [lines[-1]]
            else:
                # Insert before other annotations
                lines = lines[:insert_index] + param_lines + lines[insert_index:]

            new_jsdoc = '\n'.join(lines)
            return f"{new_jsdoc}\nexport {async_keyword}function {function_name}{generics}({params_str})"

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
    """Add missing @param annotations in TypeScript files"""
    files_processed = 0
    files_changed = 0

    # Process all .ts files in src directory
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith('.ts'):
                file_path = os.path.join(root, file)
                files_processed += 1

                if add_missing_param_annotations(file_path):
                    files_changed += 1
                    print(f"[UPDATED] {file_path}")

    print(f"\n=== SUMMARY ===")
    print(f"Files processed: {files_processed}")
    print(f"Files changed: {files_changed}")

if __name__ == "__main__":
    main()