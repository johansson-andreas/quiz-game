import React, { useState, useEffect, useContext } from 'react';
import IconComponent from '../IconComponent';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';

const DailyChallenge = () => {

    const [currentQuestion, setCurrentQuestion] = useState([]);
    const [questionText, setQuestionText] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [questionIcons, setQuestionIcons] = useState([]);
    const [question, setQuestion] = useState([]);
    const [options, setOptions] = useState([]);
    const [answer, setAnswer] = useState('');
    const [submittedAnswer, setSubmittedAnswer] = useState('');
    const [totalQuestionsScore, setTotalQuestionsScore] = useState([0, 0]);
    const [activeQuestion, setActive] = useState(true);
    const [questionCategories, setQuestionCategories] = useState([]);
    const [activeCategories, setActiveCategories] = useState([]);
    const [previouslyUsedCategories, setPreviouslyUsedCategories] = useState({});
    const [questionTags, setQuestionTags] = useState([]);
    const { user, setUser } = useContext(UserContext);
    const [currentScore, setCurrentScore] = useState(0);
    const [questionsRemaining, setQuestionsRemaining] = useState(0);
    const [currentUser, setCurrentUser] = useState('');

    const initialContact = async () => {
        const response = await axios.get('/api/daily-challenge-routes/initial-contact')
        const dailyChallengeData = response.data.dcd;
        setCurrentScore(dailyChallengeData.todaysScore)
        setQuestionsRemaining(dailyChallengeData.questionsRemaining.length + 1)
        setQuestionCategories(response.data.categories)
        assignQuestion(dailyChallengeData.currentQuestion)
    };  
    useEffect(() => {
    initialContact();
    }, [user]);

    useEffect(() => {
      const tempQuestionIcons = questionTags.map(tag => {
        const categoryIcon = questionCategories.find(category => category._id === tag);
        return categoryIcon ? categoryIcon.icon : null;
      }).filter(icon => icon !== null);
  
      setQuestionIcons(tempQuestionIcons);
  
    }, [questionCategories, questionTags]);

    const assignQuestion = (questionData) => {
        console.log(questionData)
        setQuestion(questionData);
        setQuestionText(questionData.text);
        setQuestionTags(questionData.tags);
        setOptions(questionData.choices);
    }

    //Request new question from backend block
    const nextQuestion = async () => {
      try {
        const response = await axios.get('/api/daily-challenge-routes/request-question');

        
        assignQuestion(response.data);
        setActive(true);
        setQuestionsRemaining(prevCount => prevCount - 1); 
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
                return option === correctAnswer ? 'correct' : 'incorrect';
            }
            else if (correctAnswer === option) {
                return 'correct';
            } else {
                return 'neutral';
            }
        }
        else return 'neutral';
    };


    return (
        <div className='questionBody'>
          CS: {currentScore} QR: {questionsRemaining}
        <div className='questionText'>
          {questionText}
          <div id='tagIcons'>
            {questionIcons.map((index) => (
              <div key={index} className="tagIcon">
                <IconComponent imageName={index} />
              </div>
            ))}
          </div>
        </div>
        <div id='radioButtonsDiv'>
          {options.map((option, index) => (
            <div key={index} className={getDivClassName(option)}>
              <label className='radioButtonLabels'>
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
        <button onClick={submitAnswer} style={submitButtonStyle} className={"submitNextButton"}>Submit Answer</button>
        <button onClick={nextQuestion} style={nextButtonStyle} className={"submitNextButton"}>Next question</button>
      </div>
      );
}

export default DailyChallenge;