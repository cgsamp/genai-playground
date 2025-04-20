#!/bin/bash

shopt -s globstar dotglob nullglob

for file in **/*.java; do
  # Skip hidden files and files in hidden directories
  if [[ "$file" == */.*/* || "$file" == .* || "$file" == */.* ]]; then
    continue
  fi

  echo ">>> $file"
  cat "$file"
  echo -e "\n-----------"
done
