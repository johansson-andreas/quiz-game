import React, { useState, useEffect, useMemo} from 'react';
import socket from './Socket';
import './style.css';
import { useLocation } from 'react-router-dom';
import IconComponent from './IconComponent';
import ScorePanel from './ScorePanel';

const Controller = () => {
  const [questionText, setQuestionText] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [questionIcons, setQuestionIcons] = useState([]);
  const [question, setQuestion] = useState([]);
  const [options, setOptions] = useState([]);
  const [answer, setAnswer] = useState('');
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const [totalQuestionsScore, setTotalQuestionsScore] = useState([0,0]);
  const [activeQuestion, setActive] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...'); // State to hold connection status
  const location = useLocation();
  const [questionCategories, setQuestionCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [previouslyUsedCategories, setPreviouslyUsedCategories] = useState([]);
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


    socket.on('newQuestion', (questionData) => {
      setSubmittedAnswer('');

      console.log('Received new question:', questionData);
      setQuestion(questionData);
      setQuestionText(questionData.text);
      setCorrectAnswer(questionData.correctAnswer);

      setQuestionCategories(prevCategories => {
        let questionIcons = [];
        questionData.tags.forEach(tag => {
          const categoryIcon = prevCategories.find(category => category.name === tag);
          if (categoryIcon) {
            console.log("Found category");
            questionIcons.push(categoryIcon.icon);
            console.log(questionIcons.length)
          };
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
    });

    return () => {
      socket.off('newQuestion');
    };
  }, []);


  const submitAnswer = (e) => {
    e.preventDefault();
    setSubmittedAnswer(answer);
    console.log('Submitted answer:', submittedAnswer);

    setTotalQuestionsScore(prevCount => {
      const newCountArray = {...prevCount};

      if(submittedAnswer === correctAnswer)newCountArray[0] = newCountArray[0] + 1;
      newCountArray[1] = newCountArray[1] + 1;

      return newCountArray
    });


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
    setScoreArray(prevScoreArray => {

      if (!question || !Array.isArray(question.tags)) {
        console.error("question or question.tags is not defined correctly");
        return prevScoreArray; 
      }

      const newScoreArray = { ...prevScoreArray };
  
      question.tags.forEach(tag => {
        if (!newScoreArray[tag]) {
          newScoreArray[tag] = [0, 0];
        }
        if (submittedAnswer === correctAnswer) {
          newScoreArray[tag][0] = newScoreArray[tag][0] + 1;
        }
        newScoreArray[tag][1] = newScoreArray[tag][1] + 1;
      });
  
      return newScoreArray;
    });
  }, [submittedAnswer]);

  useEffect(() => {
    let newActiveCategories = questionCategories.map(category => {
      if (category.enabled) {
        return category.name;
      }
      return null; 
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
      <div className='questionBody'> 
        <div className='questionText'>
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
          <ScorePanel scoreArray={scoreArray} totalQuestionsScore={totalQuestionsScore}/>
      </div>
  </div>
  );
};

export default Controller;
