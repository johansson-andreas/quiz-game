import React, { useState, useEffect, useContext, useMemo } from 'react';
import IconComponent from '../IconComponent';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';
import styles from './DailyChallenge.module.css';
import LoginPanel from '../LoginPanel/LoginPanel.js'
import DailyHistoryPanel from '../DailyHistoryPanel/DailyHistoryPanel.js'


const DailyChallenge = () => {

  const [currentQuestion, setCurrentQuestion] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [question, setQuestion] = useState({ text: '', choices: [], icons: [], tags: [] });
  const [answer, setAnswer] = useState('');
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const [totalQuestionsScore, setTotalQuestionsScore] = useState([0, 0]);
  const [activeQuestion, setActive] = useState(true);
  const [questionCategories, setQuestionCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [previouslyUsedCategories, setPreviouslyUsedCategories] = useState({});
  const { user, setUser } = useContext(UserContext);
  const [currentScore, setCurrentScore] = useState(0);
  const [questionsRemaining, setQuestionsRemaining] = useState(0);
  const [currentUser, setCurrentUser] = useState('');

  const initialContact = async () => {
    try {
      const response = await axios.get('/api/daily-challenge-routes/initial-contact');
      const { todaysScore, questionsRemaining, currentQuestion } = response.data.dcd;
      console.log(response)
      const categories = response.data.categories;
      setQuestionCategories(categories);
      setQuestion(currentQuestion);
      setQuestionsRemaining(questionsRemaining.length + 1);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  useEffect(() => {
    if (user) initialContact();
  }, [user]);

  const assignQuestion = (questionData) => {
    setQuestion(questionData);
  }
  useEffect(() => {
    console.log('question', question)

  }, [question]);

  //Request new question from backend block
  const nextQuestion = async () => {
    try {
      const response = await axios.get('/api/daily-challenge-routes/request-question');
      console.log('response:', response)

      if (response.data.status === "ok") {
        assignQuestion(response.data.question);
        setActive(true);
        setQuestionsRemaining(prevCount => prevCount - 1);
      }
      else if (response.data.status === "out of questions") {
        //TODO: ADD SOMETHING WHEN UUT OF QUESTIONS. MAYBE REMOVE QUESTION PANEL AND ADD RESULT PANEL?
      }
    } catch (error) {
      console.error(error);
    }
  };

  const submitButtonStyle = {
    display: activeQuestion ? 'block' : 'none'
  };

  const nextButtonStyle = {
    display: activeQuestion ? 'none' : 'block'
  };

  const submitAnswer = (e) => {
    setSubmittedAnswer(answer);
  };
  const handleOptionChange = (e) => {
    setAnswer(e.target.value);
  };

  useEffect(() => {
    console.log('Submitted answer:', submittedAnswer);
    if (submittedAnswer != '') {
      axios.post('/api/daily-challenge-routes/submit-answer', { submittedAnswer })
        .then(response => {
          setActive(false);
          console.log('todaysscore:', response.data.todaysScore, 'Correct answer:', response.data.correctAnswer)
          setCurrentScore(response.data.todaysScore);
          setCorrectAnswer(response.data.correctAnswer);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }
  }, [submittedAnswer]);

  const getDivClassName = (option) => {
    if (!activeQuestion) {
      if (submittedAnswer === option) {
        return option === correctAnswer ? (styles.correct) : (styles.incorrect);
      }
      else if (correctAnswer === option) {
        return (styles.correct);
      } else {
        return (styles.neutral);
      }
    }
    else return (styles.neutral);
  };

  useEffect(() => {
    const tempQuestionIcons = question.tags.map(tag => {
      const categoryIcon = questionCategories.find(category => category._id === tag);
      return categoryIcon ? categoryIcon.icon : null;
    }).filter(icon => icon !== null);
    setQuestion(prevQuestion => ({ ...prevQuestion, icons: tempQuestionIcons }));
  }, [questionCategories, question.tags]);

  const memoizedQuestionIcons = useMemo(() => {
    return question.tags.map(tag => {
      const categoryIcon = questionCategories.find(category => category._id === tag);
      return categoryIcon ? categoryIcon.icon : null;
    }).filter(icon => icon !== null);
  }, [question.tags, questionCategories]);


  return (
    <div className={styles.mainBody}>
      {user ? (
        <div className={styles.loggedInPanel}>
          <div className={styles.questionPanel}>
            {question.choices ? (
              <div className={styles.questionBody}>
                <div className={styles.questionText}>
                  {question.text}
                  <div className={styles.tagIcons}>
                    {memoizedQuestionIcons.length > 0 ? (
                      <div>
                        {memoizedQuestionIcons.map((icon, index) => (
                          <div key={index} className={styles.tagIcon}>
                            <IconComponent imageName={icon} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Loading...</p>
                    )}
                  </div>
                </div>
                <div className={styles.radioButtonsDiv}>
                  {question.choices.map((option, index) => (
                    <div key={index} className={getDivClassName(option)}>
                      <label className={styles.radioButtonLabels}>
                        <input
                          type="radio"
                          value={option}
                          checked={answer === option}
                          onChange={handleOptionChange}
                        />
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
                <button onClick={submitAnswer} style={submitButtonStyle} className={styles.submitNextButton} >Submit Answer</button>
                <button onClick={nextQuestion} style={nextButtonStyle} className={styles.submitNextButton}>Next question</button>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
          <DailyHistoryPanel />
        </div>
      ) : (
        <div className={styles.loginPanel}>

          <LoginPanel />

        </div>)}
    </div>
  );
}

export default DailyChallenge;