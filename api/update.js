const versionMeta = require('../releases/version.json');

/**
 * Vercel serverless function — replaces the old Express server. The
 * installer itself lives on GitHub Releases (see releases/version.json's
 * `downloadUrl`), so this endpoint's only job is to report the current
 * version + changelog notes. Bundling version.json directly (require, not a
 * runtime file read) means Vercel ships it as part of the function — no
 * filesystem surprises in the serverless environment.
 */
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    version: versionMeta.version,
    notes: versionMeta.notes || '',
    downloadUrl: versionMeta.downloadUrl,
    downloadUrlApk: versionMeta.downloadUrlApk || undefined,
  });
};
