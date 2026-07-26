#!/bin/bash

# Release script
# Usage: ./release.sh <version>

set -e

if ! command -v gh &> /dev/null; then
  echo "Error: GitHub CLI (gh) is not installed. Please install it before releasing."
  exit 1
fi

# Check if a version argument is provided
if [ -z "$1" ]; then
  echo "Please specify a version number (e.g., 1.0.0)"
  exit 1
fi

NEW_VERSION=$1

# Update the version in package.json
VERSION=$(echo $NEW_VERSION | sed 's/^v//')  # Remove 'v' prefix if present

# Update root package.json
npm version $VERSION --no-git-tag-version --allow-same-version

# Commit the version change
git add .

git commit --allow-empty -m "Bump version to $NEW_VERSION"

# Create a new tag
git tag "v$NEW_VERSION"

# Push changes and tag to the remote repository
git push origin main
git push origin "v$NEW_VERSION"

# Create a GitHub release using the GitHub CLI
if command -v gh &> /dev/null; then
  gh release create "v$NEW_VERSION" --title "Release v$NEW_VERSION" --notes "Release for version $NEW_VERSION"
else
  echo "GitHub CLI not found. Please install it to create a release."
  # restore updated package version back to its initial
  git checkout -- package.json
  git checkout -- package-lock.json
  exit 1

fi

echo "Release v$NEW_VERSION created and pushed!"

#usage
# ./release.sh 0.0.1
