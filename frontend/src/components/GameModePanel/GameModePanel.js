import { useNavigate } from 'react-router-dom';
import { useEffect, usePreviousProps, useState} from 'react';
import styles from './GameMode.module.css';

const GameModePanel = () => {

    const navigate = useNavigate();
  
    const spChoice = () => {
         
      navigate('/sp');
    };
  
    const mpChoice = () => {
      navigate('/daily');
    };
    const questionFormChoice = () => {
      navigate('/QuestionForm');
    };

      return (
        <div className={styles.gameModeButtonsContainer}>
            <button className={`${styles.gameModeButton} ${styles.gmbTopLeft}`} onClick={spChoice}>Spela själv</button>
            <button className={`${styles.gameModeButton} ${styles.gmbTopRight}`} onClick={mpChoice}>Dagens frågor</button>
            <button className={`${styles.gameModeButton} ${styles.gmbBottomLeft}`} onClick={questionFormChoice}>QuestionForm</button>
            <button className={`${styles.gameModeButton} ${styles.gmbBottomRight}`} onClick={spChoice}>Spela själv</button>
        </div>
      )
}

export default GameModePanel;