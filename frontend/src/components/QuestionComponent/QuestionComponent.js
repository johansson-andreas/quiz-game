import React, { useEffect, useState } from "react";
import classNames from "classnames";
import styles from "./QuestionComponent.module.css";
import IconComponent from "../IconComponent";


const QuestionComponent = ({
  question,
  handleOptionChangeWrapper,
  answer,
  questionIcons,
  submitAnswer,
  nextQuestion,
  activeQuestion,
  submittedAnswer,
  correctAnswer,
  triggeredOption,
  setTriggeredOption,
  hostname,
  username,
  isLocked,
  canProgress,
}) => {

  const getDivClassName = (option) => {
    let baseClass = "neutral";
    if (!activeQuestion) {
      if (submittedAnswer === option) {
        baseClass = option === correctAnswer ? "correct" : "incorrect";
      } else if (correctAnswer === option) {
        baseClass = "correct";
      }
    }

    return baseClass;
  };

  const submitButtonStyle = {
    display: hostname ? "block" : activeQuestion ? "block" : "none"
  }

  const nextButtonStyle = {
    display: activeQuestion ? "none" : "block",
  };

  useEffect(() => {
    if (triggeredOption !== null) {
      const timeout = setTimeout(() => {
        setTriggeredOption(null);
      }, 1000); // Duration for the pulse effect
      return () => clearTimeout(timeout);
    }
  }, [triggeredOption]);

  return (
    <>
      {Object.keys(question).length > 0 && (
        <>
          <div className={styles.questionText}>
            {question.text}
            <div className={styles.tagIcons}>
              {questionIcons && questionIcons.map((index) => (
                <IconComponent
                  key={index}
                  imageName={index}
                  className={styles.tagIcon}
                />
              ))}
            </div>
          </div>
          <div className={styles.radioButtonsDiv}>
            {question.choices &&
              question.choices.map((option, index) => {
                const baseClass = getDivClassName(option);
                const pulseClass =
                  triggeredOption === option ? styles.pulse : "";

                return (
                  <label
                    key={index}
                    className={classNames(
                      styles.radioButtonLabels,
                      styles[baseClass], 
                      pulseClass // Apply pulse effect conditionally
                    )}
                  >
                    <input
                      type="radio"
                      value={option}
                      checked={answer === option}
                      onChange={handleOptionChangeWrapper}
                      disabled={isLocked}
                    />
                    {option}
                  </label>
                );
              })}
          </div>
          <button
            onClick={submitAnswer}
            className={styles.submitNextButton}
            style={submitButtonStyle}
            disabled={isLocked}
          >
            Submit Answer
          </button>
          {(!hostname) && (
            <button
              onClick={nextQuestion}
              style={nextButtonStyle}
              className={styles.submitNextButton}
              disabled={!canProgress}
            >
              Next question
            </button>
          )}
        </>
      )}
    </>
  );
};

QuestionComponent.defaultProps = {
  hostname: "",
  username: "",
  isLocked: false,
  canProgress: true,
  questionIcons: []
};

export default QuestionComponent;