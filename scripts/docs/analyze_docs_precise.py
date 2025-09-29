#!/usr/bin/env python3
"""
Enhanced script to analyze markdown documentation and find missing descriptions,
accounting for interfaces with the same name in different files.
"""
import os
import re
from pathlib import Path
import ast

def extract_interface_from_ts_file(file_path, interface_name):
    """Extract interface definition from TypeScript file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Pattern to match interface definition
        pattern = rf'export\s+interface\s+{re.escape(interface_name)}\s*[<\{{]'
        match = re.search(pattern, content)
        if match:
            return {
                'file': str(file_path),
                'found': True
            }
    except Exception as e:
        pass

    return {'found': False}

def find_source_file_for_interface(interface_name, src_path='src'):
    """Find all TypeScript files that define the given interface."""
    src_dir = Path(src_path)
    matching_files = []

    # Search all .ts files
    for ts_file in src_dir.rglob('*.ts'):
        result = extract_interface_from_ts_file(ts_file, interface_name)
        if result['found']:
            matching_files.append(str(ts_file))

    return matching_files

def analyze_markdown_file_detailed(file_path):
    """Analyze a single markdown file for missing descriptions with more detail."""
    missing_descriptions = []

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract interface name from file path
    interface_name = file_path.stem

    # Find corresponding source files
    source_files = find_source_file_for_interface(interface_name)

    # Pattern to find property sections: ### propertyName followed by ```ts code block
    property_pattern = r'###\s+(\w+)\s*\n\s*```ts\s*\n([^`]+)\n```\s*(?:\n\s*\n|$)'

    matches = re.finditer(property_pattern, content, re.MULTILINE)

    for match in matches:
        property_name = match.group(1)
        type_definition = match.group(2).strip()

        # Check if there's descriptive text after the code block
        end_pos = match.end()
        remaining_content = content[end_pos:].strip()

        # Look for the next ### or end of file
        next_section = re.search(r'\n###\s+\w+', remaining_content)
        if next_section:
            description_section = remaining_content[:next_section.start()].strip()
        else:
            description_section = remaining_content.strip()

        # If description section is empty or very short, it's likely missing
        if not description_section or len(description_section) < 10:
            missing_descriptions.append({
                'property': property_name,
                'type': type_definition,
                'file': str(file_path),
                'interface_name': interface_name,
                'source_files': source_files,
                'source_count': len(source_files)
            })

    return missing_descriptions

def check_jsdoc_in_source_file(file_path, interface_name, property_name):
    """Check if a property has proper JSDoc in the source file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find the interface
        interface_pattern = rf'export\s+interface\s+{re.escape(interface_name)}\s*[<\{{]'
        interface_match = re.search(interface_pattern, content)

        if not interface_match:
            return {'found_interface': False}

        # Find the property within the interface
        # This is a simplified approach - in practice, you'd need a proper TypeScript parser
        property_pattern = rf'{re.escape(property_name)}\s*[?:]'
        property_match = re.search(property_pattern, content[interface_match.start():])

        if not property_match:
            return {'found_interface': True, 'found_property': False}

        # Check for JSDoc before the property
        prop_start = interface_match.start() + property_match.start()
        before_prop = content[:prop_start]

        # Look for JSDoc comment immediately before the property
        jsdoc_pattern = r'/\*\*[\s\S]*?\*/'
        jsdoc_matches = list(re.finditer(jsdoc_pattern, before_prop))

        if jsdoc_matches:
            last_jsdoc = jsdoc_matches[-1]
            # Check if the JSDoc is close to the property (within 100 characters)
            if prop_start - last_jsdoc.end() < 100:
                jsdoc_content = last_jsdoc.group(0)
                # Check if it contains @type or other problematic annotations
                has_annotations = bool(re.search(r'@(type|property|method|param|returns)', jsdoc_content))
                return {
                    'found_interface': True,
                    'found_property': True,
                    'has_jsdoc': True,
                    'has_annotations': has_annotations,
                    'jsdoc_content': jsdoc_content
                }

        return {
            'found_interface': True,
            'found_property': True,
            'has_jsdoc': False
        }

    except Exception as e:
        return {'error': str(e)}

def analyze_docs_directory_detailed():
    """Analyze all markdown files with detailed source file mapping."""
    base_path = Path('docs')
    category_path = base_path / 'interfaces'

    if not category_path.exists():
        print(f"Directory {category_path} not found")
        return []

    all_missing = []

    # Find all .md files in interfaces
    md_files = list(category_path.glob('*.md'))

    print(f"\nAnalyzing {len(md_files)} interface files...")

    for md_file in md_files:
        missing = analyze_markdown_file_detailed(md_file)
        all_missing.extend(missing)

    return all_missing

def print_detailed_results(results):
    """Print detailed results with source file analysis."""
    print(f"\n{'='*80}")
    print(f"DETAILED ANALYSIS: MISSING DESCRIPTIONS IN INTERFACES")
    print(f"{'='*80}")

    # Group by interface name to show conflicts
    interface_groups = {}
    for item in results:
        interface_name = item['interface_name']
        if interface_name not in interface_groups:
            interface_groups[interface_name] = []
        interface_groups[interface_name].append(item)

    total_missing = 0

    for interface_name, items in interface_groups.items():
        print(f"\n[INTERFACE] {interface_name}")
        print("-" * 60)

        # Show source file conflicts if any
        all_source_files = set()
        for item in items:
            all_source_files.update(item['source_files'])

        if len(all_source_files) > 1:
            print(f"[WARNING] Multiple source files found!")
            for src_file in sorted(all_source_files):
                print(f"   - {src_file}")
        elif len(all_source_files) == 1:
            print(f"[SOURCE] {list(all_source_files)[0]}")
        else:
            print(f"[ERROR] No source file found!")

        print()

        for item in items:
            print(f"  [MISSING] {item['property']}")
            print(f"     Type: {item['type']}")
            print(f"     Docs: {item['file']}")

            # Analyze source files for this property
            for src_file in item['source_files']:
                jsdoc_info = check_jsdoc_in_source_file(src_file, interface_name, item['property'])
                if jsdoc_info.get('found_property'):
                    if jsdoc_info.get('has_jsdoc'):
                        if jsdoc_info.get('has_annotations'):
                            print(f"     [FIX_NEEDED] JSDoc with annotations")
                        else:
                            print(f"     [OK] Has proper JSDoc")
                    else:
                        print(f"     [ADD_JSDOC] Missing JSDoc")
                else:
                    print(f"     [NOT_FOUND] Property not found in {src_file}")

            print()
            total_missing += 1

    print(f"\n{'='*80}")
    print(f"SUMMARY: {total_missing} properties missing descriptions")
    print(f"{'='*80}")

def main():
    """Main function."""
    print("[ANALYZING] Detailed analysis of markdown documentation for missing descriptions...")

    results = analyze_docs_directory_detailed()
    print_detailed_results(results)

if __name__ == "__main__":
    main()