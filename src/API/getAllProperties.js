import axios from 'axios';

const API_BASE_URL = 'https://huskyrentlens.cs.mtu.edu';

export const getAllProperties = async () => {
    try {
        // use get request to get all the property data
        const response = await axios.get(`${API_BASE_URL}/backend/fetchAllProperties.php`);
        
        //return json
        return response.data;
    } catch (error) {
        console.error("API connection error:", error);
        throw error;
    }
};

