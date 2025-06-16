const API_URL = 'http://localhost:3000/api/chat';
    
export const sendMessage = async (message: string, planId: string) => {
    const response = await fetch(`${API_URL}/${planId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    });
    console.log(response);
    return response.json();
}

export const getMessageHistory = async (planId: string) => {
    const response = await fetch(`${API_URL}/history/${planId}`);
    return response.json();
}