import React, { useState, useEffect, useContext } from "react";
import "./styles/singlePlayerStyle.css";
import IconComponent from "../components/IconComponent";
import ScorePanel from "../components/ScorePanel";
import { UserContext } from "../contexts/UserContext";
import axios from "axios";
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";
import QuestionComponent from "../components/QuestionComponent/QuestionComponent.js";
import classNames from "classnames";

const Controller = () => {
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
  const { user } = useContext(UserContext);
  const [catCanvasShow, setCatCanvasShow] = useState(false);
  const [triggeredOption, setTriggeredOption] = useState(null);
  const [fading, setFading] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [streakRecord, setStreakRecord] = useState(0);

  useEffect(() => {
    setTotalQuestionsScore([0, 0]);
    setScoreArray({});
    initialContact();
  }, [user]);

  const initialContact = async () => {
    try {
      const response = await axios.get("/api/question-routes/initial-contact");
      console.log("Received initial data:", response.data);
      const { question, categories, scoreArray, currentTotals } = response.data;
      assignQuestion(question);
      const newCategories = categories.map((category) => ({
        _id: category._id,
        count: category.count,
        icon: category.icon,
        enabled: category.enabled,
      }));
      setCurrentQuestionCategories(newCategories);
      setNewQuestionCategories(newCategories);

      if (scoreArray) setScoreArray(scoreArray);
      if (currentTotals) {
        setTotalQuestionsScore([currentTotals[0], currentTotals[1]]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const submitAnswer = (e) => {
    setSubmittedAnswer(answer);
  };

  const assignQuestion = (questionData) => {
    setQuestion(questionData);
    setQuestionTags(questionData.tags);
  };

  const nextQuestion = async () => {

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

  const handleCheckboxChange = (category) => {
    setNewQuestionCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat._id === category._id ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  const handleCatCanvasClose = () => setCatCanvasShow(false);
  const handleCatCanvasShow = () => setCatCanvasShow(true);

  const postAnswer = async () => {
    try{
      const response = await axios.post(`/api/question-routes/question/answers`, {answer});
      console.log(response)
      setActive(false);
      const isCorrect = response.data.correctAnswer === submittedAnswer;
      if (isCorrect) {
        // Update current streak
        setCurrentStreak((prevStreak) => {
          const newStreak = prevStreak + 1;
          if (newStreak > streakRecord) {
            setStreakRecord(newStreak);
          }
          return newStreak;
        });
      } else {
        // Reset current streak, but keep the record unchanged
        setCurrentStreak(0);
      }

      setScoreArray(response.data.scoreArray);
      setCorrectAnswer(response.data.correctAnswer);
      setTotalQuestionsScore((prevCount) => {
        const newCount = [...prevCount];
        if (response.data.correctAnswer === submittedAnswer)
          newCount[0] += 1;
        newCount[1] += 1;
        return newCount;
      });
      setTriggeredOption(response.data.correctAnswer);
  } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    console.log("Submitted answer:", submittedAnswer);
    if (submittedAnswer !== "") {
      postAnswer();
    }
  }, [submittedAnswer]);

  useEffect(() => {
    setQuestionIcons(
      questionTags
        .map((tag) => {
          const categoryIcon = currentQuestionCategories.find(
            (category) => category._id === tag
          );
          return categoryIcon ? categoryIcon.icon : null;
        })
        .filter((icon) => icon !== null)
    );
  }, [questionTags]);

  const getNewQuestionQueue = async () => {
    if (
      newQuestionCategories !== currentQuestionCategories &&
      Object.keys(newQuestionCategories).length > 0
    ) {
      setCurrentQuestionCategories(newQuestionCategories);
      console.log("requestion new question queue");
      try {
        const response = await axios.patch(
          "/api/question-routes/question-queue/",
          { newQuestionCategories }
        );
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    getNewQuestionQueue();
  }, [newQuestionCategories]);

  return (
    <div className="mainBody">
      <div className={classNames("questionBody", fading ? "fadePulse" : "")}>
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
      </div>
      <div className="scoreDiv">
        <ScorePanel
          scoreArray={scoreArray}
          totalQuestionsScore={totalQuestionsScore}
          questionCategories={currentQuestionCategories}
          currentStreak={currentStreak} // pass current streak
          streakRecord={streakRecord} // pass streak record
        />
      </div>
      <div className="categoriesDiv">
        <Button
          variant="primary"
          onClick={handleCatCanvasShow}
          className="catButton"
        >
          K a t e g o r i e r
        </Button>
        <Offcanvas
          show={catCanvasShow}
          onHide={handleCatCanvasClose}
          placement="end"
          className="offcanvas"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Kategorier</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {currentQuestionCategories.map((category, index) => (
              <label key={category._id} className="checkboxLabels">
                <div className="topLineCheckbox">
                  <input
                    type="checkbox"
                    defaultChecked={category.enabled}
                    onChange={() => handleCheckboxChange(category)}
                  />
                  {category._id} <IconComponent imageName={category.icon} />
                </div>
                ({category.count})
              </label>
            ))}
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </div>
  );
};

export default Controller;
