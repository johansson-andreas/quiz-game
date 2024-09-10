import { useState, useEffect } from "react";
import axios from "axios";
import "./styles/newPageStyle.css";
import QuestionComponent from "../components/QuestionComponent/QuestionComponent.js";

const NewPage = () => {
  const [buttonValue, setButtonValue] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [questionIcons, setQuestionIcons] = useState([]);
  const [question, setQuestion] = useState({});
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
  const [triggeredOption, setTriggeredOption] = useState(null);
  const [fading, setFading] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [streakRecord, setStreakRecord] = useState(0);

  function buttonPlusOne() {
    setButtonValue(buttonValue + 1);
    console.log("increased button value by 1");
  }
  const mount = async () => {
    try {
      const questionResponse = await axios.get("/api/question-routes/question/connect");
      console.log(questionResponse.data);
      setQuestion(questionResponse.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    mount();
  }, []);

  const nextQuestion = async () => {
    console.log("Next question");

    try {
      const response = await axios.get("/api/question-routes/question");
      console.log("GET request successful:", response.data);

      setFading(true);
      setTimeout(() => {
        setFading(false);
      }, 1500);
      setTimeout(() => {
        setActive(true);
        assignQuestion(response.data);
      }, 450);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const assignQuestion = (questionData) => {
    setQuestion(questionData);
    setQuestionTags(questionData.tags);
  };

  const submitAnswer = (e) => {
    setSubmittedAnswer(answer);
  };

  const handleCheckboxChange = (category) => {
    setNewQuestionCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat._id === category._id ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  return (
    <>
      <QuestionComponent
        answer={answer}
        setAnswer={setAnswer}
        question={question}
        questionIcons={questionIcons}
        activeQuestion={activeQuestion}
        nextQuestion={nextQuestion}
        submitAnswer={submitAnswer}
        submittedAnswer={submittedAnswer}
        correctAnswer={correctAnswer}
        triggeredOption={triggeredOption}
        setTriggeredOption={setTriggeredOption}
      />
    </>
  );
};
export default NewPage;
