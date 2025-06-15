const API_URL = 'http://localhost:3000/api/plans';

export const getPlans = async () => {
    const response = await fetch(API_URL);
    return response.json();
}

export const getPlanById = async (id: string) => {
    const response = await fetch(`${API_URL}/${id}`);
    return response.json();
}

export async function createPlan(plan: { countryName: string; planContent: string }) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    });
    return res.json();
  }

  export async function updatePlanRequest(id: string, plan: { countryName: string; planContent: string }) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    });
    return res.json();
  }

  export async function deletePlanRequest(id: string) {
    await fetch(`http://localhost:3000/api/plans/${id}`, { method: 'DELETE' });
  }

