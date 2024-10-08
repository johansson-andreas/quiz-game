import React, { useEffect, useState, useMemo } from "react";
import classNames from "classnames";
import styles from "./QuestionComponent.module.css";
import IconComponent from "../IconComponent";
import { RankQuestion } from "./QuestionTypes/RankQuestionComponent";
import { OneOfThreeQuestion } from "./QuestionTypes/OneOfThreeQuestionComponent";
import { ConnectQuestion } from "./QuestionTypes/ConnectQuestionComponent";

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
        return (
          <RankQuestion
            question={question}
            setAnswer={setAnswer}
            correctAnswer={correctAnswer}
            answer={answer}
          />
        );

      case "connect":
        return (
          <ConnectQuestion
            question={question}
            setAnswer={setAnswer}
            correctAnswer={correctAnswer}
            answer={answer}
            activeQuestion={activeQuestion}
          />
        );
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
            Svara
          </button>
          {!hostname && (
            <button
              onClick={nextQuestion}
              style={nextButtonStyle}
              className={styles.submitNextButton}
              disabled={!canProgress}
            >
              Nästa fråga
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
