import React, { useState, useEffect, useMemo} from 'react';
import socket from './Socket';
import './style.css';
import { useLocation } from 'react-router-dom';
import IconComponent from './IconComponent';

const Controller = () => {
  const [questionText, setQuestionText] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [questionIcons, setQuestionIcons] = useState([]);
  const [question, setQuestion] = useState([]);
  const [options, setOptions] = useState([]);
  const [answer, setAnswer] = useState('');
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const [correctAnswers, addCorrectAnswer] = useState(0);
  const [totalQuestions, addTotalQuestion] = useState(0);
  const [activeQuestion, setActive] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...'); // State to hold connection status
  const location = useLocation();
  const [questionCategories, setQuestionCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [previouslyUsedCategories, setPreviouslyUsedCategories] = useState([]);
  const [inputText, setInputText] = useState('');
  const [scoreArray, setScoreArray] = useState({});

  


  useEffect(() => {
    
    socket.emit('initialContact');
    console.log("Initial contact");
    setAnswer('default');

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
      setQuestion(questionData);
      setQuestionText(questionData.text);
      setCorrectAnswer(questionData.correctAnswer);

     // Process questionData tags only after questionCategories state is updated
      setQuestionCategories(prevCategories => {
        let questionIcons = [];
        questionData.tags.forEach(tag => {
          const categoryIcon = prevCategories.find(category => category.name === tag);
          if (categoryIcon) {
            console.log("Found category");
            questionIcons.push(categoryIcon.icon);
          }
        });
        setQuestionIcons(questionIcons);
        return prevCategories;
      });
    

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

    question.tags.forEach(tag => {
      setScoreArray(prevScoreArray => {
        // Create a shallow copy of the previous state
        const newScoreArray = { ...prevScoreArray };
    
        // Increment the score for the current tag
        newScoreArray[tag] = (newScoreArray[tag] || 0) + 1;
    
        // Return the updated state
        return newScoreArray;
      });
    });

    console.log(scoreArray);
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


  const scoreArrayEntries = useMemo(() => Object.entries(scoreArray), [scoreArray]);

  // Function to chunk the array into groups of three
  const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const groupedEntries = useMemo(() => chunkArray(scoreArrayEntries, 3), [scoreArrayEntries]);


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
          <label className='checkboxLabels'>
            <div className='topLineCheckbox'>
            <input 
            type="checkbox" 
            defaultChecked={category.enabled} 
            onChange={() => handleCheckboxChange(category)}/> 
            {category.name} <IconComponent imageName={category.icon}/>
            </div>
            <div className='catCountDiv'>({category.count})</div>
            </label>
        </div>
      ))}
      </div>
      <div id='questionBody'> 
        <div id='questionText'>
          {questionText} 
          <div id='tagIcons'>
            {questionIcons.map((index) => (
              <div key={index} className="tagIcon">
                <IconComponent imageName={index}/>    
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
        <div id="scorePanel">
          <p id='answerTally'>Correct answers: {correctAnswers} / Total questions: {totalQuestions} </p>
          <div id="scoreCatPanel">
              {groupedEntries.length > 0 ? (
                groupedEntries.map((group, index) => (
                  <div key={index}>
                    {group.map(([cat, count]) => (
                      <div key={cat}>
                        {cat}: {count}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div>No scores available</div>
              )}
          </div>
        </div>
      </div>
  </div>
  );
};

export default Controller;
