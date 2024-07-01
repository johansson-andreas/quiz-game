import React, { useState, useEffect } from 'react';
import socket from './Socket';
import './style.css';
import { useLocation } from 'react-router-dom';
import IconComponent from './IconComponent';

const Controller = () => {
  const [question, setQuestion] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [options, setOptions] = useState([]);
  const [answer, setAnswer] = useState('');
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const [correctAnswers, addCorrectAnswer] = useState(0);
  const [totalQuestions, addTotalQuestion] = useState(0);
  const [activeQuestion, setActive] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...'); // State to hold connection status
  const [inputText, setInputText] = useState('');
  const location = useLocation();
  const [questionCategories, setQuestionCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [previouslyUsedCategories, setPreviouslyUsedCategories] = useState([]);

  


  useEffect(() => {
    
    socket.emit('initialContact');
    console.log("Initial contact")

    socket.on('connect', () => {
      console.log('Socket.IO connect to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Event listener for connection error
    socket.on('connect_error', (error) => {
      setConnectionStatus(`Connection error: ${error.message}`);
    });

    socket.on('questionCategories', (questionSet) => {
      const newCategories = questionSet.map(category => ({
        name: category._id,
        count: category.count,
        icon: category.icon,
        enabled: true,
      }));
      setPreviouslyUsedCategories(questionSet.map(category => [...category._id]));
      setQuestionCategories(newCategories);
    });


    // Handle custom events from server
    socket.on('newQuestion', (questionData) => {
      setSubmittedAnswer('');

      console.log('Received new question:', questionData);
      // Example: Update UI to display the new question
      setQuestion(questionData.text);
      setCorrectAnswer(questionData.correctAnswer);
      const allOptions = [
        ...questionData.incorrectAnswers,
      ];
      allOptions.push(questionData.correctAnswer);

      for (let i = allOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
      }
      setOptions(allOptions);
    });

    socket.on('answerReceived', (answer) => {
      console.log('Answer received:', answer);
      // Example: Process received answer
    });

    return () => {
      socket.off('newQuestion');
    };
  }, []);

  useEffect(() => {
    if (location.state && location.state.choice) {
      setInputText(location.state.choice);
    }
  }, []);

  const submitAnswer = (e) => {
    e.preventDefault();
    setSubmittedAnswer(answer);
    console.log('Submitted answer:', answer);
    // Here you would emit the answer to the server, or handle it as needed
    if(answer === correctAnswer) addCorrectAnswer(prevCount => prevCount + 1);
    addTotalQuestion(prevCount => prevCount + 1);
    console.log('correctAnswer:', correctAnswer);
    socket.emit('sendAnswer', answer);
    setActive(false);
  };
  const handleOptionChange = (e) => {
    setAnswer(e.target.value);
  };

  const getDivClassName = (option) => {
    if (submittedAnswer === option) {
      return option === correctAnswer ? 'correct' : 'incorrect';
    }
    else if (submittedAnswer !== '' && correctAnswer === option) {
      return 'correct';
    } else {
      return 'neutral';
    }
  };

  const nextQuestion = () => {
    console.log("Next question");
    setActive(true);
    socket.emit('nextQuestion');
    setPreviouslyUsedCategories(activeCategories);
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
        cat.name === category.name
          ? { ...cat, enabled: !cat.enabled }
          : cat
      )
    );
  };

  useEffect(() => {
    let newActiveCategories = questionCategories.map(category => {
      if (category.enabled) {
        return category.name;
      }
      return null; // Handle disabled categories or return undefined if needed
    }).filter(name => name !== null);
    setActiveCategories(newActiveCategories);
  }, [questionCategories]);


  useEffect(() => {
    if(activeCategories.length > 0){
      socket.emit('fetchQuestionsByTags', activeCategories)
      console.log(activeCategories);
    }
  }, [activeCategories]); 
  return (
    <div id='mainBody'>
      <div id='categoriesDiv'>
      {questionCategories.map((category, index) => (
        <div key={index}>
          <label className='checkboxLabels'><input 
            type="checkbox" 
            defaultChecked={category.enabled} 
            onChange={() => handleCheckboxChange(category)}/> 
            {category.name} ({category.count}) <IconComponent imageName={category.icon}/>
            </label>
        </div>
      ))}
      </div>
      <div id='questionBody'>
      <p id='questionText'>{question}</p>
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
      <p id='answerTally'>Correct answers: {correctAnswers} / Total questions: {totalQuestions} </p>
      </div>
  </div>
  );
};

export default Controller;
