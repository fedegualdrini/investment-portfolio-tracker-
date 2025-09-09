#!/usr/bin/env python3
"""
Simple script to generate directory structure for Cursor AI
Similar to Twiggy but without the complex dependencies
"""

import os
import yaml
from pathlib import Path

def should_ignore(path, ignore_patterns):
    """Check if a path should be ignored based on patterns"""
    path_str = str(path)
    for pattern in ignore_patterns:
        if pattern in path_str:
            return True
    return False

def generate_directory_structure(root_path, ignore_patterns, max_depth=10, current_depth=0):
    """Generate XML-like directory structure"""
    if current_depth >= max_depth:
        return ""
    
    structure = []
    items = []
    
    try:
        for item in sorted(Path(root_path).iterdir()):
            if should_ignore(item, ignore_patterns):
                continue
                
            if item.is_dir():
                sub_structure = generate_directory_structure(
                    item, ignore_patterns, max_depth, current_depth + 1
                )
                if sub_structure.strip():
                    items.append(f"<folder name='{item.name}'>\n{sub_structure}</folder>")
                else:
                    items.append(f"<folder name='{item.name}'/>")
            else:
                items.append(f"<file name='{item.name}'/>")
    except PermissionError:
        pass
    
    return "\n".join(items)

def main():
    # Configuration
    ignore_patterns = [
        "node_modules",
        ".git",
        "dist",
        "build",
        ".next",
        "coverage",
        ".nyc_output",
        "*.log",
        ".DS_Store",
        "Thumbs.db",
        "__pycache__",
        ".pytest_cache",
        "venv",
        "env",
        ".env",
        "generate_structure.py",
        "watch_structure.py",
        "start-structure-watcher.bat"
    ]
    
    # Generate structure
    root_path = "."
    structure = generate_directory_structure(root_path, ignore_patterns)
    
    # Create the output
    output = f"""# Project File Structure

This file is auto-generated to help Cursor AI understand the project structure.

<project_structure>
{structure}
</project_structure>

## Key Directories

- `src/` - Main source code
- `src/components/` - React components
- `src/pages/` - Page components
- `src/services/` - API and business logic services
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `src/contexts/` - React contexts
- `src/hooks/` - Custom React hooks
- `api/` - Backend API endpoints
- `config/` - Configuration files
- `docs/` - Project documentation
- `public/` - Static assets

## Important Files

- `package.json` - Node.js dependencies and scripts
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `vercel.json` - Vercel deployment configuration
"""
    
    # Write to file
    output_path = ".cursor/rules/file-structure.mdc"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output)
    
    print(f"✅ Directory structure generated: {output_path}")
    print(f"📁 Found {len(structure.split('<file'))} files and folders")

if __name__ == "__main__":
    main()
