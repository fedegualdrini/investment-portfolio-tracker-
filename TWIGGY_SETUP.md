# Twiggy Setup for Cursor AI

This project now includes a custom implementation of directory structure tracking for Cursor AI, similar to [Twiggy](https://github.com/twiggy-tools/Twiggy).

## What This Does

- **Real-time Directory Structure**: Generates a detailed file structure that Cursor AI can use to understand your codebase
- **Auto-updates**: Watches for file changes and updates the structure automatically
- **Better AI Context**: Helps Cursor AI provide more accurate suggestions and assistance

## Files Created

- `twiggy.yml` - Configuration file (similar to original Twiggy)
- `generate_structure.py` - Script to generate directory structure
- `watch_structure.py` - File watcher for real-time updates
- `start-structure-watcher.bat` - Windows batch file to start watcher
- `.cursor/rules/file-structure.mdc` - Generated structure file for Cursor AI

## How to Use

### Option 1: Manual Generation
```bash
python generate_structure.py
```

### Option 2: Continuous Watching (Recommended)
```bash
# Start the watcher
python watch_structure.py

# Or on Windows, double-click:
start-structure-watcher.bat
```

### Option 3: Windows Batch File
Double-click `start-structure-watcher.bat` to start the watcher.

## What Gets Ignored

The following patterns are automatically ignored:
- `node_modules/`
- `.git/`
- `dist/`
- `build/`
- `.next/`
- `coverage/`
- `*.log`
- `.DS_Store`
- `Thumbs.db`
- `__pycache__/`
- And anything in your `.gitignore`

## Benefits for Your Project

1. **Better Component Suggestions**: AI knows about all your React components
2. **Accurate Import Paths**: AI can suggest correct import statements
3. **Service Discovery**: AI understands your API services and utilities
4. **Real-time Updates**: Structure updates when you add new files

## Configuration

Edit `twiggy.yml` to customize:
- Output format (xml/tree)
- Ignore patterns
- Output file location

## Troubleshooting

If the watcher stops working:
1. Check that Python is installed: `python --version`
2. Restart the watcher: `python watch_structure.py`
3. Manually regenerate: `python generate_structure.py`

## Integration with Cursor

The generated `.cursor/rules/file-structure.mdc` file is automatically picked up by Cursor AI and provides context about your project structure. You should see improved AI assistance when working with your investment portfolio tracker.
