import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  countryName: string;
  planContent: string;
  messages: { role: string; content: string; timestamp: Date }[];
}

const PlanSchema: Schema = new Schema({
  countryName: { type: String, required: true },
  planContent: { type: String, required: true },
  messages: { type: Array, required: true },
});

export default mongoose.model<IPlan>('Plan', PlanSchema);


export async function addMessageToPlan(planId: string, role: string, content: string) {
  await mongoose.model<IPlan>('Plan').findByIdAndUpdate(
    planId,
    {
      $push: {
        messages: {
          role,
          content,
          timestamp: new Date()
        }
      }
    },
    { new: true }
  );
}

export async function getPlanMessageHistory(planId: string) {
  const plan = await mongoose.model<IPlan>('Plan').findById(planId, 'messages');
  return plan ? plan.messages : [];
}

export async function getPlan(planId: string) {
  const plan = await mongoose.model<IPlan>('Plan').findById(planId, 'planContent');
  return plan ? plan.planContent : "";
}