import { useNavigate } from 'react-router-dom';
import styles from './GameMode.module.css';

const GameModePanel = () => {

    const navigate = useNavigate();
  
    const spChoice = (event) => {
      navigate('/sp');
    };
  
    const mpChoice = (e) => {
      navigate('/daily');
    };

      return (
        <div className={styles.gameModeButtonsContainer}>
            <button className={`${styles.gameModeButton} ${styles.gmbTopLeft}`} onClick={spChoice}>Spela själv</button>
            <button className={`${styles.gameModeButton} ${styles.gmbTopRight}`} onClick={mpChoice}>Dagens frågor</button>
            <button className={`${styles.gameModeButton} ${styles.gmbBottomLeft}`} onClick={spChoice}>Spela själv</button>
            <button className={`${styles.gameModeButton} ${styles.gmbBottomRight}`} onClick={spChoice}>Spela själv</button>
        </div>
      )
}

export default GameModePanel;