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
    const [scoreArray, setScoreArray] = useState({});
    const [questionTags, setQuestionTags] = useState([]);
    const { user, setUser } = useContext(UserContext);


    const initialContact = async () => {
        const response = await axios.get('/api/daily-challenge-routes/initial-contact')
        console.log(response);
        const newQuestion = await axios.get('/api/daily-challenge-routes/request-question')
        assignQuestion(newQuestion.data)
    };

    useEffect(() => {
        initialContact();
    }, []);

    const assignQuestion = (questionData) => {
        console.log(questionData)
        setQuestion(questionData);
        setQuestionText(questionData.text);
        setQuestionTags(questionData.tags);
    
        let choices = questionData.choices;
    
        setOptions(choices);
    }



    //Request new question from backend block
    const nextQuestion = () => {

    };

    const submitButtonStyle = {
        display: activeQuestion ? 'block' : 'none'
    };

    const nextButtonStyle = {
        display: activeQuestion ? 'none' : 'block'
    };

    const handleCheckboxChange = (category) => {
        setQuestionCategories(prevCategories =>
            prevCategories.map(cat =>
                cat._id === category._id
                    ? { ...cat, enabled: !cat.enabled }
                    : cat
            )
        );
    };

    useEffect(() => {

    }, [correctAnswer]);

    const submitAnswer = (e) => {
        console.log(user)
        setSubmittedAnswer(answer);
    };
    const handleOptionChange = (e) => {
        setAnswer(e.target.value);
    };

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