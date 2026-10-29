# Steel & Magic — loading assets TEST 17.6

Approved source: Google Drive / Ekrany ładowania — Steel & Magic. The following exact files must be copied from `Steel_Magic_TEST_17_6_loading_webp_assets.zip` into this directory **before** testing or deploying:

- `Loading_Ludzie_9x20_1080x2400.webp`
- `Loading_Mrok_9x20_1080x2400.webp`
- `Loading_Bestie_9x20_1080x2400.webp`

The UI selects one at random at startup and shows the build in the top-right corner. Assets MUST be bundled into the Android package for offline startup. Do not replace them with external Drive URLs. Verify HTTP 200 for each asset, correct image display, all three outcomes across launches, and offline startup in APK.

**Status:** all three WebP assets are committed on the TEST 17.6 branch and verified in the GitHub directory. Runtime rendering, offline APK packaging and dedicated shop icons still require separate validation. TEST 17.5 battle geometry must not change. Shop icons require a separate verified dedicated shop icon asset mapping; `cards/deck_assets.json` currently refers to card thumbnails, which may not be approved shop icons.
