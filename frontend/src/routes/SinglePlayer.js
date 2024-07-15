import React, { useState, useEffect } from 'react';
import './styles/singlePlayerStyle.css';
import IconComponent from '../components/IconComponent';
import ScorePanel from '../components/ScorePanel';
import axios from 'axios';

const Controller = () => {
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


  useEffect(() => {
    initialContact();
  }, []);

  const initialContact = (e) => {
    axios.get('/api/initialContact')
      .then(response => {
        console.log('Received initial data:', response.data);
        const { question, categories, scoreArray } = response.data;
        assignQuestion(question);
        const newCategories = categories.map(category => ({
          _id: category._id,
          count: category.count,
          icon: category.icon,
          enabled: category.enabled,
        }));
        setQuestionCategories(newCategories);
        if (scoreArray) setScoreArray(scoreArray);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  const submitAnswer = (e) => {
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
  const assignQuestion = (questionData) => {
    setQuestion(questionData);
    setQuestionText(questionData.text);
    setQuestionTags(questionData.tags);

    let choices = questionData.choices;

    setOptions(choices);

  }
  //Request new question from backend block
  const nextQuestion = () => {
    console.log("Next question");
    setPreviouslyUsedCategories(questionCategories);

    axios.get('/api/questionRoutes/requestQuestion')
      .then(response => {
        setActive(true);

        console.log('GET request successful:', response.data);
        assignQuestion(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
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
    console.log('Submitted answer:', submittedAnswer);
    if (submittedAnswer != '') {
      axios.post('/api/questionRoutes/submitAnswer', { submittedAnswer })
        .then(response => {
          setActive(false);
          console.log('ScoreArray:', response.data.scoreArray, 'Correct answer:', response.data.correctAnswer)
          setScoreArray(response.data.scoreArray);
          setCorrectAnswer(response.data.correctAnswer);
          setTotalQuestionsScore(prevCount => {

            if (response.data.correctAnswer === submittedAnswer) prevCount[0] += 1;
            prevCount[1] += 1;
            return prevCount;
          });
        })
        .catch(error => {
          console.error('Error fetching data:', error);
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

  }, [correctAnswer]);

  useEffect(() => {
    if (previouslyUsedCategories.length > 0 && questionCategories.length > 0) {
      axios.post('/api/questionRoutes/getNewQuestionQueueByTags', { questionCategories })
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
                  onChange={() => handleCheckboxChange(category)} />
                {category._id} <IconComponent imageName={category.icon} />
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
        <ScorePanel scoreArray={scoreArray} totalQuestionsScore={totalQuestionsScore} questionCategories={questionCategories} />
      </div>
    </div>
  );
};

export default Controller;
