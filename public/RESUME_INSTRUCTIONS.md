# Resume Setup Instructions

## How to add your resume to the portfolio

1. **Add your resume PDF** to this `/public` folder
   - Name it `resume.pdf` OR
   - Name it whatever you want and update the path in `/client/src/apps/Finder.tsx`

2. **Update the configuration** in `Finder.tsx`:
   ```typescript
   const RESUME_CONFIG = {
     url: "/resume.pdf",  // Change this to match your file
     filename: "YourName_Resume.pdf"  // What users will download it as
   };
   ```

3. **Your resume will be downloadable** from the Finder app's "Resume" section

## Example file structure:
```
/public
  ├── resume.pdf (your resume goes here)
  ├── RESUME_INSTRUCTIONS.md (this file)
  └── ...other files
```

## Supported formats:
- PDF (recommended)
- Any file type, really - just update the filename and url accordingly
