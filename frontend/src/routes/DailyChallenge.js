import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { UserContext } from "../contexts/UserContext.js";
import styles from "./styles/DailyChallenge.module.css";
import LoginPanel from "../components/LoginPanel/LoginPanel.js";
import DailyHistoryPanel from "../components/DailyHistoryPanel/DailyHistoryPanel.js";
import QuestionComponent from "../components/QuestionComponent/QuestionComponent.js";

const DailyChallenge = () => {
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [question, setQuestion] = useState({
    text: "",
    choices: [],
    icons: [],
    tags: [],
  });
  const [answer, setAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [activeQuestion, setActive] = useState(true);
  const [questionCategories, setQuestionCategories] = useState([]);
  const { user } = useContext(UserContext);
  const [currentScore, setCurrentScore] = useState(0);
  const [questionsRemaining, setQuestionsRemaining] = useState(0);
  const [activeQuiz, setActiveQuiz] = useState(true);
  const [dailyBestList, setDailyBestList] = useState([]);
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [questionKey, setQuestionKey] = useState({});
  const [isLoginPanelVisible, setLoginPanelVisible] = useState(true);
  const [triggeredOption, setTriggeredOption] = useState(null);


  const togglePanelVisibility = () => {
    setLoginPanelVisible((prev) => !prev);
  };

  const initialContact = async () => {
    try {
      const response = await axios.get(
        "/api/daily-challenge-routes/initial-contact"
      );
      const { todaysScore, questionsRemaining, currentQuestion } =
        response.data.dcd;
      console.log(response);
      const categories = response.data.categories;
      setQuestionCategories(categories);
      setQuestion(currentQuestion);
      setQuestionsRemaining(questionsRemaining.length);
      setCurrentScore(todaysScore);
      if (questionsRemaining.length === 0) setActiveQuiz(false);
      else setActiveQuiz(true);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  useEffect(() => {
    if (user) initialContact();
    else setLoginPanelVisible(true);
  }, [user]);

  const assignQuestion = (questionData) => {
    setQuestion(questionData);
  };
  useEffect(() => {
    console.log("question", question);
  }, [question]);

  //Request new question from backend block
  const nextQuestion = async () => {
    try {
      const response = await axios.get(
        "/api/daily-challenge-routes/request-question"
      );
      console.log("response:", response);

      if (response.data.status === "ok") {
        assignQuestion(response.data.question);
        setActive(true);
        setQuestionsRemaining((prevCount) => prevCount - 1);
      } else if (response.data.status === "out of questions") {
        //TODO: ADD SOMETHING WHEN UUT OF QUESTIONS. MAYBE REMOVE QUESTION PANEL AND ADD RESULT PANEL?
        setActiveQuiz(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const submitAnswer = (e) => {
    setSubmittedAnswer(answer);
  };
  const handleOptionChange = (e) => {
    setAnswer(e.target.value);
  };

  useEffect(() => {
    const getDailyBest = async () => {
      if (activeQuiz === false) {
        try {
          const dailyBestResponse = await axios.get(
            "/api/daily-challenge-routes/get-daily-best"
          );
          const dailyQuestionKey = await axios.get(
            "/api/daily-challenge-routes/get-daily-question-key"
          );
          console.log(dailyQuestionKey.data.submittedAnswers);

          setQuestionKey(dailyQuestionKey.data.correctAnswers);
          setSubmittedAnswers(dailyQuestionKey.data.submittedAnswers);

          let newBestList = [];
          Object.keys(dailyBestResponse.data.message).forEach((key) => {
            const bestListEntry = {
              username: dailyBestResponse.data.message[key].userId.username,
              score: dailyBestResponse.data.message[key].score,
            };
            newBestList.push(bestListEntry);
          }, {});

          newBestList.sort(function (a, b) {
            return b.score - a.score;
          });

          setDailyBestList(newBestList.splice(0, 5));
        } catch (error) {
          console.log(error);
        }
      }
    };
    getDailyBest();
  }, [activeQuiz]);

  useEffect(() => {
    console.log("Submitted answer:", submittedAnswer);
    if (submittedAnswer !== "") {
      axios
        .post("/api/daily-challenge-routes/submit-answer", { submittedAnswer })
        .then((response) => {
          setActive(false);
          console.log(
            "todaysscore:",
            response.data.todaysScore,
            "Correct answer:",
            response.data.correctAnswer
          );
          setCurrentScore(response.data.todaysScore);
          setCorrectAnswer(response.data.correctAnswer);
          setTriggeredOption(response.data.correctAnswer);

        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [submittedAnswer]);

  const checkCorrect = (submittedAnswer, correctAnswer) => {
    if (submittedAnswer === correctAnswer) {
      return styles.correctAnswer;
    } else return styles.incorrectAnswer;
  };

  useEffect(() => {
    if (question) {
      const tempQuestionIcons = question.tags
        .map((tag) => {
          const categoryIcon = questionCategories.find(
            (category) => category._id === tag
          );
          return categoryIcon ? categoryIcon.icon : null;
        })
        .filter((icon) => icon !== null);
      setQuestion((prevQuestion) => ({
        ...prevQuestion,
        icons: tempQuestionIcons,
      }));
    }
  }, [questionCategories, question.tags]);

  const memoizedQuestionIcons = useMemo(() => {
    return question.tags
      .map((tag) => {
        const categoryIcon = questionCategories.find(
          (category) => category._id === tag
        );
        return categoryIcon ? categoryIcon.icon : null;
      })
      .filter((icon) => icon !== null);
  }, [question.tags, questionCategories]);

  return (
    <div className={styles.mainBody}>
      {user ? (
        <div className={styles.loggedInPanel}>
          {activeQuiz ? (
            <div className={styles.questionPanel}>
              {question.choices ? (
                <div className={styles.questionBody}>
                  Fråga {10 - questionsRemaining} av 10
                  <QuestionComponent
                    question={question}
                    handleOptionChangeWrapper={handleOptionChange}
                    answer={answer}
                    questionIcons={memoizedQuestionIcons}
                    submitAnswer={submitAnswer}
                    nextQuestion={nextQuestion}
                    activeQuestion={activeQuestion}
                    submittedAnswer={submittedAnswer}
                  correctAnswer={correctAnswer}
                  triggeredOption={triggeredOption}
                  setTriggeredOption={setTriggeredOption}

                  />

                </div>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          ) : (
            <div className={styles.scorePanel}>
              <div className={styles.scoreSection}>
                <div>Du hade {currentScore} rätt(a) svar idag!</div>
                <div id={styles.scoreHeaders}>
                  <div className={styles.keyQuestionTextTitle}>Fråga</div>
                  <div className={styles.submittedAnswersTitle}>Ditt svar:</div>
                  <div className={styles.keyCorrectAnswerTitle}>Rätt svar:</div>
                </div>
                {Object.keys(questionKey).map((index) => (
                  <div key={index} className={styles.keyDiv}>
                    <div className={styles.keyQuestionText}>
                      {questionKey[index].text}
                    </div>
                    <div
                      className={checkCorrect(
                        submittedAnswers[questionKey[index]._id],
                        questionKey[index].correctAnswer
                      )}
                    >
                      {submittedAnswers[questionKey[index]._id]}
                    </div>
                    <div className={styles.keyCorrectAnswer}>
                      {" "}
                      {questionKey[index].correctAnswer}
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.historySection}>
                <div id={styles.dailyBestTitle}>Dagens Bästa</div>
                <div id={styles.dailyBestHeader}>
                  <div id={styles.nameHeader}>Namn</div>{" "}
                  <div id={styles.pointHeader}>Poäng</div>
                </div>
                {Object.keys(dailyBestList).map((index) => (
                  <div key={index} className={styles.dailyBestEntry}>
                    <div className={styles.dailyBestEntryName}>
                      {dailyBestList[index].username}
                    </div>
                    <div className={styles.dailyBestEntryScore}>
                      {dailyBestList[index].score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DailyHistoryPanel historyPanelTitle="Din historik" />
        </div>
      ) : (
        <div className={styles.loginPanel}>
          {isLoginPanelVisible && (
            <LoginPanel togglePanelVisibility={togglePanelVisibility} />
          )}
        </div>
      )}
    </div>
  );
};

export default DailyChallenge;