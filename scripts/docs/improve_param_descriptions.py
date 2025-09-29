#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Common parameter descriptions
PARAM_DESCRIPTIONS = {
    'clientId': 'The unique identifier of the client session.',
    'agentName': 'The name of the agent to use or reference.',
    'swarmName': 'The name of the swarm to operate on.',
    'message': 'The message content to process or send.',
    'content': 'The content to be processed or stored.',
    'toolId': 'The unique identifier of the tool call.',
    'request': 'The tool request(s) to be processed.',
    'data': 'The data to be processed or validated.',
    'schema': 'The schema configuration object.',
    'params': 'The parameters or configuration object.',
    'args': 'The arguments object.',
    'options': 'The options configuration object.',
    'config': 'The configuration object.',
    'callback': 'The callback function to execute.',
    'handler': 'The handler function to process events.',
    'mode': 'The execution mode for the operation.',
    'payload': 'The payload data to be processed.',
    'result': 'The result data from the operation.',
    'value': 'The value to be processed or stored.',
    'key': 'The key identifier.',
    'id': 'The unique identifier.',
    'name': 'The name identifier.',
    'type': 'The type specification.',
    'path': 'The file or directory path.',
    'url': 'The URL address.',
    'timeout': 'The timeout duration in milliseconds.',
    'retries': 'The number of retry attempts.',
    'force': 'Whether to force the operation.',
    'validate': 'Whether to validate the input.',
    'silent': 'Whether to suppress output or logging.',
}

def improve_param_descriptions(file_path):
    """Improve @param descriptions with more meaningful content"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Pattern to find @param lines with generic descriptions
        param_pattern = r'(\s*\*\s*@param\s+\{[^}]+\}\s+)(\w+)(\s+-\s+The\s+\w+\s+parameter\.)'

        def improve_param(match):
            prefix = match.group(1)
            param_name = match.group(2)
            suffix = match.group(3)

            # Get better description for known parameters
            if param_name in PARAM_DESCRIPTIONS:
                new_description = PARAM_DESCRIPTIONS[param_name]
                return f"{prefix}{param_name} - {new_description}"
            elif param_name.endswith('Name'):
                base_name = param_name[:-4].lower()
                return f"{prefix}{param_name} - The name of the {base_name}."
            elif param_name.endswith('Id'):
                base_name = param_name[:-2].lower()
                return f"{prefix}{param_name} - The unique identifier of the {base_name}."
            elif param_name.endswith('Config'):
                base_name = param_name[:-6].lower()
                return f"{prefix}{param_name} - The configuration for {base_name}."
            elif param_name.endswith('Schema'):
                base_name = param_name[:-6].lower()
                return f"{prefix}{param_name} - The schema definition for {base_name}."
            elif param_name.startswith('on') and len(param_name) > 2:
                event_name = param_name[2:].lower()
                return f"{prefix}{param_name} - Callback function triggered on {event_name} events."
            else:
                # Keep original if no better description found
                return match.group(0)

        # Apply improvements
        content = re.sub(param_pattern, improve_param, content)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True

        return False

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Improve @param descriptions in all TypeScript files"""
    files_processed = 0
    files_changed = 0

    # Process all .ts files in src directory
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith('.ts'):
                file_path = os.path.join(root, file)
                files_processed += 1

                if improve_param_descriptions(file_path):
                    files_changed += 1
                    print(f"[IMPROVED] {file_path}")

    print(f"\n=== SUMMARY ===")
    print(f"Files processed: {files_processed}")
    print(f"Files changed: {files_changed}")

if __name__ == "__main__":
    main()