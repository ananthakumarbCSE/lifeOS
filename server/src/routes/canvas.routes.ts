import { Router } from 'express';
import { getCanvasData, batchUpdatePositions, createConnection, deleteConnection } from '../controllers/canvas.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', getCanvasData);
router.patch('/positions', batchUpdatePositions);
router.post('/connections', createConnection);
router.delete('/connections/:id', deleteConnection);

export default router;
