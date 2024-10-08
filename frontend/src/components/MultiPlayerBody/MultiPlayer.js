import socket from "../../Socket.js";
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { UserContext } from "../../contexts/UserContext.js";
import QuestionComponent from "../QuestionComponent/QuestionComponent.js";
import "./multiPlayerStyle.css";

const MultiPlayer = ({ lobbyName }) => {
  // State Variables
  const [users, setUsers] = useState({});
  const [lobbyInfo, setLobbyInfo] = useState({
    users: {},
    chosenWinCon: "",
    winConNumber: 0,
    questionTimer: 0,
    active: false,
    host: "",
    currentQuestion: {},
    currentChooser: {},
    questionAmount: 0
  });
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [answer, setAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [activeQuestion, setActive] = useState(true);
  const [triggeredOption, setTriggeredOption] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [canProgress, setCanProgress] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(15);
  const [timerRunning, setTimerRunning] = useState(false);
  const [animatedUsers, setAnimatedUsers] = useState({});
  const [timeLeft, setTimeLeft] = useState(15);
  const [winners, setWinners] = useState([]);
  const [notChosenCategories, setNotChosenCategories] = useState({});

  // Refs
  const lobbyInfoRef = useRef(lobbyInfo);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const answerRef = useRef(answer);
  const submittedAnswerRef = useRef(submittedAnswer);

  // Context
  const { user } = useContext(UserContext);

  const startGame = () => {
    socket.emit("startGame", lobbyName);
  };

  const timerFinished = () => {
    const currentSubmittedAnswer = submittedAnswerRef.current;
    const currentAnswer = answerRef.current;


    if (!currentSubmittedAnswer) {
      if (currentAnswer) setSubmittedAnswer(currentAnswer);
      else setSubmittedAnswer("pass");
      setIsLocked(true);
    }
    if(lobbyInfoRef.current.host === user) setTimeout(() => nextQuestion(), 1000)
    setTimerRunning(false);

  };


  const nextQuestion = () => {
    socket.emit("getNextQuestion", lobbyName);
  };


  useEffect(() => {
    submittedAnswerRef.current = submittedAnswer;

    if (submittedAnswer) {
      socket.emit("submitAnswer", { lobbyName, submittedAnswer });
      setIsLocked(true);
      setActive(false);
    }
  }, [submittedAnswer]);

  useEffect(() => {
    setQuestionTimer(lobbyInfo.questionTimer);
  }, [lobbyInfo.questionTimer]);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  const submitAnswer = (e) => {
    setSubmittedAnswer(answer);
  };

  const setFade = (chosenCategory) => {
    const notChosenCategories =
      lobbyInfoRef.current.currentChooser.categoryChoices.reduce(
        (acc, category) => {
          acc[category] = category === chosenCategory ? "slowFade" : "fadeFast";
          return acc;
        },
        {}
      );
    setNotChosenCategories(notChosenCategories);
  };

  useEffect(() => {
    lobbyInfoRef.current = lobbyInfo;
    setCurrentQuestion(lobbyInfo.currentQuestion);
  }, [lobbyInfo]);

  //Socket.on handlers
  useEffect(() => {
    socket.emit("getRoomInfo", lobbyName);

    const handleRoomInfo = (lobbyInfo) => {
      setLobbyInfo(lobbyInfo);
      setUsers(lobbyInfo.users);
    };

    const handleCurrentUsers = (currentUsers) => {
      setUsers(currentUsers);
    };

    const receivedNewQuestion = (newQuestion) => {
      setCurrentQuestion(newQuestion.newQuestion);
    };
    const handleCorrectAnswer = (correctAnswer) => {
      console.log(correctAnswer)
      setCorrectAnswer(correctAnswer);
      setTriggeredOption(correctAnswer);

    };
    const handleWinnerDetermined = (winnerList) => {
      setWinners(winnerList);
    };

    const handleCurrentChooser = (currentChooser) => {
      setLobbyInfo((prevLobbyInfo) => {
        const updatedLobbyInfo = { ...prevLobbyInfo };
        updatedLobbyInfo.currentChooser = currentChooser;
        updatedLobbyInfo.active = currentChooser.active;
        updatedLobbyInfo.questionAmount = currentChooser.questionAmount;
        return updatedLobbyInfo;
      });
    };
    const handleCategoryChosen = ({ category, question, questionAmount }) => {
      setFade(category);
      setTimeout(() => {
        setLobbyInfo((prevInfo) => {
          const newInfo = { ...prevInfo };
          newInfo.currentChooser.active = false;
          newInfo.currentQuestion = question;
          newInfo.questionAmount = questionAmount;
          return newInfo;
        });
        setIsLocked(false);
        setActive(true);
        setCanProgress(false);
        setSubmittedAnswer("");
        setTimerRunning(true);
      }, 2000);
    };

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    socket.on("sendRoomInfo", handleRoomInfo);
    socket.on("currentUsersInRoom", handleCurrentUsers);
    socket.on("newQuestion", receivedNewQuestion);
    socket.on("correctAnswer", handleCorrectAnswer);
    socket.on("winnerDetermined", handleWinnerDetermined);
    socket.on("currentChooser", handleCurrentChooser);
    socket.on("categoryChosen", handleCategoryChosen);

    return () => {
      socket.emit("leaveRoom");
      socket.off("sendRoomInfo", handleRoomInfo);
      socket.off("currentUsersInRoom", handleCurrentUsers);
      socket.off("newQuestion", receivedNewQuestion);
      socket.off("correctAnswer", handleCorrectAnswer);
      socket.off("winnerDetermined", handleWinnerDetermined);
      socket.off("currentChooser", handleCurrentChooser);
      socket.off("categoryChosen", handleCategoryChosen);
    };
  }, []);

  const flashGreen = (username) => {
    setAnimatedUsers((prev) => ({ ...prev, [username]: "pulseGreen" }));
    setTimeout(() => {
      setAnimatedUsers((prev) => {
        const { [username]: _, ...rest } = prev;
        return rest;
      });
    }, 1000); // Animation duration (milliseconds)
  };

  const updateScores = useCallback(
    (newUsersInfo) => {
      if (!users) {
        console.error("Users data is undefined or null");
        return;
      }

      for (const key in newUsersInfo.newUsersInfo) {
        if (users[key]) {
          const score1 = newUsersInfo.newUsersInfo[key].score;
          const score2 = users[key].score;
          if (score1 !== score2) {
            flashGreen(key);
          }  
        }
      }

      setUsers(newUsersInfo.newUsersInfo);
    },
    [users]
  );


  const categoryChoice = (category, active) => {
    if(active) {
      return (
      <div onClick={() => selectCategory(category)} className={`categoryChoice ${notChosenCategories[category] || ""}`}>
        {category}
      </div>
    );
  }
  else{
    return (
      <div className={`categoryChoice ${notChosenCategories[category] || ""}`}>
      {category}
    </div>
    )
  }

  };
  const selectCategory = (category) => {
    socket.emit("selectedCategory", { lobbyName, category });
  };

  const updateTimer = useCallback((timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      rafRef.current = requestAnimationFrame(updateTimer);
      return;
    }
  
    const elapsed = timestamp - startTimeRef.current;
    startTimeRef.current = timestamp;
  
    const decrement = elapsed / 1000; // Convert milliseconds to seconds
    setTimeLeft((prevTimeLeft) => {
      const newTimeLeft = Math.max(prevTimeLeft - decrement, 0);
      if (newTimeLeft <= 0) {
        cancelAnimationFrame(rafRef.current);
        timerFinished();
      }
      return newTimeLeft;
    });
  
    rafRef.current = requestAnimationFrame(updateTimer);
  }, [timerFinished]); 
  
  const startTimer = useCallback(() => {
    setTimeLeft(questionTimer);
    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(updateTimer);
  }, [questionTimer, updateTimer]);


  useEffect(() => {
    if (timerRunning) {
      startTimer();
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [timerRunning]);

  useEffect(() => {
    const handleUpdatedScores = (newUsersInfo) => {
      updateScores(newUsersInfo);
    };

    socket.on("updatedScore", handleUpdatedScores);

    return () => {
      socket.off("updatedScore", handleUpdatedScores);
    };
  }, [updateScores]);

  const preGameState = () => {
    return (
      lobbyInfo.host === user && (
        <>
          <button onClick={() => startGame()} className="startGameButton">
            Start
          </button>
        </>
      )
    );
  };
  const winnersState = () => {
    return (
      <div className="questionScoreDiv">
        <div className="questionDiv">
          <div>
            Vinnaren är:
            {winners.map((winner) => (
              <div>{winner}</div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  const mainGameState = () => {
    return (
      <>
        <div className="questionScoreDiv">
          <div className="questionDiv">
            <QuestionComponent
              answer={answer}
              setAnswer={setAnswer}
              question={currentQuestion}
              activeQuestion={activeQuestion}
              submitAnswer={submitAnswer}
              submittedAnswer={submittedAnswer}
              correctAnswer={correctAnswer}
              triggeredOption={triggeredOption}
              setTriggeredOption={setTriggeredOption}
              hostname={lobbyInfo.host}
              username={user}
              isLocked={isLocked}
              canProgress={canProgress}
            />
            {!lobbyInfo.currentChooser.active && (
            <div className="timerProgressBarContainer">
              <div
                className="timerProgressBarBar"
                style={{ width: (timeLeft / questionTimer) * 100 + "%" }}
              />
            </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const categoryChoosingState = () => {
    return (
      <>
        {lobbyInfo.currentChooser.currentChooser === user ? (
          <>
            <div className="categoryChoicesDiv">
              <p className="categoryChoicesDivTitle">
                Din tur att välja kategori.
              </p>

              {lobbyInfo.currentChooser.categoryChoices.map((category) => (
                <>{categoryChoice(category, true)}</>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="categoryChoicesDiv inactive">
              <p className="categoryChoicesDivTitle">
                Väntar på att {lobbyInfo.currentChooser.currentChooser} väljer
                kategori.
              </p>
              {lobbyInfo.currentChooser.categoryChoices.map((category) => (
                <>{categoryChoice(category)}</>
              ))}
            </div>
          </>
        )}
      </>
    );
  };

  const renderContent = () => {
    if (lobbyInfo.active === false) return preGameState();
    else if (winners.length > 0) return winnersState();
    else return mainGameState();
   
  };

  return (
    <div className="mpMainDiv">
      <p className="roomTitle">
        Rumsnamn: {lobbyName} <br />
      </p>
      <div className="mpMainContent">
      {renderContent()}
      {(lobbyInfo.currentChooser.active && categoryChoosingState())}
      </div>
      <div className="scorePanel">
        <div className="scorePanelTitle">{lobbyInfo.chosenWinCon === "correctCon" ? (<>Först till {lobbyInfo.winConNumber} korrekta svar!</>) : (<>Fråga {lobbyInfo.questionAmount} / {lobbyInfo.winConNumber}</>)}</div>
        <div className="mpScoreDiv">{Object.keys(users).map((user) => (
          <div key={user} className={`userEntry ${animatedUsers[user] || ""}`}>
            <div className="username">{users[user].username}</div>
            <div className="score">{users[user].score}</div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};
export default MultiPlayer;
