# Theme System Guide

## Overview

This project uses `next-themes` for theme management with support for light, dark, and system modes.

## Components

### 1. ThemeProvider

Location: [components/theme-provider.tsx](components/theme-provider.tsx)

Already configured in the root layout with:

- `attribute="class"` - Uses class-based dark mode
- `defaultTheme="system"` - Defaults to system preference
- `enableSystem` - Enables system theme detection
- `disableTransitionOnChange` - Prevents flash on theme change

### 2. Theme Toggle Components

#### ThemeToggle (Dropdown)

Location: [components/theme-toggle.tsx](components/theme-toggle.tsx)

Features:

- Dropdown menu with Light, Dark, and System options
- Animated sun/moon icons
- Accessible with keyboard navigation
- Used in the home page header

Usage:

```tsx
import { ThemeToggle } from '@/components/theme-toggle';

<ThemeToggle />
```

#### ThemeToggleSimple (Button)

Location: [components/theme-toggle-simple.tsx](components/theme-toggle-simple.tsx)

Features:

- Simple toggle between light and dark
- No dropdown menu (cleaner UI)
- Same animated icons
- Perfect for minimal interfaces

Usage:

```tsx
import { ThemeToggleSimple } from '@/components/theme-toggle-simple';

<ThemeToggleSimple />
```

### 3. HomeHeader

Location: [components/home-header.tsx](components/home-header.tsx)

Features:

- Fixed header with backdrop blur
- Responsive mobile menu
- Integrated theme toggle
- Smooth transitions

## CSS Variables

All theme colors are defined in [app/globals.css](app/globals.css) using CSS custom properties:

### Light Mode

- `--background`: oklch(1 0 0) - White
- `--foreground`: oklch(0.145 0 0) - Near black
- `--primary`: oklch(0.488 0.243 264.376) - Blue/Purple
- And more...

### Dark Mode

- `--background`: oklch(0.145 0 0) - Near black
- `--foreground`: oklch(0.985 0 0) - Near white
- `--primary`: oklch(0.922 0 0) - Light gray
- And more...

## Dark Mode Classes

Use Tailwind's `dark:` modifier for dark mode styles:

```tsx
<div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
  Content
</div>
```

## Best Practices

### 1. Background Colors

```tsx
// Light backgrounds
bg-white dark:bg-gray-950
bg-gray-50 dark:bg-gray-900/50

// Card backgrounds
bg-card // Uses CSS variable (automatic theme support)
```

### 2. Text Colors

```tsx
// Primary text
text-gray-900 dark:text-white
text-foreground // Uses CSS variable

// Secondary text
text-gray-600 dark:text-gray-400
text-muted-foreground // Uses CSS variable
```

### 3. Borders

```tsx
border-gray-200 dark:border-gray-800
border-border // Uses CSS variable
border-border/40 // Uses CSS variable with opacity
```

### 4. Gradients

```tsx
// Adjust opacity for dark mode
bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500

// Background gradients
from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/20
```

### 5. Shadows

```tsx
shadow-lg dark:shadow-xl
hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-purple-500/10
```

## Examples from Home Page

### Hero Section

```tsx
<section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/20">
  <h1 className="text-gray-900 dark:text-white">
    Title
  </h1>
  <p className="text-gray-600 dark:text-gray-400">
    Description
  </p>
</section>
```

### Feature Cards

```tsx
<Card className="border-border/40 bg-card hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-purple-500/10">
  <h3 className="text-gray-900 dark:text-white">Title</h3>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</Card>
```

### Badge/Pill

```tsx
<div className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
  Badge content
</div>
```

## Testing

To test theme switching:

1. Visit the home page
2. Click the theme toggle in the header
3. Select Light, Dark, or System
4. Verify all sections update correctly
5. Test on different pages

## Adding Theme Support to New Components

1. Use semantic CSS variables when possible:
   - `bg-background`, `text-foreground`
   - `bg-card`, `text-card-foreground`
   - `bg-primary`, `text-primary-foreground`

2. For custom colors, always add dark mode variants:

   ```tsx
   className="bg-blue-100 dark:bg-blue-950/50"
   ```

3. Test both light and dark modes

4. Check contrast ratios for accessibility

## Customization

To customize theme colors, edit [app/globals.css](app/globals.css):

1. Find the `:root` section for light mode
2. Find the `.dark` section for dark mode
3. Adjust the CSS variables using oklch color space

Example:

```css
:root {
  --primary: oklch(0.488 0.243 264.376); /* Blue */
}

.dark {
  --primary: oklch(0.922 0 0); /* Light gray */
}
```

## Resources

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [OKLCH Color Picker](https://oklch.com/)
