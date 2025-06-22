import mongoose from 'mongoose';
import { User } from './user.model.js';

const planSchema = new mongoose.Schema({
  countryName: {
    type: String,
    required: true,
  },
  planContent: {
    type: String,
    required: true,
  },
  messages: {
    type: Array,
    required: true,
    default: [],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

export const Plan = mongoose.model('Plan', planSchema);

export const getUserIdFromPlan = async (planId: string): Promise<string | null> => {
  const plan = await Plan.findById(planId).select('userId');
  return plan ? plan.userId.toString() : null;
};

// Function to add a message to a plan
export const addMessageToPlan = async (planId: string, role: 'human' | 'ai', content: string) => {
  return Plan.findByIdAndUpdate(
    planId,
    { $push: { messages: { role, content } } },
    { new: true, upsert: true }
  );
};

// Function to get message history for a plan
export const getPlanMessageHistory = async (planId: string) => {
  const plan = await Plan.findById(planId);
  return plan ? plan.messages : [];
};

// Function to get the plan content
export const getPlan = async (planId: string) => {
    const plan = await Plan.findById(planId);
    return plan ? plan.planContent : null;
};

export async function getPlanByUserId(userId: string) {
  const plans = await Plan.find({ userId: userId }, 'planContent');
  return plans ? plans.map(plan => plan.planContent) : [];
}