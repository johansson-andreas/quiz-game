import styles from "./gauntlet.module.css";

const QuestionChoice = ({
  questionCategories,
  setPlayerData,
  unusedQuestions,
}) => {
  if (questionCategories) {
    const getRandomAmount = () => Math.floor(Math.random() * 3) + 2;

    const randomizeArrayIndex = (array) =>
      Math.floor(Math.random() * array.length);

    const updateOption = (option, category) => {
      if (!option[category]) {
        option[category] = 1;
      } else {
        option[category] += 1;
      }
    };

    const getQuestionCats = (skewed) => {
      const option = {};
      option.categories = {};
      const questionAmount = getRandomAmount(); // Get a random number between 2 and 4

      // Ensure there are categories available
      if (questionCategories.length === 0) {
        throw new Error("No categories available");
      }

      // Initialize with a random category
      const firstCat =
        questionCategories[randomizeArrayIndex(questionCategories)];
      updateOption(option.categories, firstCat);

      let previousCat = firstCat;

      for (let i = 2; i <= questionAmount; i++) {
        if (skewed) {
          if (Math.random() <= 0.5) {
            // Allocate question to the previous category
            updateOption(option.categories, previousCat);
          } else {
            // Select a new random category
            const newCat =
              questionCategories[randomizeArrayIndex(questionCategories)];
            updateOption(option.categories, newCat);
            previousCat = newCat; // Update previousCat to the new category
          }
        } else {
          // Allocate question to a new random category without skew
          const newCat =
            questionCategories[randomizeArrayIndex(questionCategories)];
          updateOption(option.categories, newCat);
        }
      }

      const questionDifficulties = getQuestionDifficulties(questionAmount);
      console.log(questionDifficulties);
      option.difficulties = questionDifficulties;
      return option;
    };

    const randomDiff = () => {
      const difficulties = ["easy", "medium", "hard"];
      return difficulties[Math.floor(Math.random() * difficulties.length)];
    };

    const getQuestionDifficulties = (questionAmount) => {
      const difficulties = { easy: 0, medium: 0, hard: 0 };
      let lastDifficulty = randomDiff();

      for (let i = 0; i < questionAmount; i++) {
        const chosenDifficulty =
          Math.random() <= 0.3 ? lastDifficulty : randomDiff();
        difficulties[chosenDifficulty] += 1;
        lastDifficulty = chosenDifficulty;
      }

      return difficulties;
    };

    const getQuestionChoice = () => {
      const firstOption = getQuestionCats(true);
      const secondOption = getQuestionCats(false);
      return { firstOption, secondOption };
    };

    const catOptions = getQuestionChoice();
    console.log(catOptions);

    const pickChoice = async (choice) => {
      // Update playerData
      setPlayerData((prevValue) => {
        const newValue = { ...prevValue, currentQuestions: choice };
        return newValue;
      });
    };

    return (
      <div className={styles.questionChoiceMain}>
        {Object.keys(catOptions).map((optionKey) => (
          <label
            key={optionKey}
            onClick={() => pickChoice(catOptions[optionKey])}
            className={styles.categoryChoicesLabel}
          >
            {Object.keys(catOptions[optionKey].categories).map((cat) => (
              <div>
                {cat}: {catOptions[optionKey].categories[cat]}
              </div>
            ))}
            {Object.keys(catOptions[optionKey].difficulties).map((diff) => (
              <div>
                {diff}: {catOptions[optionKey].difficulties[diff]}
              </div>
            ))}
          </label>
        ))}
      </div>
    );
  } else {
    return <>Error</>;
  }
};

export default QuestionChoice;
