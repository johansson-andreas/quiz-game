import React, { useState, useEffect} from 'react';
import axios from 'axios';

const DailyChallenge = () => 
{   
    const getDailyQuestions = async () => {
        const response = await axios.get('/api/daily-challenge-routes/request-daily-questions')
        console.log(response);
    }  
    getDailyQuestions();

    return (
        <div>Test</div>
    );
}

export default DailyChallenge;