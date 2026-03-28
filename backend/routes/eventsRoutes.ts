import { Router, Request, Response } from 'express';
import * as eventController from '../controllers/eventController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// Get all events for a user
router.get('/', eventController.getEvents);

// Get event by ID
router.get('/:id', eventController.getEventById);

// Create event
router.post('/', eventController.createEvent);

// Update event
router.put('/:id', eventController.updateEvent);

// Delete event
router.delete('/:id', eventController.deleteEvent);

// Get events by date range
router.get('/range', eventController.getEventsByDateRange);

export default router;
