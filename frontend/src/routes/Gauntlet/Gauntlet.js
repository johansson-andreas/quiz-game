import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./gauntlet.module.css";
import QuestionChoice from "./QuestionChoice";
import QuestionPrompt from "./QuestionPrompt";

const Gauntlet = () => {
  const [questionCategories, setQuestionCategories] = useState([]);
  const [playerData, setPlayerData] = useState({
    lives: 3,
    currentQuestion: 1,
    lifeLines: [],
    currentQuestions: {}
  });
  const [gameState, setGameState] = useState("preGameState");
  const [question, setQuestion] = useState({});

  const initialData = async () => {
    try {
      console.log("getting data");
      const categoriesResponse = await axios.get(
        "/api/gauntlet-routes/categories"
      );
      console.log("categories response", categoriesResponse);
      setQuestionCategories(categoriesResponse.data.categories);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    initialData();
  }, []);

  const renderLives = () => {
    return (
      <div className={styles.livesDiv}>
        {[...Array(playerData.lives)].map((life) => (
          <div>LifeIcon</div>
        ))}
      </div>
    );
  };

  const preGameState = () => {
    return (
      <div>
        <button
          onClick={() => setGameState("game")}
          className={styles.startButton}
        >
          Starta
        </button>
      </div>
    );
  };

  const inGameState = () => {
    if(Object.keys(playerData.currentQuestions) < 1) return(QuestionChoice({questionCategories, setPlayerData}))
    else if (Object.keys(playerData.currentQuestions) > 0) return(QuestionPrompt({playerData, setPlayerData}))
  };
  

  const renderContent = () => {
    switch (gameState) {
      case "game":
        return inGameState();
      case "preGameState":
        return preGameState();
    }
  };

  return (
    <>
      {renderLives()}
      {renderContent()}
    </>
  );
};

export default Gauntlet;
