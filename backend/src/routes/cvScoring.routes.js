// CvScoring routes — mounted at `/api/cv-scoring`.
//
// Guards mapping:
//   @UseGuards(JwtAuthGuard)                     -> verifyToken
//   @UseInterceptors(FileInterceptor('cv'))      -> uploadSingleCv (multer memory storage)
//
// Static/path-specific routes are declared before any parameterized ones where
// it could matter; Nest declared them in the order below.

const express = require('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadSingleCv } = require('../middlewares/upload.middleware');
const cvScoringController = require('../controllers/cvScoring.controller');

const router = express.Router();

router.get('/view/:id', verifyToken, cvScoringController.viewCv);

router.post(
  '/score/:jobId',
  verifyToken,
  uploadSingleCv,
  cvScoringController.scoreCv,
);

router.post(
  '/candidate-score',
  verifyToken,
  uploadSingleCv,
  cvScoringController.scoreCandidateCv,
);

router.get('/history', verifyToken, cvScoringController.getHistory);

router.get('/scores/:id', verifyToken, cvScoringController.getScoreById);

router.delete('/scores/:id', verifyToken, cvScoringController.deleteScoreById);

module.exports = router;
