import socket from "../Socket.js";
import React from 'react';
import { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../contexts/UserContext.js";
import QuestionComponent from "../components/QuestionComponent/QuestionComponent.js";
import { ProgressBar } from "react-bootstrap";


const MultiPlayer = ({ lobbyName }) => {
  const [users, setUsers] = useState([]);
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
  const [seconds, setSeconds] = useState(0);
  const lobbyInfoRef = useRef(lobbyInfo);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [canProgress, setCanProgress] = useState(false);

  const startGame = () => {
    socket.emit("startGame", lobbyName);
    console.log(new Date().toISOString())
  };

  const timerFinished = () => {
    if(!submittedAnswer)
      {
        if(answer)setSubmittedAnswer(answer);
        else setSubmittedAnswer('pass')
      }
      setCanProgress(true)
      setTimerStarted(false)
  };

  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!timeLeft) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTimeLeft) => prevTimeLeft - 0.001);
    }, 0.1);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const progress = (30 - timeLeft) / 30;


  const nextQuestion = () => {
    console.log('next question')
    socket.emit('getNextQuestion', lobbyName)
  };
  useEffect(() => {
    if(submittedAnswer)
      {
        console.log('submitting answer', submittedAnswer)
        socket.emit('submitAnswer', {lobbyName, submittedAnswer})
        setIsLocked(true);
        setActive(false);
      }
  }, [submittedAnswer])

  const submitAnswer = (e) => {
    setSubmittedAnswer(answer);
  };

  useEffect(() => {
    console.log("new lobby info", lobbyInfo);

    lobbyInfoRef.current = lobbyInfo;
    setCurrentQuestion(lobbyInfo.currentQuestion);
  }, [lobbyInfo]);

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
      setSeconds(lobbyInfoRef.current.questionTimer);
      setTimerStarted(true);
    };
    const updateScores = (newUsersInfo) => {
      console.log('new users info', newUsersInfo.newUsersInfo)
      setUsers(newUsersInfo.newUsersInfo);
    }
    const receivedNewQuestion = (newQuestion) => {
      console.log('received new question', newQuestion.newQuestion)
      setCurrentQuestion(newQuestion.newQuestion)
      setIsLocked(false);
      setTimerStarted(true);
      setActive(true);
      setCanProgress(false);
    }

    socket.on("sendRoomInfo", handleRoomInfo);
    socket.on("currentUsersInRoom", handleCurrentUsers);
    socket.on("startingGame", handleStartingGame);
    socket.on("updatedScore", updateScores)
    socket.on("newQuestion", receivedNewQuestion)

    return () => {
      socket.emit("leaveRoom");
      socket.off("sendRoomInfo", handleRoomInfo);
      socket.off("currentUsersInRoom", handleCurrentUsers);
      socket.off("startingGame", handleStartingGame);
      socket.off("updatedScore", updateScores)
      socket.off("newQuestion", receivedNewQuestion)
    };
  }, []);

  return (
    <div>
      <h1>MultiPlayer Page</h1>
      <p>Lobby Name: {lobbyName}</p>
      {lobbyInfo.active == false && lobbyInfo.host == user ? (
        <>
          {" "}
          <button onClick={() => startGame()}>Start</button>
        </>
      ) : (
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
      <div style={{ backgroundColor: "#ddd", height: 20 }}>
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            backgroundColor: "#0070f3",
          }}
        />
      </div>
        </div>
      )}

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
  );
};
export default MultiPlayer;
