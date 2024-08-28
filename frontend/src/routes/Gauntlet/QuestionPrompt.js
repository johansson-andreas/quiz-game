import QuestionComponent from "../../components/QuestionComponent/QuestionComponent.js";
import { useState, useContext, useEffect } from "react";
import styles from "./gauntlet.module.css";
import { randomProperty, shuffleArray } from "./GauntletUtils.js";
import axios from "axios";
import { UserContext } from "../../contexts/UserContext.js";

const QuestionPrompt = ({ playerData, setPlayerData, setActiveQuestion, activeQuestion }) => {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [questionIcons, setQuestionIcons] = useState([]);
  const [question, setQuestion] = useState({});
  const [answer, setAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [totalQuestionsScore, setTotalQuestionsScore] = useState([0, 0]);
  const [currentQuestionCategories, setCurrentQuestionCategories] = useState(
    []
  );
  const [newQuestionCategories, setNewQuestionCategories] = useState([]);
  const [scoreArray, setScoreArray] = useState({});
  const [questionTags, setQuestionTags] = useState([]);
  const { user } = useContext(UserContext);
  const [catCanvasShow, setCatCanvasShow] = useState(false);
  const [triggeredOption, setTriggeredOption] = useState(null);
  const [fading, setFading] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [streakRecord, setStreakRecord] = useState(0);

  useState(() => {
    console.log(playerData.currentQuestions);
  }, [playerData]);

  const getNextQuestion = async () => {
    if (Object.keys(playerData.currentQuestions).length > 0) {
      const randomCat = randomProperty(playerData.currentQuestions);
      setActiveQuestion(true);

      setPlayerData((prevData) => {
        const newData = { ...prevData };
        newData.currentQuestions[randomCat]--;
        if (newData.currentQuestions[randomCat] <= 0)
          delete newData.currentQuestions[randomCat];
        return newData;
      });
      try {
        const response = await axios.get(
          `/api/question-routes/question/${randomCat}`
        );
        console.log(response.data);
        setCurrentQuestion(response.data);
      } catch (error) {
        console.log(error);
      }
      console.log("randomcat", randomCat);
    } else {
        console.log('Out of questions, showing new ')
    }
  };

  const submitAnswer = (e) => {
    setSubmittedAnswer(answer);
  };

  const handleOptionChange = (e) => {
    setAnswer(e.target.value);
  };

  const handleOptionChangeWrapper = (event) => {
    handleOptionChange(event);
  };

  useEffect(() => {
    console.log("Submitted answer:", submittedAnswer);
    if (submittedAnswer !== "") {
      postAnswer();
    }
  }, [submittedAnswer]);

  const postAnswer = async () => {
    try {
      console.log("questionid", currentQuestion);
      const response = await axios.post(
        `/api/gauntlet-routes/questions/answer`,
        { questionID: currentQuestion.id, submittedAnswer }
      );

      setActiveQuestion(false);
      const isCorrect = response.data.correctAnswer === submittedAnswer;

      if(!isCorrect) setPlayerData(prevData => {
        const newData = {...prevData}
        newData.lives--;
        return newData;
      })
      console.log("Correct answer:", response.data.correctAnswer);
      setCorrectAnswer(response.data.correctAnswer);
      setTriggeredOption(response.data.correctAnswer);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useState(() => {
    getNextQuestion();
  }, []);

  return (
    <div className={styles.questionPromptMain}>
      <QuestionComponent
        handleOptionChangeWrapper={handleOptionChangeWrapper}
        answer={answer}
        question={currentQuestion}
        activeQuestion={activeQuestion}
        nextQuestion={getNextQuestion}
        submitAnswer={submitAnswer}
        submittedAnswer={submittedAnswer}
        correctAnswer={correctAnswer}
        triggeredOption={triggeredOption}
        setTriggeredOption={setTriggeredOption}
      />
    </div>
  );
};
export default QuestionPrompt;
