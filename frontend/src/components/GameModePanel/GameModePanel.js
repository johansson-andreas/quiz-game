import { useNavigate } from "react-router-dom";
import styles from "./GameMode.module.css";

const GameModePanel = () => {
  const navigate = useNavigate();

  const gameModeButtons = {
    "Spela Själv": () => navigate("sp"),
    "Dagens Frågor": () => navigate("daily"),
    "Spela mot andra": () => navigate("MultiplayerLobby"),
    "Lägg till Frågor": () => navigate("QuestionForm"),
    "Ny": () => navigate("Gauntlet"),
    "Dagens Frågor2": () => navigate("daily"),
    "Spela mot andra2": () => navigate("MultiplayerLobby"),
    "Lägg till Frågor2": () => navigate("QuestionForm"),
  };

  const gridSize = Math.ceil(Math.sqrt(Object.keys(gameModeButtons).length)); 

  const gridStyle = {
    '--grid-columns': gridSize,
  };


  return (
    <div className={styles.gameModeButtonsContainer} style={gridStyle}>
      {Object.keys(gameModeButtons).map((gameMode) => (
        <button
          className={styles.gameModeButton}
          onClick={gameModeButtons[gameMode]}
          key={gameMode}
        >
          {gameMode}
        </button>
      ))}
    </div>
  );
};

export default GameModePanel;
