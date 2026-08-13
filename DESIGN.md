---
name: Golf Practice
description: A one-handed, sunlight-readable practice-session tracker for the driving range.
colors:
  night-range-navy: "#0b1026"
  surface: "#151c38"
  surface-raised: "#1d2647"
  text-primary: "#f7f8fc"
  text-secondary: "#98a2bc"
  fairway-green: "#54e38e"
  fairway-green-tint: "rgba(84, 227, 142, 0.15)"
  miss-amber: "#f0a857"
  miss-amber-tint: "rgba(240, 168, 87, 0.15)"
  border-subtle: "rgba(255, 255, 255, 0.1)"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(4rem, 20vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.7rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    letterSpacing: "0.06em"
rounded:
  sm: "10px"
  md: "14px"
  lg: "20px"
  pill: "999px"
spacing:
  space-1: "6px"
  space-2: "10px"
  space-3: "16px"
  space-4: "24px"
  space-5: "36px"
components:
  button-primary:
    backgroundColor: "{colors.fairway-green}"
    textColor: "{colors.night-range-navy}"
    rounded: "{rounded.md}"
    padding: "18px"
  button-primary-disabled:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "16px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.sm}"
  chip-selected:
    backgroundColor: "{colors.fairway-green}"
    textColor: "{colors.night-range-navy}"
    rounded: "{rounded.sm}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "14px"
---

# Design System: Golf Practice

## Overview

**Creative North Star: "The Range Session HUD"**

This is a heads-up display for the driving range, not a dashboard to admire at a desk. Every screen assumes the same reader: one hand free, standing outdoors in direct sunlight, glancing down between shots. The system is restrained, confident, and focused — quiet by default, and loud only at the one moment that earns it (the in-session ball count). It deliberately rejects the generic "AI-generated SaaS" look: no stacked pill shapes, no decorative glow or gradient, no ornament that isn't carrying information.

Density stays low and content stays left-aligned and scannable, because a range session is read in fragments, not studied. The one exception is the hero ball count, which centers and dominates because it is the single number the reader needs to confirm at a glance, from arm's length, in bright sun.

**Key Characteristics:**
- A near-black navy stage with one bright green marker light, used only where it means something
- Hierarchy built entirely from type — size, weight, spacing — never from decoration
- Flat surfaces layered by tone, not shadow
- One deliberately oversized number per session (the ball count); everything else stays modest

## Colors

A near-black navy stage with a single bright accent reserved for what matters, plus one separate warning color that is never allowed to look like the accent.

### Primary
- **Fairway Green** (`#54e38e`): the only color used for primary actions, selected states, and positive/good signals (a "Good" set rating, a "Crisp" contact badge, a filled slider track). Its rarity is the point.

### Secondary
- **Miss Amber** (`#f0a857`): warnings, "miss" signals (a "Fat" contact badge, an over-allocated ball tracker), and every destructive action (Delete Session). Kept visually and hue-distinct from Fairway Green so a warning can never be mistaken for a success state.

### Neutral
- **Night Range Navy** (`#0b1026`): the app background — the "night sky" the whole system sits on.
- **Surface** (`#151c38`): resting background for cards, list rows, inputs, and unselected controls.
- **Surface Raised** (`#1d2647`): the pressed/active-state fill, and the resting fill for disabled controls.
- **Primary Text** (`#f7f8fc`): headings, values, primary content.
- **Secondary Text** (`#98a2bc`): labels, meta text, placeholders, unselected control text.
- **Border Subtle** (`rgba(255, 255, 255, 0.1)`): hairline dividers and control borders — the only border weight in the system.

### Named Rules
**The One Signal Rule.** Fairway Green appears only for primary actions, current selection, and positive outcomes. It never decorates. If green shows up, it means something specific is true right now.

## Typography

**Display Font:** System UI stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`)
**Body Font:** Same system stack
**Label/Mono Font:** Same system stack (uppercase, tracked out, rather than a distinct face)

**Character:** One typeface family carries the entire system at different weights and scales — deliberate, since the app has zero font-loading cost and stays fully offline-capable. Hierarchy is entirely a function of size, weight, and letter-spacing.

### Hierarchy
- **Display** (800, `clamp(4rem, 20vw, 6rem)`, line-height 0.95): the in-session ball count only. The single element in the system allowed to dominate a screen.
- **Headline** (800, 1.7rem, letter-spacing -0.01em): screen titles ("Golf Practice", "Session Summary", etc.), always left-aligned.
- **Title** (700, 1.05–1.2rem): section headers (`h2`) and the active drill/activity name.
- **Body** (400–700, 0.95–1.1rem): list content, set summaries, notes, button labels.
- **Label** (700, 0.7–0.85rem, letter-spacing 0.04–0.08em, rendered uppercase): status chips, unit labels ("BALLS"), focus-area pills — small, tracked-out, secondary-colored text that names what's nearby without competing with it.

### Named Rules
**The Type-Only Hierarchy Rule.** Hierarchy comes from size, weight, and spacing — never from added chrome. The only place scale gets dramatic is the ball count, because that is the one number worth reading from arm's length in sunlight.

## Layout

Single-column, mobile-only: a centered container, `max-width: 480px`, `20–24px` side padding, no responsive breakpoints — the system is authored for exactly one context, a phone held one-handed outdoors. Vertical rhythm runs on a five-step spacing scale (`6 / 10 / 16 / 24 / 36px`). Content defaults to left-aligned and scannable; centering is reserved for the rare singular focal readout (the hero ball count, the numeric steppers), never used for ordinary page content or headings.

## Elevation & Depth

Flat by default. Surfaces gain depth from a tonal shift — Night Range Navy → Surface → Surface Raised — never from a shadow. The two shadows that exist in the whole system are small and incidental, applied only to something the reader is actively pressing or dragging.

### Shadow Vocabulary
- **Primary button shadow** (`box-shadow: 0 2px 8px rgba(11, 16, 38, 0.35)`): a faint lift under the main call-to-action, removed entirely when disabled.
- **Slider thumb shadow** (`box-shadow: 0 2px 6px rgba(11, 16, 38, 0.5)`): a tactile cue on the draggable rating-slider handle.

### Named Rules
**The Flat-By-Default Rule.** Surfaces sit flat at rest. The rare shadow is a tactile cue on something being actively pressed or dragged — never a general-purpose depth or card effect.

## Shapes

Two radius families, no sharp corners anywhere. Rounded-rectangle radii (`10 / 14 / 20px`) cover cards, buttons, and inputs, scaling up with the size/importance of the surface. Full-pill radius (`999px`) is reserved for tag/toggle-shaped controls (chips, step toggles, status badges) and perfectly circular controls (the close button, stepper +/− buttons, the slider thumb). Borders are a single hairline weight (`1px`, Border Subtle) everywhere a border appears; nothing uses a heavier stroke.

## Components

### Buttons
- **Shape:** 14px radius (`rounded.md`)
- **Primary:** Fairway Green background, Night Range Navy text, full width, 18px padding, bold; a small press-scale (0.98) on tap; disabled state drops to Surface Raised / Secondary Text with the shadow removed.
- **Secondary:** Surface background, hairline border, Primary Text; darkens to Surface Raised on press.
- **Destructive (Delete, etc.):** text-only, no background or border, Miss Amber — deliberately understated so it never visually competes with the primary green action nearby.

### Chips (club picker, drill-name suggestions, step toggles, rating buttons)
- **Style:** Surface background, hairline border, Secondary Text at rest, 10px radius (pill radius only for step-toggle-shaped variants).
- **State:** selected = Fairway Green fill + Night Range Navy text; disabled = 40% opacity.

### Cards / Containers
- **Corner Style:** 20px for session list rows, 10px for smaller list items and trackers.
- **Background:** Surface.
- **Shadow Strategy:** none — see Elevation & Depth.
- **Border:** hairline Border Subtle.
- **Internal Padding:** 12–16px.

### Inputs / Fields
- **Style:** Surface background, hairline border, 10px radius, 14px padding.
- **Focus:** default browser outline; no custom treatment.
- **Error:** Miss Amber helper text below the field; the field itself is unchanged.

### Navigation
- No persistent nav chrome. Each screen carries either a top-left "← Back" text link (Secondary Text, not a button) or a circular "×" close button (top-right, Surface Raised fill), chosen by whether the flow can be safely abandoned mid-way.

### Signature Component: the hero metric
- The one deliberately oversized element in the system: the in-session ball count, set in Display type with no surrounding card or background. A number standing alone, sized to be read one-handed in direct sunlight mid-swing.

## Do's and Don'ts

### Do:
- **Do** reserve Fairway Green exclusively for primary actions, current selection, and positive outcomes (The One Signal Rule).
- **Do** build hierarchy with size, weight, and spacing, never with decoration.
- **Do** left-align scannable content; reserve centering for singular focal readouts like the hero ball count.
- **Do** keep destructive actions as plain Miss Amber text links, never styled as a button.

### Don't:
- **Don't** add shadows, glow, or gradients as decoration (The Flat-By-Default Rule).
- **Don't** introduce a second display typeface or a web font.
- **Don't** reach for the generic "AI-generated SaaS" look: stacked pill shapes, glassy glow, decorative gradients.
- **Don't** reuse Fairway Green for anything that isn't primary/selected/positive — every extra use dilutes what it signals.
