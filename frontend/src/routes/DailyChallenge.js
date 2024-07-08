import socket from '../components/Socket';
import React, { useState, useEffect} from 'react';

const DailyChallenge = () => 
{   
    useEffect(() => {

        socket.emit('requestDailyChallengeQuestions');
        console.log('requesting daily questions')
        socket.on('sendingDailyChallengeArray', (dailyChallengeQuestArray) => {
            console.log('received daily questions')
            console.log(dailyChallengeQuestArray)
        })
        }, []);
    return (
        <div>Test</div>
    );
}

export default DailyChallenge;