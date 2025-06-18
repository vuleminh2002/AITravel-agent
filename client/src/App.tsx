import { useEffect, useState } from 'react';
import './App.css'
import { PlansList } from './components/PlansList'
import { createPlan, getPlans, updatePlanRequest, deletePlanRequest } from './services/planService';
import { ChatBox } from './components/ChatBox';
import { GoogleLoginButton } from './components/GoogleLoginButton';
import { useAuth } from './store/AuthContext';

function App() {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<any>(null);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        console.log('Fetching plans...');
        const fetchedPlans = await getPlans();
        console.log('Fetched plans:', fetchedPlans);
        setPlans(fetchedPlans);
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };

    if (user) {
      console.log('User is authenticated, fetching plans...');
      fetchPlans();
    } else {
      console.log('User is not authenticated, clearing plans');
      setPlans([]);
    }
  }, [user]);

  const addPlan = async (plan: { countryName: string; planContent: string }) => {
    try {
      console.log('Creating new plan:', plan);
      const newPlan = await createPlan(plan);
      console.log('Plan created successfully:', newPlan);
      setPlans(prevPlans => {
        console.log('Previous plans:', prevPlans);
        const updatedPlans = [...prevPlans, newPlan];
        console.log('Updated plans:', updatedPlans);
        return updatedPlans;
      });
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const selectPlan = (id: any) => {
    setSelectedPlanId(id);
  } 

  const deletePlan = async (id: any) => {
    await deletePlanRequest(id);
    setPlans(plans.filter((plan) => plan._id !== id));
  }

  const updatePlan = async (id: any, countryName: string, planContent: string) => {
    const updatedPlan = await updatePlanRequest(id, { countryName, planContent });
    setPlans(plans.map((plan) => plan._id === id ? updatedPlan : plan));
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">AI Travel Planner</h1>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {user.picture && (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <GoogleLoginButton />
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user ? (
          <>
            <PlansList
              plans={plans}
              selectedPlanId={selectedPlanId}
              addPlan={addPlan}
              selectPlan={selectPlan}
              deletePlan={deletePlan}
              updatePlan={updatePlan}
            />
            {selectedPlanId && <ChatBox selectedPlanId={selectedPlanId} />}
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Welcome to AI Travel Planner
            </h2>
            <p className="text-gray-600 mb-8">
              Please sign in to start planning your next adventure
            </p>
            <GoogleLoginButton />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
