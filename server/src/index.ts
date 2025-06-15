import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import planRoutes from './routes/plan.routes';
import serpapiRoutes from './routes/serpapi.routes';
import chatRoutes from './routes/chat.routes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_planner';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Travel Planner API' });
});

// Routes
app.use('/api/plans', planRoutes);
app.use('/api/serpapi', serpapiRoutes);
app.use('/api/chat', chatRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 