# Validation Workflow

This document explains when and how validation happens in the Where In Maginhawa repository.

## Overview

Validation happens at **two different stages**:

1. **PR Validation** (Pull Request) - Immediate feedback for contributors
2. **Build Validation** (After merge) - Safety check before deployment

---

## 1. PR Validation (validate-pr.yml)

### When It Runs

- ✅ When a pull request is **opened**
- ✅ When new commits are **pushed** to an open PR
- ✅ When a closed PR is **reopened**
- ✅ Only if files in `apps/web/src/data/places/*.json` are changed

### What It Does

```mermaid
1. Detects changed place files
   ↓
2. Validates each changed file
   ↓
3. Posts comment on PR with results
   ↓
4. ✅ Pass: PR is ready for review
   ❌ Fail: PR blocked until fixed
```

### Comment Examples

**Success Comment:**
```markdown
## ✅ Place File Validation Passed

All changed place files have been validated successfully!

### ✅ `apps/web/src/data/places/new-restaurant.json`

Validation passed!

---

**Next Steps:**
- Wait for review from maintainers
- Once merged, the places index will be automatically rebuilt
- Your changes will be deployed to production
```

**Failure Comment:**
```markdown
## ❌ Place File Validation Failed

Some place files have validation errors that need to be fixed:

### ❌ `apps/web/src/data/places/new-restaurant.json`

  • id: ID must be a valid UUID
  • slug: Slug must be kebab-case
  • operatingHours.monday.open: Time must be in HH:MM format

---

**How to Fix:**

1. Review the validation errors above
2. Fix the issues in your JSON files
3. Common fixes:
   - Ensure `id` is a valid UUID
   - Check `slug` uses only lowercase letters, numbers, and hyphens
   - Verify `operatingHours` uses 24-hour format (HH:MM)
4. Push your changes to update this PR
```

### Validation Checks

The PR validation checks:

- ✅ **UUID Format**: `id` must be a valid UUID v4
- ✅ **Slug Format**: `slug` must be kebab-case (lowercase, hyphens only)
- ✅ **Required Fields**: All required fields are present
- ✅ **Email Format**: Valid email or empty string
- ✅ **URL Format**: Valid HTTP/HTTPS URLs
- ✅ **Time Format**: Operating hours in HH:MM (24-hour)
- ✅ **Price Range**: One of `$`, `$$`, `$$$`, `$$$$`
- ✅ **JSON Syntax**: Valid JSON structure

### Contributor Experience

1. Contributor creates PR with new place file
2. **Within seconds**, bot comments with validation results
3. If failed:
   - Contributor sees exactly what's wrong
   - Fixes the issues
   - Pushes changes
   - Validation runs again automatically
4. If passed:
   - PR is ready for maintainer review
   - Contributor knows their file is correct

---

## 2. Build Validation (build-and-deploy.yml)

### When It Runs

- ✅ When commits are **pushed to main** (after PR is merged)
- ✅ Only if files in `apps/web/src/data/places/*.json` changed
- ✅ Can also be triggered manually

### What It Does

```mermaid
1. Re-validates changed files (safety check)
   ↓
2. Builds places.json (index)
   ↓
3. Builds stats.json
   ↓
4. Commits built files back to main
   ↓
5. Triggers Vercel deployment
```

### Purpose

This is a **safety net** that:
- Catches any issues that might have slipped through
- Ensures data integrity before deployment
- Blocks bad data from reaching production

**Note**: This should rarely fail if PR validation is working correctly. If it does fail, it indicates:
- PR validation was bypassed (direct commit to main)
- Validation logic has a bug
- Schema requirements changed

---

## Validation Comparison

| Feature | PR Validation | Build Validation |
|---------|--------------|------------------|
| **Trigger** | Pull request opened/updated | Push to main |
| **Files Checked** | Only changed files | Only changed files |
| **Failure Action** | Blocks PR merge | Blocks deployment |
| **Feedback** | Comments on PR | Fails GitHub Action |
| **Who Sees It** | Contributors | Maintainers |
| **Purpose** | Help contributors | Protect production |

---

## Workflow Permissions

### PR Validation

```yaml
permissions:
  contents: read        # Read repository files
  pull-requests: write  # Comment on PRs
```

### Build and Deploy

```yaml
permissions:
  contents: write       # Commit built files
  pull-requests: read   # Read PR information
```

---

## Error Handling

### Common Validation Errors

1. **Invalid UUID**
   ```
   Error: ID must be a valid UUID
   Fix: Generate new UUID at https://www.uuidgenerator.net/
   ```

2. **Invalid Slug**
   ```
   Error: Slug must be kebab-case
   Fix: Use only lowercase letters, numbers, hyphens
   ```

3. **Invalid Time Format**
   ```
   Error: Time must be in HH:MM format
   Fix: Use 24-hour format like "09:00" or "14:30"
   ```

4. **Missing Required Field**
   ```
   Error: [field] is required
   Fix: Add the missing field to your JSON
   ```

### Debugging Failed Validation

If validation fails unexpectedly:

1. **Check GitHub Actions logs**:
   - Go to PR → "Checks" tab
   - Click on "Validate Place Files"
   - View detailed logs

2. **Run validation locally**:
   ```bash
   pnpm validate:place apps/web/src/data/places/your-file.json
   ```

3. **Compare with working example**:
   - Look at existing place files
   - Copy structure and replace values

---

## Maintainer Notes

### Bypassing PR Validation

**Don't do this unless necessary!** But if you must:

1. Direct commit to main will skip PR validation
2. Build validation will still run as safety net
3. If build validation fails, deployment is blocked

### Updating Validation Rules

If you update the validation schema (`scripts/validate-place.ts`):

1. Test changes locally first
2. Update CONTRIBUTING.md with new rules
3. Consider migration script for existing files
4. Announce changes to contributors

### Monitoring Validation

Check validation health:
- Review failed PR validations
- Check for recurring errors
- Update documentation if needed
- Consider schema improvements

---

## Future Improvements

Potential enhancements:

- [ ] Add spell checking for descriptions
- [ ] Validate coordinates are in Maginhawa area
- [ ] Check for duplicate places (by name/address)
- [ ] Suggest corrections (did you mean...?)
- [ ] Auto-fix common issues (time format, case)
- [ ] Validate phone number format
- [ ] Check URLs are accessible
- [ ] Validate image URLs load properly
