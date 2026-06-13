import { Router } from 'express';
import {
  brainDump, approveBrainDump, eisenhower,
  detectConflictsHandler, youtubeExtract, approveYouTube, weeklyPlan,
} from '../controllers/ai.controller';
import { validate } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { aiRateLimiter } from '../middleware/rate-limit.middleware';
import { brainDumpSchema, youtubeExtractSchema, approveAnalysisSchema } from '../validators/ai.validator';

const router = Router();
router.use(authMiddleware);
router.use(aiRateLimiter);

router.post('/brain-dump', validate(brainDumpSchema), brainDump);
router.post('/brain-dump/approve', validate(approveAnalysisSchema), approveBrainDump);
router.post('/eisenhower', eisenhower);
router.post('/conflicts/detect', detectConflictsHandler);
router.post('/youtube/extract', validate(youtubeExtractSchema), youtubeExtract);
router.post('/youtube/approve', validate(approveAnalysisSchema), approveYouTube);
router.post('/weekly/generate', weeklyPlan);

export default router;
