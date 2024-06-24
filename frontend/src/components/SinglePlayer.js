import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './style.css';
import { useLocation } from 'react-router-dom';

const socket = io('localhost:4000', {
  transports: ['websocket'], 
  withCredentials: true
}); 

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
  const [savedText, setSavedText] = useState('');
  const [data, setData] = useState(null);
  const location = useLocation();
  const [questionCategories, setQuestionCategories] = useState([]);

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
      const newCategories = questionSet.map(([categoryName, numberOfQuestions]) => ({
        categoryName,
        numberOfQuestions,
        enabled: true,
      }));
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
    console.log("Next question")
    setActive(true);
    socket.emit('nextQuestion');

  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSave = () => {
    setSavedText(inputText);
  };
  const handleEnableChange = () => {
    //TODO: CHECKBOX LOGIC
    setQuestionCategories(inputText);
  };

  const submitButtonStyle = {
    display: activeQuestion ? 'block' : 'none'
  };
  
  const nextButtonStyle = {
    display: activeQuestion ? 'none' : 'block'
  };

  return (
    <div>
      <p>{question}</p>
          {options.map((option, index) => (
            <div key={index} className={getDivClassName(option)}>
              <label>
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
          <button onClick={submitAnswer} style={submitButtonStyle}>Submit Answer</button>
          <button onClick={nextQuestion} style={nextButtonStyle}>Next question</button>    
      <p>Correct answers: {correctAnswers} / Total questions: {totalQuestions} </p>

      {questionCategories.map((category, index) => (
        <div key={index}>
          <input type="checkbox" checked={category.enabled} onChange={handleEnableChange(category)}/> {category.categoryName} ({category.numberOfQuestions})
        </div>
      ))}
  </div>
  );
};

export default Controller;
