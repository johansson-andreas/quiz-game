import { useNavigate } from 'react-router-dom';
import { useEffect, usePreviousProps, useState} from 'react';
import styles from './GameMode.module.css';

const GameModePanel = () => {

    const navigate = useNavigate();
  
    const spChoice = () => {
         
      navigate('/sp');
    };
  
    const dailyChoice = () => {
      navigate('/daily');
    };
    const questionFormChoice = () => {
      navigate('/QuestionForm');
    };
    const mpChoice = () => {
      navigate('MultiplayerLobby')
    };

      return (
        <div className={styles.gameModeButtonsContainer}>
            <button className={`${styles.gameModeButton} ${styles.gmbTopLeft}`} onClick={spChoice}>Spela själv</button>
            <button className={`${styles.gameModeButton} ${styles.gmbTopRight}`} onClick={dailyChoice}>Dagens frågor</button>
            <button className={`${styles.gameModeButton} ${styles.gmbBottomLeft}`} onClick={questionFormChoice}>Lägg till frågor</button>
            <button className={`${styles.gameModeButton} ${styles.gmbBottomRight}`} onClick={mpChoice}>Spela mot andra</button>
        </div>
      )
}

export default GameModePanel;