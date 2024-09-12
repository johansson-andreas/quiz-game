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
import { randomizeArrayIndex } from "../GeneralUtils.js";

const Controller = () => {
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [unusedQuestions, setUnusedQuestions] = useState({})
  const [question, setQuestion] = useState({});
  const [answer, setAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [totalQuestionsScore, setTotalQuestionsScore] = useState([0, 0]);
  const [activeQuestion, setActive] = useState(true);
  const [enabledCategories, setEnabledCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([])
  const [scoreArray, setScoreArray] = useState({});
  const { user } = useContext(UserContext);
  const [catCanvasShow, setCatCanvasShow] = useState(false);
  const [triggeredOption, setTriggeredOption] = useState(null);
  const [fading, setFading] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [streakRecord, setStreakRecord] = useState(0);

  useEffect(() => {
    setTotalQuestionsScore([0, 0]);
    setScoreArray({});
    mount();
  }, [user]);

  const mount = async () => {
    try {
      const spData = JSON.parse(localStorage.getItem('spData'));

      if (spData) {
        console.log('local storage gauntlet data', spData)
        setQuestion(spData.question);
        setUnusedQuestions(spData.unusedQuestions);
        setEnabledCategories(spData.enabledCategories);
        setCurrentStreak(spData.currentStreak);
        setStreakRecord(spData.streakRecord);
      } else {
        createNewGame(); 
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createNewGame = async () => {
    try {
      const [categoriesResponse, allQuestionsResponse] = await Promise.all([
        axios.get("/api/gauntlet-routes/categories"),
        axios.get("/api/gauntlet-routes/questions")
      ]);

      setEnabledCategories(categoriesResponse.data);
      setAllCategories(categoriesResponse.data);
      setUnusedQuestions(allQuestionsResponse.data);

      setQuestion(await getNewQuestion(unusedQuestions, enabledCategories))

    } catch (error) {
      console.log(error);
    }

  }

  const getNewQuestion = async (unusedQuestions, enabledCategories) => {
    try {
    const randomCat = randomizeArrayIndex(enabledCategories); 
    const randomDiff = randomizeArrayIndex(unusedQuestions[randomCat]);
    const questionID = unusedQuestions[randomCat][randomDiff][randomizeArrayIndex(unusedQuestions[randomCat][randomDiff])];
    const newQuestion = await axios.get(`/api/question-routes/question/:${questionID}`)

    setQuestion(newQuestion);

  }
  catch (error)
  {
    console.error(error)
  }
  }

  const submitAnswer = (e) => {
    setSubmittedAnswer(answer);
  };

  const handleCheckboxChange = (category) => {
    setEnabledCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat._id === category._id ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  const handleCatCanvasClose = () => setCatCanvasShow(false);
  const handleCatCanvasShow = () => setCatCanvasShow(true);

  const postAnswer = async () => {
    try{
   
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

  return (
    <div className="mainBody">
      <div className={classNames("questionBody", fading ? "fadePulse" : "")}>
        <QuestionComponent
          answer={answer}
          setAnswer={setAnswer}
          question={question}
          activeQuestion={activeQuestion}
          nextQuestion={getNewQuestion}
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
            {allCategories.map((category, index) => (
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
