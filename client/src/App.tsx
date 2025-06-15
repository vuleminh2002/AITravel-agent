import { useEffect, useState } from 'react';
import './App.css'
import { PlansList } from './components/PlansList'
import { createPlan, getPlans, updatePlanRequest, deletePlanRequest } from './services/planService';
import { ChatBox } from './components/ChatBox';

function App() {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<any>(null);


  useEffect(() => {
    const fetchPlans = async () => {
      const plans = await getPlans();
      setPlans(plans);
    }
    fetchPlans();
  }, []);
  const addPlan = async (plan: any) => {
    const newPlan = await createPlan(plan);
    setPlans((prevPlans) => [...prevPlans, newPlan]);
  }

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

  return (
    <>
      <h1>AI Travel Planner</h1>
      <PlansList plans={plans} selectedPlanId={selectedPlanId} addPlan={addPlan} selectPlan={selectPlan} deletePlan={deletePlan} updatePlan={updatePlan} />
      {selectedPlanId && <ChatBox selectedPlanId={selectedPlanId} />}
    </>
  )
}

export default App
