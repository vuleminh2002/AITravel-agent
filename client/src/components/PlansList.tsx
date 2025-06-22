import { useState, useEffect, useContext } from 'react';
import { createPlan, getPlans, updatePlanRequest, deletePlanRequest } from '../services/planService';
import { AuthContext } from '../store/AuthContext';
import { ChatBox } from './ChatBox';

interface Plan {
  _id: string;
  countryName: string;
  planContent: string;
  messages?: any[];
}

interface PlansListProps {
  onPlanSelect: (planId: string) => void;
  onPlanUnselect: () => void;
  selectedPlanId: string | null;
}

export function PlansList({ onPlanSelect, onPlanUnselect, selectedPlanId }: PlansListProps) {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [newPlanCountry, setNewPlanCountry] = useState('');
  const [newPlanContent, setNewPlanContent] = useState('');
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchPlans = async () => {
        try {
          const fetchedPlans = await getPlans();
          setPlans(fetchedPlans);
        } catch (error) {
          console.error('Error fetching plans:', error);
        }
      };
      fetchPlans();
    } else {
      setPlans([]);
    }
  }, [user]);

  useEffect(() => {
    // When a new plan is selected, hide the chatbox until the user explicitly opens it.
    setIsChatVisible(false);
  }, [selectedPlanId]);

  const handleAddPlan = async () => {
    if (!newPlanCountry.trim() || !newPlanContent.trim()) return;
    try {
      const newPlan = await createPlan({ countryName: newPlanCountry, planContent: newPlanContent });
      setPlans(prevPlans => [...prevPlans, newPlan]);
      setNewPlanCountry('');
      setNewPlanContent('');
      setIsAddFormVisible(false);
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await deletePlanRequest(id);
      setPlans(plans.filter((plan) => plan._id !== id));
      if (selectedPlanId === id) {
        onPlanUnselect();
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    try {
      const updatedPlan = await updatePlanRequest(editingPlan._id, { countryName: editingPlan.countryName, planContent: editingPlan.planContent });
      setPlans(plans.map((plan) => (plan._id === editingPlan._id ? updatedPlan : plan)));
      setEditingPlan(null);
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  if (!user) {
    return (
      <div className="text-center">
        <p>Please log in to manage your travel plans.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!isAddFormVisible && (
        <div className="flex justify-start">
          <button onClick={() => setIsAddFormVisible(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add New Plan
          </button>
        </div>
      )}
      
      {isAddFormVisible && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Create a New Plan</h2>
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Country Name (e.g., USA)"
              value={newPlanCountry}
              onChange={(e) => setNewPlanCountry(e.target.value)}
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <textarea
              placeholder="States or Cities to Visit (e.g., Texas, California)"
              value={newPlanContent}
              onChange={(e) => setNewPlanContent(e.target.value)}
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="flex space-x-2">
              <button onClick={handleAddPlan} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 self-start">
                Add Plan
              </button>
              <button onClick={() => setIsAddFormVisible(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 self-start">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold mb-6">Your Travel Plans</h2>
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan._id} className={`p-6 rounded-lg shadow-md transition-all ${selectedPlanId === plan._id ? 'bg-blue-100 dark:bg-gray-700 ring-2 ring-blue-500' : 'bg-white dark:bg-gray-800'}`}>
                {editingPlan && editingPlan._id === plan._id ? (
                  <div className="flex flex-col space-y-4">
                    <input
                      type="text"
                      value={editingPlan.countryName}
                      onChange={(e) => setEditingPlan({ ...editingPlan, countryName: e.target.value })}
                      className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500"
                    />
                    <textarea
                      value={editingPlan.planContent}
                      onChange={(e) => setEditingPlan({ ...editingPlan, planContent: e.target.value })}
                      className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500"
                    />
                    <div className="flex justify-end space-x-2">
                      <button onClick={handleUpdatePlan} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Save</button>
                      <button onClick={() => setEditingPlan(null)} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold mb-2">{plan.countryName}</h3>
                      {selectedPlanId === plan._id && (
                        <p className="text-gray-600 dark:text-gray-400">{plan.planContent}</p>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      <button onClick={() => handleDeletePlan(plan._id)} className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700">Delete</button>
                      <button onClick={() => setEditingPlan(plan)} className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600">Update</button>
                      {selectedPlanId === plan._id ? (
                        <button onClick={() => onPlanUnselect()} className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600">Unselect</button>
                      ) : (
                        <button onClick={() => onPlanSelect(plan._id)} className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600">Select</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>You have no travel plans yet. Create one above to get started!</p>
        )}

        {selectedPlanId && (
          <div className="mt-8 p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
            <h2 className="text-2xl font-bold">Selected Plan</h2>
            {isChatVisible ? (
              <>
                <button onClick={() => setIsChatVisible(false)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 my-4">
                  Close Chat
                </button>
                <ChatBox selectedPlanId={selectedPlanId} />
              </>
            ) : (
              <button onClick={() => setIsChatVisible(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mt-4">
                Open Travel Assistant
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
