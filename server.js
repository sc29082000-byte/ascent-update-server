const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

const RELEASES_DIR = path.join(__dirname, 'releases');
const VERSION_FILE = path.join(RELEASES_DIR, 'version.json');

// Public: version-check endpoint the desktop app polls.
// version.json shape: { "version": "0.2.0", "notes": "..." }
// downloadUrl is derived from the request host, not stored in the file,
// so it stays correct no matter what domain this ends up served from.
app.get('/api/update', (req, res) => {
  if (!fs.existsSync(VERSION_FILE)) {
    return res.status(404).json({ error: 'No release published yet.' });
  }
  const meta = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
  const base = `${req.protocol}://${req.get('host')}`;
  res.json({
    version: meta.version,
    notes: meta.notes || '',
    downloadUrl: `${base}/downloads/${encodeURIComponent(meta.exeFileName)}`,
    downloadUrlApk: meta.apkFileName ? `${base}/downloads/${encodeURIComponent(meta.apkFileName)}` : undefined,
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
