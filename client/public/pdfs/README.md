# PDFs Folder

This folder contains PDF documents used throughout the portfolio.

## Required Files

Add the following PDF files to this folder:

1. **Bryan Hach Resume 2025.pdf** - Resume/CV document
   - Used in: Finder app → Resume section
   - Behavior: Downloads when user clicks "Download Resume" button

2. **Webtoon Report - Bryan Hach 2025.pdf** - Webtoon platform economics analysis report
   - Used in: Finder app → Case Studies → Webtoon Analysis
   - Behavior: Opens in browser when user clicks "Read Full Analysis"

3. **Epic Games Report - Bryan Hach 2025.pdf** - Epic Games Store analysis report
   - Used in: Finder app → Case Studies → Epic Games Analysis
   - Behavior: Opens in browser when user clicks "Read Full Analysis"

## File Structure

```
/client/public/pdfs/
  ├── README.md (this file)
  ├── Bryan Hach Resume 2025.pdf
  ├── Webtoon Report - Bryan Hach 2025.pdf
  └── Epic Games Report - Bryan Hach 2025.pdf
```

## Adding Your PDFs

Simply add your PDF files to this folder with the exact names listed above. The portfolio will automatically link to them.

If you want to use different filenames, update the paths in:
- `/client/src/apps/Finder.tsx` (RESUME_CONFIG and caseStudies array)
