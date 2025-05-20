#!/bin/bash

# Set variables
NEW_PANEL_NAME="Books2Panel"
NEW_ROUTE_NAME="books2"
NEW_DISPLAY_LABEL="Books 2"

echo "Creating new panel ${NEW_PANEL_NAME} for Next.js project"

# Check if the original Books component exists
BOOKS_DIR="./frontend/app/components/books"
if [ ! -d "$BOOKS_DIR" ]; then
  echo "Creating books component directory"
  mkdir -p "$BOOKS_DIR"
fi

if [ ! -f "${BOOKS_DIR}/BooksPanel.tsx" ] && [ ! -f "${BOOKS_DIR}/BooksPanel.jsx" ]; then
  echo "Error: Books component not found in expected locations"
  exit 1
fi

# Determine file extension (.tsx or .jsx)
if [ -f "${BOOKS_DIR}/BooksPanel.tsx" ]; then
  EXT="tsx"
else
  EXT="jsx"
fi

# Create new panel component as a copy of BooksPanel
cp "${BOOKS_DIR}/BooksPanel.${EXT}" "${BOOKS_DIR}/${NEW_PANEL_NAME}.${EXT}"
echo "Created component file: ${BOOKS_DIR}/${NEW_PANEL_NAME}.${EXT}"

# Update component name in the new file
sed -i "s/BooksPanel/${NEW_PANEL_NAME}/g" "${BOOKS_DIR}/${NEW_PANEL_NAME}.${EXT}"
echo "Updated component name references"

# Create or update page route directory
mkdir -p "./frontend/app/${NEW_ROUTE_NAME}"

# Create layout.tsx for the new route
cat > "./frontend/app/${NEW_ROUTE_NAME}/layout.tsx" << EOF
export default function ${NEW_PANEL_NAME}Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
EOF
echo "Created layout file at ./frontend/app/${NEW_ROUTE_NAME}/layout.tsx"

# Create page.tsx with proper imports
cat > "./frontend/app/${NEW_ROUTE_NAME}/page.tsx" << EOF
import ${NEW_PANEL_NAME} from '../../components/books/${NEW_PANEL_NAME}';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${NEW_DISPLAY_LABEL}',
  description: '${NEW_DISPLAY_LABEL} panel',
};

export default function ${NEW_ROUTE_NAME}Page() {
  return <${NEW_PANEL_NAME} />;
}
EOF
echo "Created route page at ./frontend/app/${NEW_ROUTE_NAME}/page.tsx"

# Find and update Navigation.tsx
NAVIGATION_FILE="./frontend/app/components/ui/Navigation.tsx"
if [ -f "$NAVIGATION_FILE" ]; then
  # Check if the books entry exists to place our new entry after it
  if grep -q "path: '/books'" "$NAVIGATION_FILE"; then
    # Use awk to insert the new navigation item after the books entry
    awk '/path: .\/books./ { print; print "  { path: '"'"'\/'"$NEW_ROUTE_NAME"''"'"', label: '"'"''"$NEW_DISPLAY_LABEL"''"'"', icon: <Book size={18} \/> },"; next }1' "$NAVIGATION_FILE" > temp.txt
    mv temp.txt "$NAVIGATION_FILE"
    echo "Added navigation item to $NAVIGATION_FILE"
  else
    echo "Warning: Could not find '/books' path in Navigation.tsx. You may need to add it manually."
  fi
else
  echo "Warning: Navigation.tsx not found at expected location. You may need to update navigation manually."
fi

echo "Done! The new panel is accessible at /${NEW_ROUTE_NAME}"
