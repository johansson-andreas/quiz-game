import { useState, useEffect, useRef } from 'react';
import styles from '../QuestionComponent.module.css';
import classNames from 'classnames';

export const ConnectQuestion = ({
  question,
  submittedAnswer,
  activeQuestion,
  correctAnswer,
  answer,
  setAnswer,
  isLocked,
}) => {
  const [lastSelectedKey, setLastSelectedKey] = useState('');
  const [lastSelectedValue, setLastSelectedValue] = useState('');
  const [chosenPairs, setChosenPairs] = useState({});
  const [correctPairs, setCorrectPairs] = useState({})
  const [positions, setPositions] = useState({}); 
  const [leftWidth, setLeftWidth] = useState(0)
  const [rightWidth, setRightWIdth] = useState(0)

  const containerRef = useRef(null);

  const selectKey = (e) => {
    if (!lastSelectedValue) setLastSelectedKey(e);
    else {
      setChosenPairs((prevValue) => {
        const newValue = { ...prevValue };
        Object.keys(newValue).forEach((key) => {
          if (newValue[key] === lastSelectedValue) {
            delete newValue[key];
          }
        });
        newValue[e] = lastSelectedValue;
        return newValue;
      });
      setLastSelectedValue('');
    }
  };

  const selectValue = (e) => {
    if (!lastSelectedKey) setLastSelectedValue(e);
    else {
      setChosenPairs((prevValue) => {
        const newValue = { ...prevValue };
        Object.keys(newValue).forEach((key) => {
          if (newValue[key] === e) {
            delete newValue[key];
          }
        });
        newValue[lastSelectedKey] = e;
        return newValue;
      });
      setLastSelectedKey('');
    }
  };

  useEffect(() => {
    setCorrectPairs(correctAnswer)

  }, [correctAnswer])

  useEffect(() => {
    setChosenPairs({})
    setCorrectPairs({})
    setPositions({})

  }, [question])

  const getKeyByValue = (object, value) => {
    return Object.keys(object).find(key => object[key] === value);
  }

  const getDivClassNameValues = (option) => {
    let baseClass = [];
    if (!activeQuestion && Object.keys(correctAnswer).length > 0) {
      baseClass[0] = "neutral";
      baseClass[1] = "nopulse";
      {
        if (getKeyByValue(correctAnswer, option) == getKeyByValue(chosenPairs, option)) {
          baseClass[0] = "correct"
          baseClass[1] = "pulse"

        } else if (getKeyByValue(correctAnswer, option) != getKeyByValue(chosenPairs, option)) {
          baseClass[0] = "incorrect";
          baseClass[1] = "nopulse"

        }
      }
    } else {
      baseClass[0] = "neutral";
      baseClass[1] = "nopulse";
    }
    return baseClass;
  };

  const getDivClassNameKeys = (option) => {
    let baseClass = [];
    if (!activeQuestion && Object.keys(correctAnswer).length > 0) {
      baseClass[0] = "neutral";
      baseClass[1] = "nopulse";
      {
        if (correctAnswer[option] == chosenPairs[option]) {
          baseClass[0] = "correct"
          baseClass[1] = "pulse"

        } else if (correctAnswer[option] != chosenPairs[option]) {
          baseClass[0] = "incorrect";
          baseClass[1] = "nopulse"

        }
      }
    } else {
      baseClass[0] = "neutral";
      baseClass[1] = "nopulse";
    }
    return baseClass;
  };

  // Calculate positions when pairs are chosen or on render
  useEffect(() => {
    const container = containerRef.current;
    const elements = container.querySelectorAll('.QuestionComponent_connectChoice__ZKNvG');
    const newPositions = {};
    setLeftWidth(elements[0].scrollWidth)
    setRightWIdth(elements[(elements.length/2)].scrollWidth)

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      newPositions[el.innerText] = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    });
    setPositions(newPositions);
  }, [chosenPairs, question]);

  // Add event listeners to handle window resize and scroll
  useEffect(() => {
    if((question.choices) && Object.keys(chosenPairs).length == question.choices[0].length) {
      setAnswer(chosenPairs);
    }
    const handleResizeOrScroll = () => {
      const container = containerRef.current;
      const elements = container.querySelectorAll('.QuestionComponent_connectChoice__ZKNvG');
      const newPositions = {};
      setLeftWidth(elements[0].scrollWidth)
      setRightWIdth(elements[(elements.length/2)].scrollWidth)
  
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        newPositions[el.innerText] = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      });
      setPositions(newPositions);
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll);
    };
  }, [chosenPairs]); // Recalculate lines when chosenPairs changes
  

  return (
    <div className={styles.connectQuestionMain} ref={containerRef}>
      {/* Render SVG lines */}
      <svg className={styles.svgOverlay} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {activeQuestion ? ( Object.entries(chosenPairs).map(([key, value]) => {
          const startPos = positions[key];
          const endPos = positions[value];
          if (startPos && endPos) {
            return (
              <line

                key={`${key}-${value}`}
                x1={startPos.x+(leftWidth/2)}
                y1={startPos.y}
                x2={endPos.x-(rightWidth/2)}
                y2={endPos.y}
                stroke="black"
                strokeWidth="2"
              />
            );
          }
          return null;
        }) ): (
          Object.entries(correctPairs).map(([key, value]) => {
          const startPos = positions[key];
          const endPos = positions[value];
          if (startPos && endPos) {
            return (
              <line

                key={`${key}-${value}`}
                x1={startPos.x+(leftWidth/2-2)}
                y1={startPos.y}
                x2={endPos.x-(rightWidth/2-2)}
                y2={endPos.y}
                stroke="black"
                strokeWidth="2"
              />
            );
          }
          return null;
        }) )}
      </svg>

      <div className={styles.choicesDiv}>
        {question.choices[0].map((e) => {
                    let baseClass = getDivClassNameKeys(e)

          const selected = lastSelectedKey === e ? styles.lastSelected : '';
          return (
            <div
              key={e}
              className={classNames(styles.connectChoice, 
                selected,                 
                styles[baseClass[0]],
                styles[baseClass[1]])}
              onClick={() => selectKey(e)}
            >
              {e}
            </div>
          );
        })}
      </div>
      <div className={styles.choicesDiv}>
        {question.choices[1].map((e) => {
          let baseClass = getDivClassNameValues(e)
          const selected = lastSelectedValue === e ? styles.lastSelected : '';
          
          return (
            <div
              key={e}
              className={classNames(styles.connectChoice, 
                selected,  
                styles[baseClass[0]],
                styles[baseClass[1]])}
              onClick={() => selectValue(e)}
            >
              {e}
            </div>
          );
        })}
      </div>
    </div>
  );
};
