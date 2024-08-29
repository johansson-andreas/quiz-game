import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./gauntlet.module.css";
import QuestionChoice from "./QuestionChoice";
import QuestionPrompt from "./QuestionPrompt";
import IconComponent from "../../components/IconComponent";

const Gauntlet = () => {
  const [questionCategories, setQuestionCategories] = useState([]);
  const [playerData, setPlayerData] = useState({
    lives: 10,
    correctAnswers: 0,
    lifelines: ["fifty", "skip"],
    currentQuestions: {},
  });
  const [gameState, setGameState] = useState("preGameState");
  const [question, setQuestion] = useState({});
  const [activeQuestion, setActiveQuestion] = useState(false);
  const [activeGame, setActiveGame] = useState(false);

  const initialData = async () => {
    try {
      console.log("getting data");
      const categoriesResponse = await axios.get(
        "/api/question-routes/categories"
      );
      console.log("categories response", categoriesResponse);
      setQuestionCategories(categoriesResponse.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    console.log("Player data updated to", playerData);
    if (playerData.lives <= 0) setGameState("endState");
  }, [playerData]);

  useEffect(() => {
    initialData();
    
  }, []);

  const renderLives = () => {
    return (
      <div className={styles.livesDiv}>
        {[...Array(playerData.lives)].map((life, index) => (
          <div key={index}><IconComponent imageName="heartIcon"/></div>
        ))}
      </div>
    );
  };
  const renderLifelines = () => {

    return (
      <></>
    )
  }

  const renderSideBar = () => {
    return (
      <div className={styles.sideBarMain}>
      {renderLives()}
      {renderLifelines()}
      <div>{playerData.correctAnswers}</div>

      </div>
    )

  }

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
    if (
      Object.keys(playerData.currentQuestions).length > 0 ||
      activeGame
    ) {
      console.log("Cats chosen. Getting questions");
      return (
        <QuestionPrompt
          playerData={playerData}
          setPlayerData={setPlayerData}
          setActiveQuestion={setActiveQuestion}
          activeQuestion={activeQuestion}
          setActiveGame={setActiveGame}
          
        />
      );
    }
    else if (
      Object.keys(playerData.currentQuestions).length < 1
    ) {
      return (
        <QuestionChoice
          questionCategories={questionCategories}
          setPlayerData={setPlayerData}
          className={styles.questionChoiceMain}
        />
      );
    } 
  };

  const endGameState = () => {
    return <div>It's game over man, it's game over</div>;
  };

  const renderContent = () => {
    switch (gameState) {
      case "game":
        return inGameState();
      case "preGameState":
        return preGameState();
      case "endState":
        return endGameState();
    }
  };

  return (
    <div className={styles.mainContent}>
      {renderSideBar()}
      {renderContent()}
    </div>
  );
};

export default Gauntlet;
