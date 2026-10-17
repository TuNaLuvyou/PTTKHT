/**
 * File upload middleware (Multer, memory storage).
 *
 * Replaces Nest's `FileInterceptor('cv')`. Nest's default multer storage is
 * memory storage, which is why the old services read `file.buffer`.
 *
 * `req.file`  → the uploaded file (same shape as `@UploadedFile()`)
 * `req.body`  → text fields of a multipart form
 */
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

/** Single file in the `cv` field (used by /jobs/:id/apply, /cv-scoring/*). */
const uploadSingleCv = upload.single('cv');

module.exports = { upload, uploadSingleCv };
