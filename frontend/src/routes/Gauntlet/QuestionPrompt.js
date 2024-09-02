import QuestionComponent from "../../components/QuestionComponent/QuestionComponent.js";
import { useState, useContext, useEffect } from "react";
import styles from "./gauntlet.module.css";
import { randomProperty, shuffleArray } from "./GauntletUtils.js";
import axios from "axios";
import { UserContext } from "../../contexts/UserContext.js";

const QuestionPrompt = ({ playerData, setPlayerData, setActiveQuestion, activeQuestion, setActiveGame }) => {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [answer, setAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState("");


  useState(() => {
    console.log(playerData.currentQuestions);
  }, [playerData]);

  const getNextQuestion = async () => {
    if (Object.keys(playerData.currentQuestions).length > 0) {
      const randomCat = randomProperty(playerData.currentQuestions);
      setActiveQuestion(true);
      setActiveGame(true);


      setPlayerData((prevData) => {
        const newData = { ...prevData };
        newData.currentQuestions[randomCat]--;
        if (newData.currentQuestions[randomCat] <= 0)
          delete newData.currentQuestions[randomCat];
        return newData;
      });
      try {


        const randomQuestion = await axios.get(`/api/gauntlet-routes/question/random/${randomCat}`);
        console.log('randomQuestion', randomQuestion.data)

        setCurrentQuestion(randomQuestion.data);
      } catch (error) {
        console.log(error);
      }
      console.log("randomcat", randomCat);
    } else {
      setActiveGame(false);
        console.log('Out of questions, showing new ')
    }
  };

  const submitAnswer = (e) => {
    setSubmittedAnswer(answer);
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
        { questionData: currentQuestion, submittedAnswer }
      );

      setActiveQuestion(false);
      const isCorrect = response.data.correct;
        setPlayerData(prevData => {
        const newData = {...prevData}
        if(isCorrect) newData.correctAnswers++;
        else newData.lives--;
        return newData;
    })
      console.log("Correct answer:", response.data.correctAnswer);
      setCorrectAnswer(response.data.correctAnswer);
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
        setAnswer={setAnswer}
        answer={answer}
        question={currentQuestion}
        activeQuestion={activeQuestion}
        nextQuestion={getNextQuestion}
        submitAnswer={submitAnswer}
        submittedAnswer={submittedAnswer}
        correctAnswer={correctAnswer}

      />
    </div>
  );
};
export default QuestionPrompt;
