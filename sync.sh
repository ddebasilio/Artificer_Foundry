#!/bin/bash

# Target destination folder
TARGET="/Users/daniel/Sites/dndftw/foundry-vtt/server_setup/foundryData/Data/modules/artificer-foundry"

# Excluded folders/files from sync
EXCLUDES=(
  --exclude=".git/"
  --exclude=".gitignore"
  --exclude=".idea/"
  --exclude=".claude/"
  --exclude=".agents/"
  --exclude="AGENTS.md"
  --exclude="Rolling_tables.md"
  --exclude="sync.sh"
)

sync_files() {
  echo "Syncing changes to local Foundry modules..."
  mkdir -p "$TARGET"
  rsync -av --delete "${EXCLUDES[@]}" ./ "$TARGET/"
  echo "Sync complete!"
}

# Watch mode using fswatch (if installed)
watch_mode() {
  if ! command -v fswatch &> /dev/null; then
    echo "Error: fswatch is required for watch mode. Install it with: brew install fswatch"
    exit 1
  fi

  echo "Watching for changes in $(pwd)..."
  sync_files
  
  # Watch current directory, excluding hidden git files, and trigger sync_files on change
  fswatch -o -e "\.git" -e "\.idea" -e "\.claude" -r . | while read; do
    sync_files
  done
}

# Parse command line arguments
if [ "$1" == "--watch" ] || [ "$1" == "-w" ]; then
  watch_mode
else
  sync_files
fi
