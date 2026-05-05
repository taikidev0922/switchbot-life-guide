# A8 Placement URL CSV

Generate a UTF-8 CSV for A8.net's bulk advertising URL submission.

```bash
npm run a8:csv
```

The generated file is:

```text
exports/a8_placement_urls.csv
```

Format:

```csv
s00000022845001,https://www.home-iot-guide.com/
s00000022845001,https://www.home-iot-guide.com/articles/example-slug
```

Rules:

- Column A: A8 program ID.
- Column B: page URL where affiliate ads are displayed.
- No header row.
- UTF-8.
- ASCII filename.
- Canonical URLs only. Do not submit filtered query URLs such as `/?category=review#articles`.

For this SwitchBot site, the homepage and all article pages are included because they display affiliate links or affiliate CTAs.

If the A8 upload screen rejects already-submitted URLs, upload this file less frequently, or keep a dated copy outside Git and submit only the new rows added since the previous successful upload.
