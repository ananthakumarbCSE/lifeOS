import { Request, Response, NextFunction } from 'express';
import { Event } from '../models/Event.model';
import { ActivityLog } from '../models/ActivityLog.model';
import { sanitizeString } from '../utils/sanitize';

export async function listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const events = await Event.find({ userId: req.user!.userId })
      .sort({ startDate: 1 }).lean();
    res.json({ events });
  } catch (error) {
    next(error);
  }
}

export async function createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const event = await Event.create({
      ...req.body,
      userId,
      title: sanitizeString(req.body.title),
      description: sanitizeString(req.body.description || ''),
    });

    await ActivityLog.create({
      userId, action: 'created', entityType: 'event',
      entityId: event._id, metadata: { title: event.title },
    });

    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updates = { ...req.body };
    if (updates.title) updates.title = sanitizeString(updates.title);
    if (updates.description) updates.description = sanitizeString(updates.description);

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
    res.json({ event });
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
}
