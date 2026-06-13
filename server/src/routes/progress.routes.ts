import { Router } from 'express';
import { getProgress } from '../controllers/progress.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { Conflict } from '../models/Conflict.model';
import { Request, Response, NextFunction } from 'express';

const router = Router();
router.use(authMiddleware);

router.get('/', getProgress);

// Conflict routes
router.get('/conflicts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conflicts = await Conflict.find({ userId: req.user!.userId, resolved: false })
      .sort({ severity: -1, createdAt: -1 }).lean();
    res.json({ conflicts });
  } catch (error) {
    next(error);
  }
});

router.patch('/conflicts/:id/resolve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conflict = await Conflict.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: { resolved: true, resolvedAt: new Date() } },
      { new: true }
    );
    if (!conflict) { res.status(404).json({ error: 'Conflict not found' }); return; }
    res.json({ conflict });
  } catch (error) {
    next(error);
  }
});

export default router;
