const API_URL = 'http://localhost:3000/chat';
    
export const sendMessage = async (message: string, planId: string) => {
    const response = await fetch(`${API_URL}/${planId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    });
    if (!response.ok) {
        throw new Error('Failed to send message');
    }
    return response.json();
}

export const getMessageHistory = async (planId: string) => {
    const response = await fetch(`${API_URL}/history/${planId}`, {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch message history');
    }
    return response.json();
}