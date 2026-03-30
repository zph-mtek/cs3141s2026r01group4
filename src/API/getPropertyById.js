import axios from 'axios';

const API_BASE_URL = 'https://huskyrentlens.cs.mtu.edu';

export const getPropertyById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/backend/fetchPropertyById.php?id=${id}`);
    
        return response.data;
    } catch (error) {
        console.error("API connection error:", error);
        throw error;
    }
};

