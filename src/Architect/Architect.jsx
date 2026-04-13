//-- Import things
import React from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

export const Database = async (apiURL,jsonData) => {
    console.log('Function is running...');

    // Abort controller if request takes too long
    const controller = new AbortController();

    // Configuration for the database request
    const config = {
        headers : { // headers by which to send the api request with
            'Content-Type' : 'application/json',
            //'Authorization': '',
            //'X-Custom-Header': 'Value'
        },
        params: {},
        timeout: 5000000, // the limit by which the controller cancels the request
        signal: controller.signal
    }

    //-- Specifies what data we want to retrieve,
    if (jsonData == null) {
        jsonData = {
            "propertyId" : 0
        }
    }

    try { // try the request
        const dbResponse = await axios.post(apiURL,jsonData,config);
        return dbResponse;
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('cancelled ask');
        } else {
            console.error('error: ',error);
        }
    }
}

export const performBanCheck = () => {

    let user = null;
    const token = localStorage.getItem('token');

    if (token) {
        try {
            const decoded = jwtDecode(token);
            user = decoded.data;

            if (user && user.role == "Banned") {
                console.log("User is banned!");
                return  true;
            }
        } catch (error) {
            console.error("Invalid token", error);
            localStorage.removeItem('token');
            return false;
        }
    } else {
        console.log("No token!");
    }

    user = null;

    return false;
}