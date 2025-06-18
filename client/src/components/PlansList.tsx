import { useState } from 'react';
import { ChatBox } from './ChatBox';

interface Plan {
  _id: string;
  countryName: string;
  planContent: string;
  userId: string;
  messages?: any[];
}

interface PlansListProps {
  plans: Plan[];
  selectedPlanId: string | null;
  addPlan: (plan: { countryName: string; planContent: string }) => Promise<void>;
  selectPlan: (id: string | null) => void;
  deletePlan: (id: string) => Promise<void>;
  updatePlan: (id: string, countryName: string, planContent: string) => Promise<void>;
}

export function PlansList({ plans, selectedPlanId, addPlan, selectPlan, deletePlan, updatePlan }: PlansListProps) {
  const [showForm, setShowForm] = useState(false);
  const [countryName, setCountryName] = useState('');
  const [planContent, setPlanContent] = useState('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingCountryName, setEditingCountryName] = useState('');
  const [editingPlanContent, setEditingPlanContent] = useState('');
  
  const handleAddPlan = () => {
    setCountryName('');
    setPlanContent('');
    setShowForm(true);
  };

  const handleSelectPlan = (planId: string) => {
    selectPlan(planId);
  };

  const handleSubmitAddPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Submitting new plan:', { countryName, planContent });
    try {
      await addPlan({ countryName, planContent });
      console.log('Plan added successfully');
      setShowForm(false);
    } catch (error) {
      console.error('Error adding plan:', error);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent<HTMLFormElement>, planId: string) => {
    e.preventDefault();
    try {
      await updatePlan(planId, editingCountryName, editingPlanContent);
      setShowUpdateForm(false);
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  const handleUnselectPlan = () => {
    selectPlan(null);
  };

  const selectedPlan = plans.find((plan) => plan._id === selectedPlanId);

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Your Plans</h2>
        <button
          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          onClick={handleAddPlan}
        >
          Add New Plan
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmitAddPlan} className="flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-lg mb-8 border-2 border-blue-300">
          <textarea
            className="border-2 border-blue-400 rounded-xl px-6 py-4 text-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
            placeholder="Enter the country name"
            value={countryName}
            onChange={(e) => setCountryName(e.target.value)}
            rows={3}
            required
          />
          <textarea
            className="border-2 border-blue-400 rounded-xl px-6 py-4 text-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 resize-none"
            placeholder="Enter your plan content here"
            value={planContent}
            onChange={(e) => setPlanContent(e.target.value)}
            rows={20}
            required
          />
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-green-500 text-white px-8 py-4 text-2xl rounded-xl hover:bg-green-600 transition"
            >
              Add Plan
            </button>
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-8 py-4 text-2xl rounded-xl hover:bg-gray-300 transition"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {selectedPlan && (
        <>
          <ChatBox selectedPlanId={selectedPlanId!} />
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
            <h2 className="text-2xl font-bold mb-2">{selectedPlan.countryName}</h2>
            <p className="text-lg">{selectedPlan.planContent}</p>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              onClick={handleUnselectPlan}
            >
              Unselect
            </button>
          </div>
        </>
      )}

      <ul className="flex flex-col gap-4 list-none">
        {plans.map((plan) => (
          <li key={plan._id} className="flex flex-col gap-2">
            <h2>{plan.countryName}</h2>
            <button onClick={() => deletePlan(plan._id)}>Delete</button>
            <button onClick={() => handleSelectPlan(plan._id)}>
              {selectedPlanId === plan._id ? 'Selected' : 'Select'}
            </button>
            <button 
              onClick={() => {
                setShowUpdateForm(true);
                setEditingCountryName(plan.countryName);
                setEditingPlanContent(plan.planContent);
                setEditingPlanId(plan._id);
              }}
            >
              Update
            </button>
            {showUpdateForm && plan._id === editingPlanId && (
              <form onSubmit={(e) => handleUpdatePlan(e, plan._id)}>
                <div className="flex flex-col gap-2">
                  <textarea
                    className="border-2 border-blue-400 rounded-xl px-6 py-4 text-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
                    placeholder="Enter the country name"
                    rows={3}
                    value={editingCountryName}
                    onChange={(e) => setEditingCountryName(e.target.value)}
                  />
                  <textarea
                    className="border-2 border-blue-400 rounded-xl px-6 py-4 text-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 resize-none"
                    placeholder="Enter your plan content here"
                    rows={20}
                    value={editingPlanContent}
                    onChange={(e) => setEditingPlanContent(e.target.value)}
                  />
                  <button type="submit" disabled={editingCountryName.length === 0 || editingPlanContent.length === 0}>
                    Update
                  </button>
                  <button type="button" onClick={() => setShowUpdateForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
