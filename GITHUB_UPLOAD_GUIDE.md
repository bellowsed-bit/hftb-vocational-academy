# Homes for the Brave Vocational Services Academy
## One Complete ZIP — Existing Repository Replacement Instructions

This ZIP contains the complete current website. You do not need any other package.

## What to Do

1. Download `Homes_for_the_Brave_Unified_Vocational_Academy_GitHub_Source.zip`.
2. Open your computer's **Downloads** folder.
3. Right-click the ZIP and select **Extract All**.
4. Select **Extract**.
5. Open the extracted folder.
6. Sign in to GitHub and open your existing Academy repository.
7. Confirm you are on the repository's main page and the branch says `main`.
8. Select **Add file → Upload files**.
9. Return to the extracted folder on your computer.
10. Select **everything inside the extracted folder**.
11. Drag all selected folders and files into GitHub's upload area.
12. Wait for GitHub to finish processing the files.
13. Enter this commit message:

    `Replace Academy website with complete updated version`

14. Select **Commit changes**.

## Important

- Upload the contents of the extracted folder—not the ZIP itself.
- Do not upload the outer folder as one extra folder.
- Matching files in the repository will be updated.
- The complete package contains the dark theme, logo, Work-Life Balance course, Communication Skills course, multiple-choice activities, browser workbook, navigation, and final combined style summary.

## The Repository's Top Level Should Show

```text
app/
public/
scripts/
.openai/
GITHUB_UPLOAD_GUIDE.md
README.md
package.json
package-lock.json
tsconfig.json
vite.config.ts
```

Correct:

```text
repository/app/
repository/public/
repository/package.json
```

Incorrect:

```text
repository/Homes_for_the_Brave_Complete_Website_Replacement/app/
```

## After Uploading

1. Open the repository's **Actions** tab if your website uses GitHub Actions.
2. Wait for the newest process to finish.
3. Open the public Academy website.
4. Confirm the homepage is dark.
5. Open Work-Life Balance and Communication Skills.
6. Confirm Communication Skills uses multiple-choice activities rather than typing boxes.
7. Complete the two assessments and confirm the final summary identifies the participant's behavior style, communication style, likely best working match, most challenging match, reasons, and improvement strategies.

That is the complete process. No branches and no separate update packages are required.
