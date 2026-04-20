import axios from 'axios';

export const getAllUsers = async () => {
    const API_BASE_URL = 'https://huskyrentlens.cs.mtu.edu';
    const token = localStorage.getItem('token');

    try {
        const response = await axios.get(`${API_BASE_URL}/backend/getAllUsers.php`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        throw error;
    }
};

