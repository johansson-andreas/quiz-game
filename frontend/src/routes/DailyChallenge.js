import React, { useState, useEffect} from 'react';
import axios from 'axios';

const DailyChallenge = () => 
{   
    const initialContact = async () => {
        const response = await axios.get('/api/daily-challenge-routes/initial-contact')
        console.log(response);
        const newQuestion = await axios.get('/api/daily-challenge-routes/request-question')
        console.log('newquestion', newQuestion);
    }  
    initialContact();

    return (
        <div>Test</div>
    );
}

export default DailyChallenge;