import styles from './DailyHistoryPanel.module.css';
import { UserContext } from '../../contexts/UserContext';
import React, { useState, useContext, useEffect} from 'react';
import axios from 'axios';



const DailyHistoryPanel = () => {

    const { user, setUser } = useContext(UserContext);
    const [userHistory, setUserHistory] = useState([]);
    const [historyData, setHistoryData] = useState([]);


    const getUserHistory = async () => {
        console.log('getting user history')
        try {
            const response = await axios.get('/api/daily-challenge-routes/get-user-history');
            setHistoryData(response.data);
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (user) getUserHistory();
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
            {userHistory.map((entry, index) => (
                <div key={index}>
                    {entry.date} : {entry.score}
                </div>
            ))}
        </div>
    )
}

export default DailyHistoryPanel;