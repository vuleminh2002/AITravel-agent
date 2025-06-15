import express from 'express';
import Plan from '../models/plan.model';

const router = express.Router();

// Get all plans
router.get('/', async (req, res) => {
    const plans = await Plan.find();
    res.json(plans);
});

export default router;

// Get a plan by id
router.get('/:id', async (req, res) => {
    const plan = await Plan.findById(req.params.id);
    res.json(plan);
});

// Create a plan
router.post('/', async (req, res) => {
    const plan = new Plan(req.body);
    await plan.save();
    res.status(201).json(plan);
});

// Update a plan
router.put('/:id', async (req, res) => {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(plan);
});

// Delete a plan
router.delete('/:id', async (req, res) => {
    await Plan.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

