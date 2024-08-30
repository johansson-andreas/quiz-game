import styles from './DailyHistoryPanel.module.css';
import { UserContext } from '../../contexts/UserContext';
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';



const DailyHistoryPanel = ({historyPanelTitle}) => {

    const { user } = useContext(UserContext);
    const [userHistory, setUserHistory] = useState([]);
    const [historyData, setHistoryData] = useState([]);


    const getUserHistory = async () => {
        console.log('getting user history')
        try {
            const response = await axios.get('/api/daily-challenge-routes/user-history');
            console.log(response.data)
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    useEffect(() => {
        async function loadUserHistory() {
            try {
                if (user) {
                    setHistoryData(await getUserHistory())
                }
            } catch (error) {
                console.log(error);
            }
        }
        loadUserHistory();
    }, [user])

    useEffect(() => {
        if (historyData && historyData.length > 0) {
            setUserHistory(historyData.map(historyEntry => ({
                date: historyEntry.date,
                score: historyEntry.score
            })));
        }
    }, [historyData]);

    return (
        <div className={styles.mainbody}>
            
                <p className={styles.yourHistoryTitle}>{historyPanelTitle}</p>
                <div className={styles.entryDateDiv}>Datum</div>
                <div className={styles.entryScoreDiv}>Poäng</div>
            {userHistory.map((entry, index) => (
                <>
                <div className={styles.entryDateDiv}>{entry.date} </div> <div className={styles.entryScoreDiv}>{entry.score}</div>
                </>
            ))}
        </div>
    )
}

export default DailyHistoryPanel;