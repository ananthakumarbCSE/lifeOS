import { Router } from 'express';
import { listGoals, getGoal, createGoal, updateGoal, deleteGoal, updateGoalStatus } from '../controllers/goals.controller';
import { validate } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { createGoalSchema, updateGoalSchema, updateStatusSchema } from '../validators/goal.validator';

const router = Router();
router.use(authMiddleware);

router.get('/', listGoals);
router.post('/', validate(createGoalSchema), createGoal);
router.get('/:id', getGoal);
router.patch('/:id', validate(updateGoalSchema), updateGoal);
router.delete('/:id', deleteGoal);
router.patch('/:id/status', validate(updateStatusSchema), updateGoalStatus);

export default router;
