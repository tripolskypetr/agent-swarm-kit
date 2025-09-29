#!/usr/bin/env python3
"""
Script to analyze markdown documentation files and find properties/fields with missing descriptions.
"""
import os
import re
from pathlib import Path

def analyze_markdown_file(file_path):
    """Analyze a single markdown file for missing descriptions."""
    missing_descriptions = []

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

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
                'file': str(file_path)
            })

    return missing_descriptions

def analyze_docs_directory():
    """Analyze all markdown files in docs directories."""
    base_path = Path('docs')

    categories = ['interfaces', 'functions', 'types']
    all_missing = {}

    for category in categories:
        category_path = base_path / category
        if not category_path.exists():
            print(f"Directory {category_path} not found, skipping...")
            continue

        all_missing[category] = []

        # Find all .md files in the category
        md_files = list(category_path.glob('*.md'))

        print(f"\nAnalyzing {len(md_files)} files in {category}/...")

        for md_file in md_files:
            missing = analyze_markdown_file(md_file)
            if missing:
                all_missing[category].extend([{
                    'interface_name': md_file.stem,
                    **item
                } for item in missing])

    return all_missing

def print_results(results):
    """Print the results in a structured format."""
    total_missing = 0

    for category, items in results.items():
        if items:
            print(f"\n{'='*50}")
            print(f"CATEGORY: {category.upper()}")
            print(f"{'='*50}")

            current_interface = None
            for item in items:
                if item['interface_name'] != current_interface:
                    current_interface = item['interface_name']
                    print(f"\n[FILE] {current_interface}")
                    print("-" * 40)

                print(f"  [MISSING] {item['property']}")
                print(f"     Type: {item['type']}")
                print(f"     File: {item['file']}")
                print()
                total_missing += 1
        else:
            print(f"\n[OK] {category.upper()}: No missing descriptions found")

    print(f"\n{'='*50}")
    print(f"SUMMARY: {total_missing} properties missing descriptions")
    print(f"{'='*50}")

def main():
    """Main function."""
    print("[ANALYZING] markdown documentation for missing descriptions...")

    results = analyze_docs_directory()
    print_results(results)

if __name__ == "__main__":
    main()