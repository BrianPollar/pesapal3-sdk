#!/bin/bash

# Check if a version argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <new-version>"
  exit 1
fi

NEW_VERSION=$1

# Update the version in package.json
npm version $NEW_VERSION

# Commit the version change
git add .

git commit -m "Bump version to $NEW_VERSION"

# Create a new tag
git tag "v$NEW_VERSION"

# Push changes and tags to the remote repository
git push origin main --tags

# Create a GitHub release using the GitHub CLI
if command -v gh &> /dev/null; then
  gh release create "v$NEW_VERSION" --title "Release v$NEW_VERSION" --notes "Release for version $NEW_VERSION"
else
  echo "GitHub CLI not found. Please install it to create a release."
fi

echo "Release v$NEW_VERSION created and pushed!"