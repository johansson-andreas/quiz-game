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

  // Calculate positions when pairs are chosen or on render
  useEffect(() => {
    const container = containerRef.current;
    const elements = container.querySelectorAll('.QuestionComponent_connectChoice__ZKNvG');
    const newPositions = {};
    setLeftWidth(elements[0].scrollWidth)
    setRightWIdth(elements[4].scrollWidth)

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
      setAnswer(chosenPairs)
      const handleResizeOrScroll = () => {
        const container = containerRef.current;
        const elements = container.querySelectorAll('.QuestionComponent_connectChoice__ZKNvG');
        const newPositions = {};
        setLeftWidth(elements[0].scrollWidth)
        setRightWIdth(elements[4].scrollWidth)
    
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
        {Object.entries(chosenPairs).map(([key, value]) => {
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
        })}
      </svg>

      <div className={styles.choicesDiv}>
        {question.choices[0].map((e) => {
          const selected = lastSelectedKey === e ? styles.lastSelected : '';
          return (
            <div
              key={e}
              className={classNames(styles.connectChoice, selected)}
              onClick={() => selectKey(e)}
            >
              {e}
            </div>
          );
        })}
      </div>
      <div className={styles.choicesDiv}>
        {question.choices[1].map((e) => {
          const selected = lastSelectedValue === e ? styles.lastSelected : '';
          return (
            <div
              key={e}
              className={classNames(styles.connectChoice, selected)}
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
