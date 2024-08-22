import { useNavigate } from "react-router-dom";
import { useEffect, usePreviousProps, useState } from "react";
import styles from "./GameMode.module.css";

const GameModePanel = () => {
  const navigate = useNavigate();

  const spChoice = () => {
    navigate("/sp");
  };
  const dailyChoice = () => {
    navigate("/daily");
  };
  const questionFormChoice = () => {
    navigate("/QuestionForm");
  };
  const mpChoice = () => {
    navigate("MultiplayerLobby");
  };
  const gameModeButtons = {
    "Spela Själv": spChoice,
    "Dagens Frågor": dailyChoice,
    "Spela mot andra": mpChoice,
    "Lägg till Frågor": questionFormChoice,
    "Spela Själv2": spChoice,
    "Dagens Frågor2": dailyChoice,
    "Spela mot andra2": mpChoice,
    "Lägg till Frågor2": questionFormChoice,
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
        >
          {gameMode}
        </button>
      ))}
    </div>
  );
};

export default GameModePanel;
