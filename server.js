const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

const RELEASES_DIR = path.join(__dirname, 'releases');
const VERSION_FILE = path.join(RELEASES_DIR, 'version.json');

// Public: version-check endpoint the desktop app polls.
// version.json shape: { "version": "0.2.1", "notes": "...", "downloadUrl": "..." }
// Installers are large (100MB+) and are hosted as GitHub Release assets
// instead of being committed to this repo (GitHub blocks pushes over 100MB,
// and Release assets are free/CDN-backed with no such limit) — so
// `downloadUrl` in version.json is normally an explicit external URL.
// `exeFileName`/`apkFileName` are still supported as a fallback: if a file
// with that name exists locally in releases/, it's served from here instead.
app.get('/api/update', (req, res) => {
  if (!fs.existsSync(VERSION_FILE)) {
    return res.status(404).json({ error: 'No release published yet.' });
  }
  const meta = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
  const base = `${req.protocol}://${req.get('host')}`;
  const downloadUrl =
    meta.downloadUrl || (meta.exeFileName ? `${base}/downloads/${encodeURIComponent(meta.exeFileName)}` : undefined);
  const downloadUrlApk =
    meta.downloadUrlApk || (meta.apkFileName ? `${base}/downloads/${encodeURIComponent(meta.apkFileName)}` : undefined);
  res.json({
    version: meta.version,
    notes: meta.notes || '',
    downloadUrl,
    downloadUrlApk,
  });
});

// Public: direct file download — the installer/apk itself.
app.use('/downloads', express.static(RELEASES_DIR));

app.get('/', (_req, res) => {
  res.send('Ascent Compliance OS update server is running.');
});

app.listen(PORT, () => {
  console.log(`Update server listening on port ${PORT}`);
});
