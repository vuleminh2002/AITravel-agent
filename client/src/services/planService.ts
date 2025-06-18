const API_URL = 'http://localhost:3000/plans';

export const getPlans = async () => {
    console.log('Making GET request to:', API_URL);
    const response = await fetch(API_URL, {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });
    console.log('Response status:', response.status);
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Failed to fetch plans');
    }
    const data = await response.json();
    console.log('Received plans data:', data);
    return data;
}

export const getPlanById = async (id: string) => {
    const response = await fetch(`${API_URL}/${id}`, {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch plan');
    }
    return response.json();
}

export const createPlan = async (plan: any) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
    });
    if (!response.ok) {
        throw new Error('Failed to create plan');
    }
    return response.json();
}

export const updatePlanRequest = async (id: string, plan: any) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
    });
    if (!response.ok) {
        throw new Error('Failed to update plan');
    }
    return response.json();
}

export async function deletePlanRequest(id: string) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to delete plan');
    }
}

