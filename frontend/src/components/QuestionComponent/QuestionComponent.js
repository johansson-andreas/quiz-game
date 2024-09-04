import React, { useEffect, useState, useMemo } from "react";
import classNames from "classnames";
import styles from "./QuestionComponent.module.css";
import IconComponent from "../IconComponent";
import { RankQuestion } from "./QuestionTypes/RankQuestionComponent";
import { OneOfThreeQuestion } from "./QuestionTypes/OneOfThreeQuestionComponent";

const QuestionComponent = ({
  question,
  answer,
  questionIcons,
  submitAnswer,
  nextQuestion,
  activeQuestion,
  submittedAnswer,
  correctAnswer,
  hostname,
  isLocked,
  canProgress,
  setAnswer,
}) => {
  const submitButtonStyle = {
    display: hostname ? "block" : activeQuestion ? "block" : "none",
  };

  const nextButtonStyle = {
    display: activeQuestion ? "none" : "block",
  };

  const renderQuestionOptions = useMemo(() => {
    switch (question.questionType) {
      case "oneOfThree":
        console.log('oneofthree')
        return (
          <OneOfThreeQuestion
            question={question}
            setAnswer={setAnswer}
            submittedAnswer={submittedAnswer}
            activeQuestion={activeQuestion}
            correctAnswer={correctAnswer}
            isLocked={isLocked}
            answer={answer}
          />
        );
      case "rank":
        return <RankQuestion question={question} setAnswer={setAnswer} correctAnswer={correctAnswer} answer={answer}/>;
      default:
        return null;
    }
  }, [question.questionType, question.choices, answer, correctAnswer]);


  return (
    <>
      {Object.keys(question).length > 0 && (
        <>
          <div className={styles.questionText}>
            {question.text}
            <div className={styles.tagIcons}>
              {questionIcons &&
                questionIcons.map((index) => (
                  <IconComponent
                    key={index}
                    imageName={index}
                    className={styles.tagIcon}
                  />
                ))}
            </div>
          </div>
          {renderQuestionOptions}

          <button
            onClick={submitAnswer}
            className={styles.submitNextButton}
            style={submitButtonStyle}
            disabled={isLocked}
          >
            Submit Answer
          </button>
          {!hostname && (
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
  questionIcons: [],
};

export default QuestionComponent;
