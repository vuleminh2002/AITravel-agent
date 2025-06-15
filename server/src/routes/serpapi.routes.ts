import express from 'express';
import { getJson } from 'serpapi';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// GET /api/serpapi?q=your+search+query
router.get('/', async (req, res) => {   
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter q' });
  }
  try {
    const results = await getJson(
      {
        engine: 'google',
        q: query,
        api_key: process.env.SERPAPI_API_KEY,
        hl: 'en',
        gl: 'us',
      },
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error?.toString() || 'Search failed' });
  }
});

export default router; 