import express from 'express';
import Plan from '../models/plan.model';
import {llmHead} from '../utils/llm.js';

const router = express.Router();



// POST /api/chat
router.post('/:planId', async (req, res) => {
  const { message } = req.body;
  const planId = req.params.planId;
  const plan = await Plan.findById(planId);
  const planContent = plan?.planContent;
  const response = await llmHead(planId, message);
  
  res.json({ response });

});

export default router; 