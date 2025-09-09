#!/usr/bin/env python3
"""
Simple file watcher to regenerate directory structure when files change
"""

import os
import time
import subprocess
from pathlib import Path

def watch_and_regenerate():
    """Watch for file changes and regenerate structure"""
    print("🌿 Starting directory structure watcher...")
    print("📁 Watching for changes in project files...")
    print("🔄 Press Ctrl+C to stop")
    
    last_modified = {}
    
    try:
        while True:
            # Check for changes in key directories
            changed = False
            watch_dirs = ['src', 'api', 'config', 'docs', 'public']
            
            for watch_dir in watch_dirs:
                if os.path.exists(watch_dir):
                    for root, dirs, files in os.walk(watch_dir):
                        # Skip node_modules and other ignored directories
                        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build']]
                        
                        for file in files:
                            file_path = os.path.join(root, file)
                            try:
                                current_modified = os.path.getmtime(file_path)
                                if file_path not in last_modified or last_modified[file_path] != current_modified:
                                    last_modified[file_path] = current_modified
                                    changed = True
                            except (OSError, IOError):
                                pass
            
            if changed:
                print("🔄 Changes detected, regenerating structure...")
                try:
                    result = subprocess.run(['python', 'generate_structure.py'], 
                                          capture_output=True, text=True, cwd=os.getcwd())
                    if result.returncode == 0:
                        print("✅ Structure updated!")
                    else:
                        print(f"❌ Error updating structure: {result.stderr}")
                except Exception as e:
                    print(f"❌ Error updating structure: {e}")
            
            time.sleep(2)  # Check every 2 seconds
            
    except KeyboardInterrupt:
        print("\n👋 Stopping watcher...")

if __name__ == "__main__":
    watch_and_regenerate()
