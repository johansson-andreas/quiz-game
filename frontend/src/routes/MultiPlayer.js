import socket from "../Socket.js";
import { useState, useEffect, useContext, useRef} from "react";
import { UserContext } from "../contexts/UserContext.js";
import QuestionComponent from "../components/QuestionComponent/QuestionComponent.js";
import ProgressBar from 'react-bootstrap/ProgressBar';


const MultiPlayer = ({ lobbyName }) => {
  const [users, setUsers] = useState([]);
  const [lobbyInfo, setLobbyInfo] = useState({
    questionTimer: 0,
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

  const startGame = () => {
    socket.emit("startGame", lobbyName);
  };

  const submitAnswer = (e) => {
    setSubmittedAnswer(answer);
  };

  useEffect(() => {
    console.log('new lobby info', lobbyInfo)

    lobbyInfoRef.current = lobbyInfo;
  }, [lobbyInfo]);

  const nextQuestion = () => {
    console.log("Next question");
  };

  const handleOptionChange = (e) => {
    setAnswer(e.target.value);
  };

   const renderProgressBar = () => {
    return <ProgressBar now={seconds} max={lobbyInfo.questionTimer} min={0}/>;
  }

  useEffect(() => {
    console.log('setting timer to', seconds);
    
    if (seconds <= 0) {
      console.log(new Date().toISOString());
      return;
    }
    
    const intervalId = setInterval(() => {
      setSeconds(prevSeconds => Math.max(prevSeconds - 0.01, 0)); // Prevent going negative
    }, 10);
  
    return () => clearInterval(intervalId);
  }, [seconds]);

  useEffect(() => {
    console.log("users", Object.keys(users));
  }, [users]);

  useEffect(() => {
    console.log('new timer', lobbyInfo.questionTimer)

  }, [lobbyInfo.questionTimer])

  useEffect(() => {

    socket.emit("getRoomInfo", lobbyName);
    console.log("Requesting room info");
  
    const handleRoomInfo = (lobbyInfo) => {
      console.log("Received room info", lobbyInfo);
      setLobbyInfo(lobbyInfo);
      setUsers(lobbyInfo.users);
    };
  
    const handleCurrentUsers = (currentUsers) => {
      console.log("Current users", currentUsers);
      setUsers(currentUsers);
    };
  
    const handleStartingGame = (updatedLobbyInfo) => {
      setLobbyInfo((prevLobbyInfo) => {
        let newLobbyInfo = { ...prevLobbyInfo };
        newLobbyInfo.active = updatedLobbyInfo.active;
        return newLobbyInfo;
      });
      setCurrentQuestion(lobbyInfo.currentQuestion);
      setSeconds(lobbyInfo.questionTimer);
    };
  
    socket.on("sendRoomInfo", handleRoomInfo);
    socket.on("currentUsersInRoom", handleCurrentUsers);
    socket.on("startingGame", handleStartingGame);

    return () => {
      socket.emit("leaveRoom");
      socket.off("sendRoomInfo", handleRoomInfo);
      socket.off("currentUsersInRoom", handleCurrentUsers);
      socket.off("startingGame", handleStartingGame);
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
          />
          {renderProgressBar()}
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
