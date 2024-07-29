import React, { useState, useEffect, useContext, useMemo } from 'react';
import './styles/singlePlayerStyle.css';
import IconComponent from '../components/IconComponent';
import ScorePanel from '../components/ScorePanel';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button'

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
  const [scoreArray, setScoreArray] = useState({});
  const [questionTags, setQuestionTags] = useState([]);
  const { user, setUser } = useContext(UserContext);
  const [catCanvasShow, setCatCanvasShow] = useState(false);
  const [triggeredOption, setTriggeredOption] = useState(null);




  useEffect(() => {
    initialContact();
  }, []);

  const initialContact = () => {
    axios.get('/api/question-routes/initial-contact')
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
    let baseClass = 'neutral';
    if (!activeQuestion) {
      if (submittedAnswer === option) {
        baseClass = option === correctAnswer ? 'correct' : 'incorrect';
      } else if (correctAnswer === option) {
        baseClass = 'correct';
      }
    }
    if (triggeredOption === option) {
      return `${baseClass} pulse`;
    }
    return baseClass;
  };

  useEffect(() => {
    if (triggeredOption !== null) {
      const timeout = setTimeout(() => {
        setTriggeredOption(null);
      }, 1000); // Match the animation duration
      return () => clearTimeout(timeout);
    }
  }, [triggeredOption]);

  const handleOptionChangeWrapper = (event) => {
    handleOptionChange(event);
  };

  const assignQuestion = (questionData) => {
    setQuestion(questionData);
    setQuestionText(questionData.text);
    setQuestionTags(questionData.tags);

    let choices = questionData.choices;

    setOptions(choices);
  };

  const nextQuestion = () => {
    console.log("Next question");

    axios.get('/api/question-routes/request-question')
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

  const handleCatCanvasClose = () => setCatCanvasShow(false);
  const handleCatCanvasShow = () => setCatCanvasShow(true);


  useEffect(() => {
    console.log('Submitted answer:', submittedAnswer);
    if (submittedAnswer !== '') {
      axios.post('/api/question-routes/submit-answer', { submittedAnswer })
        .then(response => {
          setActive(false);
          console.log('ScoreArray:', response.data.scoreArray, 'Correct answer:', response.data.correctAnswer);
          setScoreArray(response.data.scoreArray);
          setCorrectAnswer(response.data.correctAnswer);
          setTotalQuestionsScore(prevCount => {
            const newCount = [...prevCount];
            if (response.data.correctAnswer === submittedAnswer) newCount[0] += 1;
            newCount[1] += 1;
            return newCount;
          });
          setTriggeredOption(response.data.correctAnswer);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }
  }, [submittedAnswer]);

  const memoizedQuestionIcons = useMemo(() => {
    return questionTags.map(tag => {
      const categoryIcon = questionCategories.find(category => category._id === tag);
      return categoryIcon ? categoryIcon.icon : null;
    }).filter(icon => icon !== null);
  }, [questionCategories]);

  useEffect(() => {
    setQuestionIcons(memoizedQuestionIcons);
    console.log('requestion new question queue')
    axios.post('/api/question-routes/get-new-question-queue-by-tags', { questionCategories }).then(response => {
      console.log(response)

    }).catch(error => {
      console.log(error)
    });
  }, [memoizedQuestionIcons]);

  return (
    <div id='mainBody'>
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
                  onChange={handleOptionChangeWrapper}
                />
                {option}
              </label>
            </div>
          ))}
        </div>
        <button onClick={submitAnswer} style={submitButtonStyle} className={"submitNextButton"}>Submit Answer</button>
        <button onClick={nextQuestion} style={nextButtonStyle} className={"submitNextButton"}>Next question</button>
      </div>
      <div className='scoreDiv'>
        <ScorePanel scoreArray={scoreArray} totalQuestionsScore={totalQuestionsScore} questionCategories={questionCategories} />
      </div>
      <div id='categoriesDiv'>
        <Button variant="primary" onClick={handleCatCanvasShow} className='catButton'>
          K
          a
          t
          e
          g
          o
          r
          i
          e
          r
        </Button>
        <Offcanvas show={catCanvasShow} onHide={handleCatCanvasClose} placement='end' className='offcanvas' >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Kategorier</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body >
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
                  ({category.count})

                </label>
              </div>
            ))}
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </div>
  );
};

export default Controller;
