# AI Travel Planner

An intelligent travel planning application that helps users plan their trips with AI assistance. The application features a chat interface where users can ask questions about destinations, activities, and local cuisine, with the AI agent providing real-time information through web searches. The agent can also create an iternary and add that into google calendar.

## Features

- Interactive chat interface for travel planning
- AI-powered trip recommendations
- Real-time web search for up-to-date information
- Trip plan management and formatting
- Google calendar
- User-friendly interface for trip organization

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS
- React Query
- React Router
- Zustand

### Backend
- Node.js with TypeScript
- Express.js
- Mongoose ODM
- MongoDB

### AI & Search
- LangChain
- OpenAI API
- SerpAPI
- Puppeteer (for web scraping)

## Project Structure

```
travelAgent/
├── client/                 # Frontend React application
├── server/                 # Backend Node.js application
├── shared/                 # Shared types and utilities
└── docker/                 # Docker configuration files
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd client
   npm install

   # Install backend dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both client and server directories
   - Add necessary API keys and configuration

4. Start the development servers:
   ```bash
   # Start frontend
   cd client
   npm run dev

   # Start backend
   cd ../server
   npm run dev
   ```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/travel_planner
OPENAI_API_KEY=your_openai_api_key
SERPAPI_API_KEY=your_serpapi_key
PORT=3000
```

## License

MIT 
