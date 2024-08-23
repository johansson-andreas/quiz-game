import React, { useState, useEffect } from "react";
import axios from "axios";
import DailyHistoryPanel from "../components/DailyHistoryPanel/DailyHistoryPanel";
import './styles/profilePageStyle.css';

const ProfilePage = () => {

    const [scoreArray, setScoreArray] = useState([]);

    useEffect(() => {
        initialLoad()
    }, []);


    // Pure function to move a field to the end of an object
    const moveFieldToEnd = (obj, fieldName) => {
        // Create a shallow copy of the input object
        const tempObject = { ...obj };

        // Check if the object has the specified field
        if (tempObject.hasOwnProperty(fieldName)) {
            // Store the value of the field
            const value = tempObject[fieldName];

            // Delete the field from the copied object
            delete tempObject[fieldName];

            // Re-add the field at the end
            tempObject[fieldName] = value;
        }

        // Return the modified copy of the object
        return tempObject;
    }

    const initialLoad = async () => {
        loadTotalScores();
    }

    // React useEffect hook to trigger an action when scoreArray changes
    useEffect(() => {
    }, [scoreArray]);

    // Function to load total scores and update the state
    const loadTotalScores = async () => {
        try {
            // Make an API call to get the total score array
            const response = await axios.get('/api/profile-routes/get-total-score-array');

            // Extract categoryStats from the response
            const categoryStats = response.data.categoryStats;

            // Use the moveFieldToEnd function to ensure "Total" is at the end
            setScoreArray(moveFieldToEnd(categoryStats, "Total"));
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className='body'>

            <div className='scoreArrayDiv'>
                <div className="scoreArrayTitle">Total statistik</div>
                {Object.keys(scoreArray).length > 0 ? Object.keys(scoreArray).map((cat, index) => (
                    <div className="catDiv">
                        <div key={index} className="catName">{cat}:</div>
                        <div className="catStats">
                            <div>{scoreArray[cat].correct}/{scoreArray[cat].total} ({(scoreArray[cat].correct / scoreArray[cat].total).toFixed(1)*100}%)</div>
                        </ div>
                    </div>
                )) : (<div>Ingen statistik</div>)}
            </div>

            <DailyHistoryPanel historyPanelTitle="Historik för dagens frågor"/>

        </div>

    )

}

export default ProfilePage;