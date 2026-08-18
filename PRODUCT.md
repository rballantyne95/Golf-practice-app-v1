# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A single primary user: the app's owner, a golfer with a 10 handicap working toward scratch. Solo use only — no accounts, no sharing, no other users planned. The user is a beginner developer who built and maintains this app entirely through Claude Code Web, mostly from an Android phone.

## Product Purpose

A personal practice-session tracker for the driving range. Lets the user structure a session before hitting balls (sets, ball counts, clubs, drills/focus areas), log ratings and swing thoughts during and after the session (commitment to drills, strike quality, ball flight), and review history and stats over time. Exists to make deliberate range practice repeatable and reviewable, in service of lowering the user's handicap from 10 toward scratch.

## Positioning

Not a commercial or general-purpose golf app. It is a lightweight, personal practice log built exactly around this user's own routine: their driving range's ball-vending machine (dispenses in increments of 25), and a focus-area taxonomy drawn from their coach. No off-the-shelf golf app is structured around that specific routine and vocabulary.

## Operating Context

Used outdoors at a golf driving range: standing, one-handed, in direct sunlight, on an Android phone. The range's ball-vending machine dispenses balls in increments of 25 (the app defaults ball-count steps accordingly, with a 5-at-a-time alternative). Focus-area terminology (Backswing path, Downswing path, Swing length, Club release, Hinging, Rotation backswing, Pushing up downswing) comes from the user's coach/instructor, not generic golf-app conventions. The whole app is built and maintained via Claude Code Web, with no local dev environment.

## Capabilities and Constraints

- Persistence is localStorage only — no backend, no server, no accounts. Data lives on one device/browser and is not synced or backed up elsewhere.
- Hosted on GitHub Pages from a repository subfolder (not a domain root), so all paths must stay relative rather than root-absolute.
- Installable as a PWA (manifest + service worker) for a standalone, full-screen launch from the Android home screen; the service worker caches the app shell for offline use and is versioned to roll forward cleanly on redeploy.
- Deliberately no build tooling and no frameworks — plain HTML, CSS, and JavaScript by explicit choice, kept that way across the project.
- Multi-page architecture: each screen is its own HTML+JS file pair sharing `storage.js` (localStorage helpers) and `style.css` (design tokens and shared components).

## Brand Commitments

App name: "Golf Practice." Established visual identity: dark navy (`#0b1026`) background with a bright green (`#54e38e`) accent, restrained "modern premium sports-tech" direction — strong typography over decoration, flat dark surfaces, green reserved for primary actions/selection/important info, large touch targets and strong contrast for one-handed outdoor use. This direction was deliberately refined (twice) to avoid a generic/AI-generated feel, then carried consistently across every screen as the app's reference design.

## Evidence on Hand

None. No testimonials, case studies, benchmarks, or external content — this is a personal-use app with no marketing surface. Future work must not fabricate any.

## Product Principles

1. Solo, personal tool. No multi-user, sharing, or account features unless explicitly requested.
2. Practice logging must stay fast and frictionless for one-handed, outdoor, sunlight-readable use mid-session.
3. Terminology and structure mirror the user's actual coached practice routine (25-ball increments, the coach's focus-area vocabulary) rather than generic golf-app conventions.
4. Minimal technical footprint: no backend, no build tooling, no frameworks. Everything runs on GitHub Pages + localStorage + plain JS, and stays that way.
5. Data lives entirely on-device. Offline usability and clean PWA update behavior (new deploys replacing old cached versions without reinstalling) matter more than cross-device sync, which does not exist.

## Accessibility & Inclusion

No formal accessibility standard is targeted, but strong contrast and large touch targets are a firm requirement, driven by the actual use case: outdoor, one-handed, sunlight-readable operation at the driving range. Already implemented in the current dark UI and should be preserved in any future visual work.
