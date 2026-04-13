import axios from 'axios';

export const deleteProperty = async (propertyId) => {
    const API_BASE_URL = 'https://huskyrentlens.cs.mtu.edu';
    const token = localStorage.getItem('token');

    const response = await axios.post(`${API_BASE_URL}/backend/deleteProperty.php`,
        { propertyId },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );

    return response.data;
};
