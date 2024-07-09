import React, { useState, useEffect} from 'react';
import socket from '../components/Socket';
import './style.css';
import IconComponent from '../components/IconComponent';
import ScorePanel from '../components/ScorePanel';

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
  const [questionCategories, setQuestionCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [previouslyUsedCategories, setPreviouslyUsedCategories] = useState({});
  const [scoreArray, setScoreArray] = useState({});
  const [questionTags, setQuestionTags] = useState([]);

  

  //Socket.IO receive block
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

    socket.on('questionCategories', (questionSet) => {
      const newCategories = questionSet.map(category => ({
        _id: category._id,
        count: category.count,
        icon: category.icon,
        enabled: category.enabled,
      }));
      console.log('Received categories: ', newCategories)
      setQuestionCategories(newCategories);
    });


    socket.on('newQuestion', (questionData) => {
      console.log('Received new question:', questionData);

      setQuestion(questionData);
      setQuestionText(questionData.text);
      setCorrectAnswer(questionData.correctAnswer);
      setQuestionTags(questionData.tags);

      let choices = questionData.choices;

      for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
      }
      setOptions(choices);
      

    });

    socket.on('answerReceived', (answer) => {
      console.log('Answer received:', answer);
    });

    return () => {
      socket.off('newQuestion');
    };
  }, []);

  //submitAnswer to backend block
  const submitAnswer = (e) => {
    e.preventDefault();
    setSubmittedAnswer(answer);
    setActive(false);

  };
  const handleOptionChange = (e) => {
    setAnswer(e.target.value);
  };

  const getDivClassName = (option) => {
    if(!activeQuestion)
      {
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

    //Request new question from backend block
  const nextQuestion = () => {
    console.log("Next question");
    setActive(true);    
    setSubmittedAnswer('');
    socket.emit('nextQuestion');
    setPreviouslyUsedCategories(questionCategories);
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

  /*
  useEffect(() => {
    let newActiveCategories = questionCategories.map(category => {
      if (category.enabled) {
        return category.name;
      }
      return null; 
    }).filter(name => name !== null);
    setActiveCategories(newActiveCategories);
  }, [questionCategories]);

 */
  useEffect(() => {
    console.log('Submitted answer:', submittedAnswer);
    console.log('correctAnswer:', correctAnswer);
    if(submittedAnswer != '')
      {
        socket.emit('sendAnswer', answer);
        setScoreArray(prevScoreArray => {
          const newScoreArray = { ...prevScoreArray };
      
          questionTags.forEach(tag => {
            if (!newScoreArray[tag]) {
              console.log("No score found for ", tag, ". Creating new key for it")
              newScoreArray[tag] = [0, 0];
            }
            if (submittedAnswer === correctAnswer) {
              newScoreArray[tag][0] += 1;
            }
            newScoreArray[tag][1] += 1;
          });
      
          return newScoreArray;
        });
      
        setTotalQuestionsScore(prevCount => {
          const newCountArray = { ...prevCount };
      
          if (submittedAnswer === correctAnswer) newCountArray[0] = newCountArray[0] + 1;
          newCountArray[1] = newCountArray[1] + 1;
      
          return newCountArray;
        });
      }
  }, [submittedAnswer]);

  useEffect(() => {
    const tempQuestionIcons = questionTags.map(tag => {
      const categoryIcon = questionCategories.find(category => category._id === tag);
      return categoryIcon ? categoryIcon.icon : null;
    }).filter(icon => icon !== null);
    
    setQuestionIcons(tempQuestionIcons);

  }, [questionCategories, questionTags]); 



  useEffect(() => {
    if(previouslyUsedCategories.length > 0 && questionCategories.length > 0){
      socket.emit('fetchQuestionsByTags', questionCategories)
      console.log(questionCategories);
    }
    setPreviouslyUsedCategories(questionCategories)

  }, [questionCategories]); 

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
            {category._id} <IconComponent imageName={category.icon}/>
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
          <ScorePanel scoreArray={scoreArray} totalQuestionsScore={totalQuestionsScore} questionCategories={questionCategories}/>
      </div>
  </div>
  );
};

export default Controller;
