import QuestionComponent from "../../components/QuestionComponent/QuestionComponent.js";
import { useState, useEffect } from "react";
import styles from "./gauntlet.module.css";
import axios from "axios";
import { getNewQuestion } from "./GauntletUtils.js";

const QuestionPrompt = ({ playerData, setPlayerData, setActiveQuestion, activeQuestion, setActiveGame, setCurrentQuestion, currentQuestion, unusedQuestions }) => {
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [answer, setAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState("");




  const loadInitialQuestion = async () => {
    const {updatedPlayerData, randomQuestion} = await getNewQuestion(playerData, unusedQuestions); 
    setActiveGame(true)
    setActiveQuestion(true) 
    setPlayerData(updatedPlayerData);
    setCurrentQuestion(randomQuestion);
  }

  useState(() => {
    if(Object.keys(currentQuestion).length < 1)
      {
        console.log('No question detected')
        loadInitialQuestion();
      }
  }, []);

  const submitAnswer = (e) => {
    setSubmittedAnswer(answer);
  };

  useEffect(() => {
    if (submittedAnswer !== "") {
      postAnswer();
    }
  }, [submittedAnswer]);

  const getNextQuestionHandler = async () => {
        const {updatedPlayerData, randomQuestion} = await getNewQuestion(playerData, unusedQuestions);
        if(updatedPlayerData){
          setActiveQuestion(true)
          setPlayerData(updatedPlayerData);
          setCurrentQuestion(randomQuestion);
        }
        else {
          console.log('out of questions');
          setCurrentQuestion({})
          setPlayerData(prevData => {
            const newData = {...prevData}
            newData.currentQuestions = {categories: {}, difficulties: {}};
            return newData;
          })
          setActiveGame(false);
        }


  } 

  const postAnswer = async () => {
    try {
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
      setCorrectAnswer(response.data.correctAnswer);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  return (
    <div className={styles.questionPromptMain}>
      <QuestionComponent
        setAnswer={setAnswer}
        answer={answer}
        question={currentQuestion}
        activeQuestion={activeQuestion}
        nextQuestion={getNextQuestionHandler}
        submitAnswer={submitAnswer}
        submittedAnswer={submittedAnswer}
        correctAnswer={correctAnswer}

      />
    </div>
  );
};
export default QuestionPrompt;
