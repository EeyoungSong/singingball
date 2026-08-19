# React Refactor Comparison Report

## Summary

The app was refactored from a static HTML/CSS/JavaScript implementation into a Vite + React app on the `react-refactor` branch in a separate worktree:

- Worktree: `/private/tmp/singingball-react-refactor`
- Branch: `react-refactor`
- Build command: `npm run build`
- Preview URL: `http://127.0.0.1:4173/`

## What Changed

### Project Structure

Before:

- `index.html` contained all screens and static markup.
- `app.js` queried DOM nodes directly and manually updated classes, image sources, and record markup.
- `styles.css` handled all visual styling.

After:

- `index.html` now only mounts the React app.
- `src/main.jsx` creates the React root.
- `src/App.jsx` contains screen components and interaction logic.
- `src/data.js` contains item data, asset paths, frame paths, and reusable asset version helpers.
- `styles.css` is reused so the visual design stays close to the current prototype.
- Runtime image/audio assets are collected through `import.meta.glob` in `src/data.js`, so Vite emits hashed production assets without duplicating the `assets/` tree.

### UI Rendering

Before:

- Decor tabs, cards, selected states, records, and charts were updated with `querySelectorAll`, class toggles, and manual DOM insertion/removal.

After:

- Decor tabs, rugs, clocks, radios, backgrounds, bowls, recent records, and weekly chart bars are rendered from React state and data arrays.
- Selected states are computed declaratively from state.
- Repeated UI is generated from `rugs`, `clocks`, `radios`, `backgrounds`, and `bowls` data.

### State Management

Preserved behavior:

- Selected bowl/background/rug/clock/radio persist in `localStorage`.
- Rug, clock, and radio support either no selection or one selected item.
- Selected decor tab persists.
- Ring records persist and still drive today's count, total count, recent records, and weekly chart.

Improvement:

- State transitions now happen through React state updates instead of direct DOM mutations.

### Interaction Logic

Preserved behavior:

- Clicking the cat body rings the selected singing bowl.
- Clicking outside the cat body moves the cat.
- Dragging the cat body moves the cat.
- Walking animation uses stand -> walk loop -> stand -> seated frame.
- Walking direction flips based on target direction.
- Bowl sound playback still uses the selected bowl audio.

### Styling

Preserved behavior:

- Existing CSS and visual layout were retained.
- Selection color variables remain centralized in `:root`.
- Decor tab index shape, item card selection, background cards, room props, and cat layout still use the current CSS.

## Verification

Completed checks:

- `npm install`: completed successfully.
- `npm run build`: completed successfully.
- Production build output created in `dist/`.
- Runtime asset bundling verified in `dist/assets/`:
  - cat animation PNGs
  - decor prop PNGs
  - background PNGs
  - singing bowl MP3s
- Unused radio 11/12 assets are not present in the production output.
- Preview server started at `http://127.0.0.1:4173/`.
- HTTP checks returned `200 OK`:
  - `/`
  - `/assets/cat-hit/hit_01.png`
  - `/assets/sounds/bowl-crystal-quartz.mp3`

## Tradeoffs

Benefits:

- Easier to add more decor categories and assets.
- Less manual DOM synchronization.
- Repeated UI is data-driven.
- Vite build gives a clearer app packaging path for GitHub Pages and Capacitor.
- React component boundaries make later app-store-level features easier to maintain.

Costs:

- Requires a build step.
- Adds `node_modules`, `package-lock.json`, and frontend dependencies.
- Runtime image/audio paths now depend on Vite asset collection via `import.meta.glob`; adding a new asset category requires adding it to the glob list in `src/data.js`.

## Recommendation

Use the React version as the main implementation if the app will continue toward a formal mobile release. The current static version is still fine as a quick prototype, but React gives a better path for the expected next features: more decor inventory, shop/unlock state, onboarding, settings, and Capacitor packaging.
