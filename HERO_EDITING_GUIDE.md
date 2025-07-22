# Hero Section Editing Guide

## Overview
The hero section is located in `client/src/pages/home.tsx` and can be easily customized after deployment to make it more attention-grabbing and highlight the app's core purpose.

## Current Hero Section Structure

The hero section is designed to emphasize the RELEASE method for transforming lives by releasing:
- **Resentments**
- **Grievances** 
- **Anger**
- **Trauma**
- **Toxic Relationships**

And gaining **Peace of Mind**.

## How to Edit the Hero Section

### 1. Access the File
After deployment, you can edit the hero section by modifying:
```
client/src/pages/home.tsx
```

### 2. Hero Section Location
Look for the section marked with `{/* Hero Section */}` (around line 96-151).

### 3. Customizable Elements

#### A. Main Headline
```tsx
<h1 className="text-3xl font-bold mb-3 leading-tight">
  RELEASE & Find Peace
</h1>
```
**Change this to:** Any compelling headline that resonates with your audience.

#### B. Subtitle
```tsx
<p className="text-white/90 font-medium text-lg">Transform Your Life By Releasing:</p>
```

#### C. Release Items (the core value proposition)
```tsx
<div className="flex flex-wrap justify-center gap-2 text-sm">
  <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Resentments</span>
  <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Grievances</span>
  <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Anger</span>
</div>
<div className="flex flex-wrap justify-center gap-2 text-sm">
  <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Trauma</span>
  <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Toxic Relationships</span>
</div>
```

#### D. Outcome Message
```tsx
<div className="flex items-center justify-center space-x-2 text-yellow-300">
  <Sparkles className="w-5 h-5" />
  <span className="font-semibold text-lg">Gain Peace of Mind</span>
  <Sparkles className="w-5 h-5" />
</div>
```

### 4. Visual Customizations

#### Background Gradient
```tsx
className="relative h-64 rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"
```
**Colors you can change:**
- `from-purple-600` → `from-green-600`, `from-orange-600`, etc.
- `via-blue-600` → `via-purple-600`, `via-teal-600`, etc.
- `to-indigo-700` → `to-blue-800`, `to-purple-800`, etc.

#### Central Icon
```tsx
<Heart className="w-8 h-8 text-white" />
```
**Can be replaced with other icons like:**
- `<Sparkles className="w-8 h-8 text-white" />`
- `<Star className="w-8 h-8 text-white" />`
- `<Sun className="w-8 h-8 text-white" />`

#### Floating Elements
```tsx
<div className="absolute top-4 left-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
  <TreePine className="w-6 h-6 text-white/70" />
</div>
```

### 5. Quick Customization Examples

#### Option 1: More Spiritual Theme
```tsx
<h1 className="text-3xl font-bold mb-3 leading-tight">
  Spiritual Healing Journey
</h1>
<p className="text-white/90 font-medium text-lg">Release What No Longer Serves You:</p>
```

#### Option 2: More Direct/Bold
```tsx
<h1 className="text-3xl font-bold mb-3 leading-tight">
  Break Free From Pain
</h1>
<p className="text-white/90 font-medium text-lg">Finally Let Go Of:</p>
```

#### Option 3: Hope-Focused
```tsx
<h1 className="text-3xl font-bold mb-3 leading-tight">
  Your Journey to Freedom
</h1>
<p className="text-white/90 font-medium text-lg">Transform Pain Into:</p>
// Then change the outcome to multiple positive outcomes
```

### 6. Advanced Customizations

#### Add Animation
```tsx
<h1 className="text-3xl font-bold mb-3 leading-tight animate-pulse">
  RELEASE & Find Peace
</h1>
```

#### Change Background Pattern
The current pattern can be modified in the SVG section or replaced with an image background.

#### Add Call-to-Action Button
```tsx
<Button className="mt-4 bg-white text-purple-600 hover:bg-white/90">
  Start Your Journey Now
</Button>
```

## Best Practices for Hero Section

1. **Keep the main message clear and focused**
2. **Use emotional language that resonates with your target audience**
3. **Maintain visual hierarchy (headline → subtitle → benefits → outcome)**
4. **Test different versions to see what resonates most**
5. **Keep mobile-first design in mind**

## Testing Changes

After making changes:
1. Save the file
2. The development server will automatically reload
3. Check both desktop and mobile views
4. Test with different user types (new vs returning)

## Deployment Notes

- Changes to this file will be automatically deployed when you push to your repository
- The mobile-first design ensures it looks great on all devices
- All animations and effects are optimized for performance

## Technical Notes

- The hero section uses Tailwind CSS for styling
- Icons are from Lucide React
- Responsive design is built-in with mobile-first approach
- The gradient and blur effects work across all modern browsers