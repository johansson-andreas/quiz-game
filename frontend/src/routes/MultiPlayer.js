import socket from "../Socket.js";
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { UserContext } from "../contexts/UserContext.js";
import QuestionComponent from "../components/QuestionComponent/QuestionComponent.js";
import "./styles/multiPlayerStyle.css";

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
    currentChooser: "",
  });
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [questionIcons, setQuestionIcons] = useState([]);
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

    console.log(
      "submittedAnswer on timerFinished",
      currentSubmittedAnswer,
      "answer:",
      currentAnswer
    );

    if (!currentSubmittedAnswer) {
      if (currentAnswer) setSubmittedAnswer(currentAnswer);
      else setSubmittedAnswer("pass");
      setIsLocked(true);
    }
    setTimeout(() => setCanProgress(true), 1000);
    setTimerRunning(false);
  };

  const updateTimer = (timestamp) => {
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
  };

  const nextQuestion = () => {
    console.log("next question");
    socket.emit("getNextQuestion", lobbyName);
  };

  useEffect(() => {}, [lobbyInfo.currentChooser]);

  useEffect(() => {
    submittedAnswerRef.current = submittedAnswer;

    if (submittedAnswer) {
      console.log("submitting answer", submittedAnswer);
      socket.emit("submitAnswer", { lobbyName, submittedAnswer });
      setIsLocked(true);
      setActive(false);
    }
  }, [submittedAnswer]);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  const submitAnswer = (e) => {
    setSubmittedAnswer(answer);
  };

  useEffect(() => {
    console.log("new lobby info", lobbyInfo);
    lobbyInfoRef.current = lobbyInfo;
    setCurrentQuestion(lobbyInfo.currentQuestion);
  }, [lobbyInfo]);

  useEffect(() => {}, [users]);

  const handleOptionChange = (e) => {
    setAnswer(e.target.value);
  };

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

    const handleStartingGame = (updatedLobbyInfo) => {
      setLobbyInfo((prevLobbyInfo) => {
        let newLobbyInfo = { ...prevLobbyInfo };
        newLobbyInfo.active = updatedLobbyInfo.active;
        newLobbyInfo.currentQuestion = updatedLobbyInfo.currentQuestion;
        return newLobbyInfo;
      });
      setQuestionTimer(lobbyInfoRef.current.questionTimer);
      setTimerRunning(true);
    };

    const receivedNewQuestion = (newQuestion) => {
      setCurrentQuestion(newQuestion.newQuestion);
      setIsLocked(false);
      setActive(true);
      setCanProgress(false);
      setSubmittedAnswer("");
      setTimerRunning(true);
    };
    const handleCorrectAnswer = (correctAnswer) => {
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
        return updatedLobbyInfo;
      });
    };

    socket.on("sendRoomInfo", handleRoomInfo);
    socket.on("currentUsersInRoom", handleCurrentUsers);
    socket.on("startingGame", handleStartingGame);
    socket.on("newQuestion", receivedNewQuestion);
    socket.on("correctAnswer", handleCorrectAnswer);
    socket.on("winnerDetermined", handleWinnerDetermined);
    socket.on("currentChooser", handleCurrentChooser);

    return () => {
      socket.emit("leaveRoom");
      socket.off("sendRoomInfo", handleRoomInfo);
      socket.off("currentUsersInRoom", handleCurrentUsers);
      socket.off("startingGame", handleStartingGame);
      socket.off("newQuestion", receivedNewQuestion);
      socket.off("correctAnswer", handleCorrectAnswer);
      socket.off("winnerDetermined", handleWinnerDetermined);
      socket.off("currentChooser", handleCurrentChooser);
    };
  }, []);

  const flashRed = (username) => {
    setAnimatedUsers((prev) => ({ ...prev, [username]: "pulseRed" }));
    setTimeout(() => {
      setAnimatedUsers((prev) => {
        const { [username]: _, ...rest } = prev;
        return rest;
      });
    }, 1000); // Animation duration (milliseconds)
  };

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
          if (score1 === score2) {
            //TODO: HANDLE INCORRECT ANSWEER?
            //flashRed(key);
          } else flashGreen(key);
        }
      }

      setUsers(newUsersInfo.newUsersInfo);
    },
    [users]
  );

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
      console.log("Handling updated scores");
      updateScores(newUsersInfo);
    };

    socket.on("updatedScore", handleUpdatedScores);

    return () => {
      socket.off("updatedScore", handleUpdatedScores);
    };
  }, [updateScores]);

  const preGameState = () => {
    return (
      lobbyInfo.host == user && (
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
              handleOptionChangeWrapper={handleOptionChange}
              answer={answer}
              question={currentQuestion}
              questionIcons={questionIcons}
              activeQuestion={activeQuestion}
              nextQuestion={nextQuestion}
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
            <div className="timerProgressBarContainer">
              <progress
                value={timeLeft}
                max={questionTimer}
                className="timerProgressBar"
              />
            </div>
          </div>
        </div>
        <div className="mpScoreDiv">
          {Object.keys(users).map((user) => (
            <div
              key={user}
              className={`userEntry ${animatedUsers[user] || ""}`}
            >
              <div className="usernameEntry">{users[user].username}</div>
              <div className="scoreEntry">Score: {users[user].score}</div>
            </div>
          ))}
        </div>
      </>
    );
  };
  const categoryChoosingState = () => {
    return ( <></> )
  }

  const renderContent = () => {
    if (lobbyInfo.active == false) return preGameState();
    else if (winners.length > 0) return winnersState();
    else if (lobbyInfo.currentChooser) return categoryChoosingState();
    else return mainGameState();
  };

  return (
    <div className="mpMainDiv">
      <p>Rumsnamn: {lobbyName}</p>

      {renderContent()}
    </div>
  );
};
export default MultiPlayer;
