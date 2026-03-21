//-- Import things
import React from 'react';
import axios from 'axios';

export const Database = ({ jsonData }) => {
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
            "reqType" : "property",
            "propertyId" : 0
        }
    }

    const doDataRequest = async () => {
        try { // try the request
            const dbResponse = await axios.post("https://huskyrentlens.cs.mtu.edu/connect.php",jsonData,config);
            return JSON.stringify(dbResponse);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('cancelled ask');
            } else {
                console.error('error: ',error);
            }
        }
    }

    doDataRequest();
}