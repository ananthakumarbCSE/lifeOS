import { Router } from 'express';
import { listTasks, createTask, updateTask, deleteTask } from '../controllers/tasks.controller';
import { validate } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { createTaskSchema, updateTaskSchema } from '../validators/task.validator';

const router = Router();
router.use(authMiddleware);

router.get('/', listTasks);
router.post('/', validate(createTaskSchema), createTask);
router.patch('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;
