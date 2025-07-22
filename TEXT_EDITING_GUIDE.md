# Text Editing Guide for Forgiveness Journey App

## Overview
This guide provides comprehensive instructions for editing text content throughout the Forgiveness Journey app after deployment. All text content is stored in easily accessible files that can be modified without technical expertise.

## Key Text Content Locations

### 1. Hero Section (Home Page)
**File:** `client/src/pages/home.tsx`
**Location:** Lines 119-140

**Main Headline:**
```tsx
<h1 className="text-3xl font-bold mb-3 leading-tight">
  RELEASE & Find Peace
</h1>
```

**Subtitle:**
```tsx
<p className="text-white/90 font-medium text-lg">Transform Your Life By Releasing:</p>
```

**Release Tags (Core Benefits):**
```tsx
<span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Resentments</span>
<span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Grievances</span>
<span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Anger</span>
<span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Trauma</span>
<span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Toxic Relationships</span>
```

**Outcome Message:**
```tsx
<span className="font-semibold text-lg">Gain Peace of Mind</span>
```

### 2. Landing Page Content
**File:** `client/src/pages/landing.tsx`

**Main Headlines:** Look for `<h1>` and `<h2>` tags
**Descriptions:** Look for `<p>` tags with descriptive content
**Button Text:** Look for `<Button>` components

### 3. Journey Steps Content
**File:** `shared/schema.ts` and related step files

**Step Titles and Descriptions:** Each RELEASE step (R-E-L-E-A-S-E) has editable:
- Title
- Description
- Guided content
- Journal prompts

### 4. Navigation and Menu Text
**File:** `client/src/components/NavigationHeader.tsx`
**File:** `client/src/components/BottomNavigation.tsx`

**Menu Items:** 
- Home
- Journal
- Progress
- Community
- Profile

### 5. Journey Options Section
**File:** `client/src/pages/home.tsx` (Lines 153-200)

**Free Journey Card:**
```tsx
<h4 className="font-bold text-green-800 text-base">Free Forgiveness Journey</h4>
<p className="text-sm text-green-700 mb-2">Self-guided journey with abundant resources from forgiveness.world</p>
```

**Guided Journey Card:**
```tsx
<h4 className="font-bold text-amber-800 text-base">Guided Forgiveness Journey</h4>
<p className="text-sm text-amber-700 mb-2">AI-assisted journey with personalized support and group sessions</p>
```

## How to Edit Text Content

### Step 1: Locate the File
1. Navigate to the file containing the text you want to edit
2. Use the file paths provided above
3. Look for the specific line numbers mentioned

### Step 2: Find the Text
1. Use Ctrl+F (or Cmd+F on Mac) to search for the exact text
2. Text is usually wrapped in quotes or between HTML tags
3. Examples:
   - `"RELEASE & Find Peace"` - text in quotes
   - `>Transform Your Life<` - text between tags

### Step 3: Edit the Text
1. Replace the existing text with your new content
2. Keep the same formatting structure
3. Preserve any special characters or HTML tags
4. Maintain the same quote style (single or double quotes)

### Step 4: Save and Test
1. Save the file
2. The development server will automatically reload
3. Check the changes in your browser
4. Test on both desktop and mobile views

## Common Text Editing Examples

### Example 1: Change Main Headline
**Find:**
```tsx
<h1 className="text-3xl font-bold mb-3 leading-tight">
  RELEASE & Find Peace
</h1>
```

**Change to:**
```tsx
<h1 className="text-3xl font-bold mb-3 leading-tight">
  Your New Healing Journey
</h1>
```

### Example 2: Update Release Benefits
**Find:**
```tsx
<span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Resentments</span>
```

**Change to:**
```tsx
<span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Past Hurts</span>
```

### Example 3: Modify Journey Description
**Find:**
```tsx
<p className="text-white/90 font-medium text-lg">Transform Your Life By Releasing:</p>
```

**Change to:**
```tsx
<p className="text-white/90 font-medium text-lg">Heal Your Heart By Letting Go Of:</p>
```

## Multi-Language Text Editing

### Translation Files
**Location:** `client/src/lib/i18n.ts`

**Structure:**
```typescript
const translations = {
  en: {
    welcome: "Welcome to your journey",
    // Add more English text here
  },
  es: {
    welcome: "Bienvenido a tu viaje",
    // Add more Spanish text here
  },
  fr: {
    welcome: "Bienvenue dans votre voyage",
    // Add more French text here
  }
};
```

### How to Add New Translations
1. Add the English version first in the `en` section
2. Add corresponding translations in `es` and `fr` sections
3. Use the translation key in your components: `{t('welcome')}`

## Advanced Text Editing

### Adding New Text Blocks
1. **Find a similar existing text block**
2. **Copy the structure**
3. **Paste it in the desired location**
4. **Modify the content**
5. **Update any IDs or classes if needed**

### Example: Adding a New Feature Description
```tsx
<div className="text-center mb-6">
  <h3 className="text-xl font-semibold mb-2">New Feature Title</h3>
  <p className="text-gray-600">Description of your new feature and its benefits.</p>
</div>
```

### Styling Text Content
**Bold Text:** `className="font-bold"`
**Large Text:** `className="text-xl"` or `className="text-2xl"`
**Colored Text:** `className="text-blue-600"` or `className="text-green-500"`
**Centered Text:** `className="text-center"`

## Content Guidelines

### 1. Tone and Voice
- **Compassionate:** Use warm, understanding language
- **Hopeful:** Focus on positive transformation
- **Non-judgmental:** Avoid blame or criticism
- **Inclusive:** Welcome all backgrounds and experiences

### 2. Key Messaging
- **Transformation:** Emphasize positive change
- **Peace:** Highlight the peaceful outcome
- **Support:** Stress available help and community
- **Progress:** Focus on journey and growth

### 3. RELEASE Method Integration
Always reference the 7-step RELEASE methodology:
- **R** - Recognize
- **E** - Experience
- **L** - Let Go
- **E** - Embrace
- **A** - Accept
- **S** - Seek
- **E** - Express

### 4. Forgiveness Focus
- Center content around forgiveness of self and others
- Reference releasing resentments, grievances, anger, trauma
- Emphasize gaining peace of mind
- Connect to emotional healing and wellness

## Testing Your Changes

### 1. Visual Check
- Ensure text displays correctly
- Check for proper spacing and alignment
- Verify colors and fonts look good
- Test readability on different screen sizes

### 2. Content Review
- Read through for clarity and flow
- Check spelling and grammar
- Ensure consistent tone throughout
- Verify all links and buttons work

### 3. User Experience
- Test navigation with new text
- Ensure buttons and links are clear
- Check that instructions are easy to follow
- Verify mobile responsiveness

## Deployment Notes

- All text changes will be automatically deployed when you push to your repository
- Changes are immediately visible in development mode
- Production deployment preserves all your text customizations
- Always test changes before deploying to production

## Emergency Text Fixes

If you encounter issues:

1. **Broken Layout:** Check for missing quotes or brackets
2. **Missing Text:** Verify the file was saved properly
3. **Display Issues:** Clear browser cache and refresh
4. **Translation Problems:** Check the i18n.ts file for syntax errors

## Contact Support

For assistance with text editing:
- Check this guide first
- Review the HERO_EDITING_GUIDE.md for hero section specifics
- Test changes in development before deploying
- Keep backups of your original text content