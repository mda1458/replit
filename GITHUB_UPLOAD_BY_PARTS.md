# GitHub Upload Strategy - Upload by Parts

## Issue: Server Folder Too Large
The `server/` folder contains too many files for GitHub's single upload limit.

## Solution: Upload Individual Files from Server Folder

### Server Files to Upload Individually:
```
📄 server/aiSummaryService.ts
📄 server/db.ts
📄 server/index.ts
📄 server/openai.ts
📄 server/replitAuth.ts
📄 server/routes.ts
📄 server/sampleFacilitators.ts
📄 server/sampleGroupSessions.ts
📄 server/storage.ts
📄 server/vite.ts
```

## Step-by-Step Upload Process:

### Phase 1: Upload Configuration Files First
1. Upload these 8 files individually:
   - `package.json`
   - `package-lock.json`
   - `tsconfig.json`
   - `vite.config.ts`
   - `tailwind.config.ts`
   - `components.json`
   - `drizzle.config.ts`
   - `postcss.config.js`

### Phase 2: Create Server Folder and Upload Files
1. **Create server folder** in GitHub:
   - Click "Add file" → "Create new file"
   - Type: `server/temp.txt`
   - Add any content, commit
   - This creates the server folder

2. **Upload server files individually**:
   - Go into the `server/` folder in GitHub
   - Upload each .ts file one by one
   - Delete `temp.txt` when done

### Phase 3: Upload Other Folders
1. Try uploading `client/` folder (may need to do by parts too)
2. Upload `shared/` folder (should be small)
3. Upload `attached_assets/` folder

### Phase 4: Upload Documentation
Upload all `.md` files including `replit.md`

## Alternative: Create Files Manually

If upload continues to fail:

1. **Copy file contents** from your local files
2. **Create new files** in GitHub one by one
3. **Paste content** into each file
4. **Commit** each file

This takes longer but guarantees success.

## Quick Server File Upload Order:
1. `server/index.ts` (main server file)
2. `server/routes.ts` (API routes)
3. `server/db.ts` (database connection)
4. `server/storage.ts` (data operations)
5. `server/replitAuth.ts` (authentication)
6. `server/openai.ts` (AI features)
7. `server/aiSummaryService.ts` (AI summaries)
8. `server/sampleFacilitators.ts` (sample data)
9. `server/sampleGroupSessions.ts` (sample data)
10. `server/vite.ts` (development server)

This approach bypasses GitHub's file limit by uploading files individually rather than entire folders.