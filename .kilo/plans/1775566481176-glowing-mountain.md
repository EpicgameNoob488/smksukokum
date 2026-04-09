# Plan: Remove "Add Student" Buttons

## Overview
Remove the "Add Student" buttons from two locations in the application:
1. StudentTable.tsx - the student list page (when viewing a specific class)
2. Dashboard.tsx - the class card view in the Students tab

**Note:** Delete functionality for students is already restricted to admin users only (via conditional rendering in `EditTeacherModal.tsx`). No changes to delete functionality are required.

## Files to Modify

### 1. src/components/StudentTable.tsx
- **Location**: Lines 168-228 (the button in the header section)
- **Action**: Remove the entire button element and its surrounding code
- **Impact**: The student list page will no longer have an "Add Student" button. Teachers will need to use alternative methods to add students (if any).

### 2. src/components/Dashboard.tsx
- **Location**: Lines 1723-1785 (the button in the Students tab class card view)
- **Action**: Remove the entire button element
- **Impact**: The class cards in the Students tab will no longer have an "Add Student" button.

## Implementation Steps

### Step 1: Backup Files
- Create backups of both files before modification (optional but recommended)

### Step 2: Modify StudentTable.tsx
- Remove lines 168-228 (the button and its surrounding code)
- Ensure the surrounding HTML structure remains valid

### Step 3: Modify Dashboard.tsx
- Remove lines 1723-1785 (the button)
- Ensure the surrounding HTML structure remains valid

### Step 4: Verify Changes
- Check that the files compile without errors
- Verify that the buttons are no longer present in the UI
- Ensure no broken functionality (e.g., missing event handlers that were used elsewhere)

## Considerations

- The buttons may be used by different user roles (admin vs teacher). Ensure that removing them doesn't break any role-based functionality.
- If the buttons are the only way to add students, consider adding alternative methods (not requested by user).
- The code should be checked for any references to these buttons in tests or other components.

## Testing
- Run the application to ensure it compiles and runs.
- Navigate to the student list page and the dashboard students tab to confirm the buttons are gone.
- Check for any console errors or broken functionality.

## Rollback
If issues arise, restore from the backup files.