import socket from "../Socket.js";
import React from "react";
import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { UserContext } from "../contexts/UserContext.js";
import QuestionComponent from "../components/QuestionComponent/QuestionComponent.js";
import "./styles/multiPlayerStyle.css";

const MultiPlayer = ({ lobbyName }) => {
  const [users, setUsers] = useState({});
  const [lobbyInfo, setLobbyInfo] = useState({
    users: {},
    chosenWinCon: "",
    winConNumber: 0,
    questionTimer: 0,
    active: false,
    host: "",
    currentQuestion: {},
  });
  const { user, setUser } = useContext(UserContext);
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [questionText, setQuestionText] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [questionIcons, setQuestionIcons] = useState([]);
  const [question, setQuestion] = useState({});
  const [options, setOptions] = useState([]);
  const [answer, setAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [totalQuestionsScore, setTotalQuestionsScore] = useState([0, 0]);
  const [activeQuestion, setActive] = useState(true);
  const [currentQuestionCategories, setCurrentQuestionCategories] = useState(
    []
  );
  const [newQuestionCategories, setNewQuestionCategories] = useState([]);
  const [scoreArray, setScoreArray] = useState({});
  const [questionTags, setQuestionTags] = useState([]);
  const [catCanvasShow, setCatCanvasShow] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [triggeredOption, setTriggeredOption] = useState(null);
  const lobbyInfoRef = useRef(lobbyInfo);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [canProgress, setCanProgress] = useState(false);

  const [questionTimer, setQuestionTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const startGame = () => {
    socket.emit("startGame", lobbyName);
    console.log(new Date().toISOString());
  };

  const timerFinished = () => {
    if (!submittedAnswer) {
      if (answer) setSubmittedAnswer(answer);
      else setSubmittedAnswer("pass");
      setIsLocked(true);
    }
    setCanProgress(true);
  };
  useEffect(() => {
    if (!timeLeft) return;
    const intervalId = setInterval(() => {
      if (timeLeft < 0) {
        clearInterval(intervalId);
        timerFinished();
        return;
      } else setTimeLeft((prevTimeLeft) => prevTimeLeft - 0.001);
    }, 1);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const nextQuestion = () => {
    console.log("next question");
    socket.emit("getNextQuestion", lobbyName);
  };

  useEffect(() => {
    if (submittedAnswer) {
      console.log("submitting answer", submittedAnswer);
      socket.emit("submitAnswer", { lobbyName, submittedAnswer });
      setIsLocked(true);
      setActive(false);
    }
  }, [submittedAnswer]);

  const submitAnswer = (e) => {
    setSubmittedAnswer(answer);
  };

  useEffect(() => {
    console.log("new lobby info", lobbyInfo);

    lobbyInfoRef.current = lobbyInfo;
    setCurrentQuestion(lobbyInfo.currentQuestion);
  }, [lobbyInfo]);

  useEffect(() => {
    console.log("users object", users);
  }, [users]);
  const handleOptionChange = (e) => {
    setAnswer(e.target.value);
  };

  useEffect(() => {
    socket.emit("getRoomInfo", lobbyName);
    console.log("Requesting room info");

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
      setTimeLeft(lobbyInfoRef.current.questionTimer);
      setTimerStarted(true);
    };

    const receivedNewQuestion = (newQuestion) => {
      console.log("received new question", newQuestion.newQuestion);
      console.log("reseting timer", lobbyInfoRef.current.questionTimer);
      setCurrentQuestion(newQuestion.newQuestion);
      setIsLocked(false);
      setTimeLeft(lobbyInfoRef.current.questionTimer);
      setTimerStarted(true);
      setActive(true);
      setCanProgress(false);
      setSubmittedAnswer("");
    };
    const handleCorrectAnswer = (correctAnswer) => {
      setCorrectAnswer(correctAnswer);
      setTriggeredOption(correctAnswer);
    };

    socket.on("sendRoomInfo", handleRoomInfo);
    socket.on("currentUsersInRoom", handleCurrentUsers);
    socket.on("startingGame", handleStartingGame);
    socket.on("newQuestion", receivedNewQuestion);
    socket.on("correctAnswer", handleCorrectAnswer);

    return () => {
      socket.emit("leaveRoom");
      socket.off("sendRoomInfo", handleRoomInfo);
      socket.off("currentUsersInRoom", handleCurrentUsers);
      socket.off("startingGame", handleStartingGame);
      socket.off("newQuestion", receivedNewQuestion);
      socket.off("correctAnswer", handleCorrectAnswer);
    };
  }, []);

  const flashRed = (username) => {
    

  }

  const flashGreen = (username) => {

    
  }

  const updateScores = useCallback(
    (newUsersInfo) => {
      if (!users) {
        console.error("Users data is undefined or null");
        return;
      }
      const comparisons = [];
      for (const key in newUsersInfo.newUsersInfo) {
        if (users[key]) {
          const score1 = newUsersInfo.newUsersInfo[key].score;
          const score2 = users[key].score;
          if (score1 === score2) flashRed(key);
          else flashGreen(key);
        }
      }

      console.log("comp", comparisons);
      setUsers(newUsersInfo.newUsersInfo);
    },
    [users]
  );
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

  return (
    <div className="mpMainDiv">
      <p>Rumsnamn: {lobbyName}</p>
      {lobbyInfo.active == false && lobbyInfo.host == user ? (
        <>
          {" "}
          <button onClick={() => startGame()} className="startGameButton">
            Start
          </button>
        </>
      ) : (
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
            <progress
              value={timeLeft / questionTimer}
              className="timerProgressBar"
            />
          </div>

          <div className="mpScoreDiv">
            {users ? (
              Object.keys(users).map((user) => (
                <div key={user} className="userEntry">
                  <div className="usernameEntry">{users[user].username}</div>
                  <div className="scoreEntry">Score: {users[user].score}</div>
                </div>
              ))
            ) : (
              <div></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default MultiPlayer;
