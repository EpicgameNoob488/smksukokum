---
description: "Professional Git workflow: Always use Git best practices for backups, branching, and collaboration. Automatically commit changes, create branches, and follow clean commit conventions."
applyTo: "**/*.{ts,tsx,js,jsx,json,md,css,html}"
---

# Professional Git Workflow Instructions

## Always Follow These Practices

### Before Starting Any Code Changes
1. **Check Git Status**: Run `git status` to see current state
2. **Pull Latest**: `git pull origin main` to get latest changes
3. **Create Feature Branch**: `git checkout -b feature/description` (never work on main)

### During Development
1. **Frequent Commits**: Commit every 30-60 minutes of work or after each logical change
   - `git add .` (or specific files)
   - `git commit -m "type: descriptive message"`
2. **Commit Message Standards**:
   - `feat:` - new features
   - `fix:` - bug fixes
   - `refactor:` - code improvements
   - `docs:` - documentation
   - `test:` - tests
   - `chore:` - maintenance

### Before Pushing
1. **Rebase**: `git pull --rebase origin main` to avoid merge commits
2. **Push Branch**: `git push origin feature/branch-name`

### Code Review Process
1. Create pull request on GitHub/GitLab
2. Address feedback with additional commits
3. Squash commits before merge: `git rebase -i HEAD~n`

## Emergency Practices
- **Quick Backup**: `git add . && git commit -m "WIP: backup"`
- **Stash Work**: `git stash` for temporary saves

## What to Avoid
- Working directly on main branch
- Large commits with multiple unrelated changes
- Force pushing without coordination
- Committing secrets or large binaries

## Automatic Behavior
When implementing features, always:
- Show Git commands being executed
- Commit after each major change
- Ask for confirmation before pushing to main
- Create descriptive commit messages
- Use feature branches for all work