import axios from 'axios';

const API_BASE_URL = 'https://huskyrentlens.cs.mtu.edu';

export const getPropertyiesByLandlordId = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/backend/fetchPropertyByLandlordId.php`, {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        });
    
        return response.data;
    } catch (error) {
        console.error("API connection error:", error);
        throw error;
    }
};

