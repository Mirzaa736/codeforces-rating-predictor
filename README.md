# Codeforces Rating Predictor

A Chrome Manifest V3 extension that adds Codeforces-style rating predictions to contest standings.

## Features

- Live contest rating-change estimates.
- Virtual-participation mode.
- Official final rating changes for finished contests.
- Local FFT-assisted prediction calculations.
- Cached participant/rating data to reduce API traffic.
- Compact UI integrated with Codeforces standings.
- Logged-in user highlighting and popup status.

## Install

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this repository folder (the folder containing `manifest.json`).
5. Open a Codeforces contest standings page.

## Architecture

- `src/codeforcesApi.js` — Codeforces API access and caching.
- `src/rating.js` — rating prediction model.
- `src/fft.js` — FFT/convolution implementation used by the predictor.
- `src/dom.js` — standings-page detection and DOM helpers.
- `src/content.js` — page integration, contest modes, and rendering.
- `src/content.css` — injected UI styling.
- `popup.*` — extension popup.
- `tests/README.md` — validation notes.

## Accuracy

Live values are estimates, not official Codeforces rating changes. Finished contests should use the official rating-change data when it is available.

The project is designed around Codeforces-style seed/performance calculations and includes special handling for virtual participation. Historical validation should compare predicted deltas against `contest.ratingChanges` using MAE and tolerance percentages.

## API usage

The extension uses public Codeforces API endpoints and caches data to avoid unnecessary requests. It does not require a private backend or user API key.

## Known limitations

Codeforces can change its HTML and API behavior. New-account/ramp-up cases and unusual participant states can produce differences from the official calculation.

## License

For personal/educational use; add a license if you want to publish the project under a specific open-source license.
