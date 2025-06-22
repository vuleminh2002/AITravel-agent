import express from 'express';
import {Plan} from '../models/plan.model';
import { Document } from 'mongoose';

// Extend Express Request type to include user
interface AuthenticatedRequest extends express.Request {
  user?: Document & {
    _id: string;
    googleId: string;
    email: string;
    name: string;
    picture?: string;
    createdAt: Date;
  };
}

const router = express.Router();

// Middleware to check authentication
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  if (authReq.isAuthenticated() && authReq.user) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Get all plans for the authenticated user
router.get('/', isAuthenticated, (async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    console.log('Fetching plans for user:', authReq.user!._id);
    const plans = await Plan.find({ userId: authReq.user!._id });
    console.log('Found plans:', plans);
    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Error fetching plans', error });
  }
}) as express.RequestHandler);

// Get a plan by id
router.get('/:id', isAuthenticated, (async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const plan = await Plan.findOne({ _id: req.params.id, userId: authReq.user!._id });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plan', error });
  }
}) as express.RequestHandler);

// Create a plan
router.post('/', isAuthenticated, (async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    console.log('Creating plan with data:', { ...req.body, userId: authReq.user!._id });
    const plan = new Plan({
      ...req.body,
      userId: authReq.user!._id,
      messages: [] // Initialize messages as empty array
    });
    const savedPlan = await plan.save();
    console.log('Plan created successfully:', savedPlan);
    res.status(201).json(savedPlan);
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({ message: 'Error creating plan', error });
  }
}) as express.RequestHandler);

// Update a plan
router.put('/:id', isAuthenticated, (async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.id, userId: authReq.user!._id },
      req.body,
      { new: true }
    );
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating plan', error });
  }
}) as express.RequestHandler);

// Delete a plan
router.delete('/:id', isAuthenticated, (async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const plan = await Plan.findOneAndDelete({ _id: req.params.id, userId: authReq.user!._id });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plan', error });
  }
}) as express.RequestHandler);

export default router;

