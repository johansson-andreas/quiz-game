import styles from '../QuestionComponent.module.css'
import classNames from "classnames";


export const OneOfThreeQuestion = ({question, submittedAnswer, activeQuestion, correctAnswer, answer, setAnswer, isLocked}) => {

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

      
    return (
      <div className={styles.radioButtonsDiv}>
        {question.choices &&
          question.choices.map((option, index) => {
            const baseClass = getDivClassName(option);
            const pulseClass = correctAnswer === option ? styles.pulse : "";

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
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={isLocked}
                />
                {option}
              </label>
            );
          })}
      </div>
    );
  };