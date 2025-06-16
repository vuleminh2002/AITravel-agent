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

// POST /api/chat/history/:planId post a message to the plan
router.post('/history/:planId', async (req, res) => {
  const { role, content } = req.body;
  const planId = req.params.planId;
  const plan = await Plan.findByIdAndUpdate(planId, 
    { $push: { messages: 
      { role: role, 
        content: content, 
        timestamp: new Date() } } }, { new: true });
  res.json({ plan });
});

// GET /api/chat/history/:planId get the message history of a plan
router.get('/history/:planId', async (req, res) => {
  const messages = await Plan.findById(req.params.planId, 'messages');
  res.json({ messages });
});



export default router; 