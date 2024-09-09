import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./gauntlet.module.css";
import QuestionChoice from "./QuestionChoice";
import QuestionPrompt from "./QuestionPrompt";
import IconComponent from "../../components/IconComponent";
import LifelinesComponent from "./LifelinesComponent";
import GauntletHistory from "./GauntletHistory";

const Gauntlet = () => {
  const [questionCategories, setQuestionCategories] = useState([])
  const [playerData, setPlayerData] = useState({
    lives: 3,
    correctAnswers: 0,
    lifelines: ["fifty", "skip"],
    currentQuestions: {},
  });
  const [gameState, setGameState] = useState("preGameState");
  const [activeQuestion, setActiveQuestion] = useState(false);
  const [activeGame, setActiveGame] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [gauntletHistory, setGauntletHistory] = useState({});
  const [unusedQuestions, setUnusedQuestions] = useState({});

  // Function to mount or initialize data
  const mount = async () => {
    const gauntletData = JSON.parse(localStorage.getItem('gauntletData'));

    if (gauntletData) {
      console.log('local storage gauntlet data', gauntletData)
      setActiveGame(gauntletData.activeGame);
      setActiveQuestion(gauntletData.activeQuestion);
      setCurrentQuestion(gauntletData.currentQuestion);
      setGameState(gauntletData.gameState);
      setPlayerData(gauntletData.playerData);
      setUnusedQuestions(gauntletData.unusedQuestions);
      setQuestionCategories(gauntletData.questionCategories);
    } else {
      createNewGame(); 
    }
  };

  // Use effect to run mount
  useEffect(() => {
    mount();

  }, []); 
  
  const createNewGame = async () => {
    try {
      const [categoriesResponse, allQuestionsResponse] = await Promise.all([
        axios.get("/api/gauntlet-routes/categories"),
        axios.get("/api/gauntlet-routes/questions")
      ]);


      setQuestionCategories(categoriesResponse.data);
      setUnusedQuestions(allQuestionsResponse.data);

      setPlayerData({
        lives: 3,
        correctAnswers: 0,
        lifelines: ["fifty", "skip"],
        currentQuestions: {},
      });
      setGameState("preGameState");
      setActiveQuestion(false);
      setActiveGame(false);
      setCurrentQuestion({});
    } catch (error) {
      console.log(error);
    }
  }

  const renderLives = () => {
    return (
      <div className={styles.livesDiv}>
        {playerData && [...Array(playerData.lives)].map((life, index) => (
          <div key={index}>
            <IconComponent imageName="heartIcon" />
          </div>
        ))}
      </div>
    );
  };
  const renderLifelines = () => {
    return (
      <LifelinesComponent
        playerData={playerData}
        setPlayerData={setPlayerData}
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        setActiveGame={setActiveGame}
        setActiveQuestion={setActiveQuestion}
      />
    );
  };

  const renderSideBar = () => {
    return (
      <div className={styles.sideBarMain}>
        {renderLives()}
        {renderLifelines()}
      </div>
    );
  };

  const preGameState = () => {
    return (
      <>
        <button
          onClick={() => setGameState("game")}
          className={styles.startButton}
        >
          Starta
        </button>
      </>
    );
  };

  const inGameState = () => {
    if (Object.keys(playerData.currentQuestions).length > 0 || activeGame) {
      return (
        <QuestionPrompt
          playerData={playerData}
          setPlayerData={setPlayerData}
          setActiveQuestion={setActiveQuestion}
          activeQuestion={activeQuestion}
          setActiveGame={setActiveGame}
          setCurrentQuestion={setCurrentQuestion}
          currentQuestion={currentQuestion}
        />
      );
    } else if (Object.keys(playerData.currentQuestions).length < 1) {
      return (
        <QuestionChoice
        playerData={playerData}
          questionCategories={questionCategories}
          setPlayerData={setPlayerData}
          className={styles.questionChoiceMain}
          setCurrentQuestion={setCurrentQuestion}
          unusedQuestions={unusedQuestions}
        />
      );
    }
  };

  const endGameState = () => {
    return (
      <>
        <div className={styles.endGameDiv}>
          It's game over man, it's game over. Poäng: {playerData.correctAnswers}{" "}
          <GauntletHistory gauntletData={gauntletHistory} />
          <button onClick={createNewGame}>New game</button>
        </div>
      </>
    );
  };

  useEffect(() => {
    console.log("Player data updated to", playerData);
    const updateScore = async () => {
      try {
        const scoreResponse = await axios.post("/api/gauntlet-routes/score", {
          newScore: playerData.correctAnswers,
        });
        setGauntletHistory(scoreResponse);
      } catch (error) {
        console.log(error);
      }
    };
    if (playerData.lives <= 0) {
      setGameState("endState");
      updateScore();
    }

    // Save data to localStorage
    const dataToSave = {
      activeGame,
      activeQuestion,
      currentQuestion,
      gameState,
      playerData,
      unusedQuestions,
      questionCategories,
    };

    localStorage.setItem('gauntletData', JSON.stringify(dataToSave));
    console.log('Data saved to localStorage:', dataToSave);

  }, [playerData]);

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
