import { useState, useContext, useEffect } from 'react';
import './App.css';
import { GoogleLoginButton } from './components/GoogleLoginButton';
import { PlansList } from './components/PlansList';
import { AuthContext, AuthProvider } from './store/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { authService } from './services/auth';

function AppContent() {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
  };
  
  const handlePlanUnselect = () => {
    setSelectedPlanId(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Travel Planner</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
            <span className="font-semibold">{user.name}</span>
            <button 
              onClick={() => authService.logout()} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <GoogleLoginButton />
        )}
      </header>

      <main className="p-8">
        <PlansList 
          onPlanSelect={handlePlanSelect} 
          onPlanUnselect={handlePlanUnselect} 
          selectedPlanId={selectedPlanId}
        />
      </main>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
