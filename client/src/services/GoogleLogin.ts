// GoogleLogin.ts
const API_URL = 'http://localhost:3000/api/auth';

export const login = async () => {
    const response = await fetch(`${API_URL}/google`);
    return response.json();
}

export const logout = async () => {
    const response = await fetch(`${API_URL}/logout`);
    return response.json();
}