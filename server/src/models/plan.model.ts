import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  countryName: string;
  planContent: string;
}

const PlanSchema: Schema = new Schema({
  countryName: { type: String, required: true },
  planContent: { type: String, required: true },
});

export default mongoose.model<IPlan>('Plan', PlanSchema);