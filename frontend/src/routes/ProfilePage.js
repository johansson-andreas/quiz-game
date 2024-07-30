import React, { useState, useEffect } from "react";
import axios from "axios";
import DailyHistoryPanel from "../components/DailyHistoryPanel/DailyHistoryPanel";
import './styles/profilePageStyle.css';

const ProfilePage = () => {

    const [scoreArray, setScoreArray] = useState([]);
    const [totalQuestionsScore, setTotalQuestionsScore] = useState([]);
    const [userHistory, setUserHistory] = useState([]);
    const [historyData, setHistoryData] = useState([]);    

    useEffect(() => {
        initialLoad()
    }, []);

    const initialLoad = async () => {
        
        loadTotalScores()
    }
    useEffect(() => {

        console.log(scoreArray)
    }, [scoreArray]);

    const loadTotalScores = async () => {
        try {
            const response = await axios.get('/api/profile-routes/get-total-score-array');
            setScoreArray(response.data);
          } catch (error) {
            console.error(error);
          }
    }


    return (
        <div className='body'>

            <div className='scoreArrayDiv'>
                {scoreArray.length > 0 ? scoreArray.map((cat, index) => (
                    <div key={index}>{cat}</div>

                )) : (<div>Loading...</div>)}
            </div>

            <DailyHistoryPanel />

        </div>

    )

}

export default ProfilePage;