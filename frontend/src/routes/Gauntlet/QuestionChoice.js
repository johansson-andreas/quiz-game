const QuestionChoice = ({ questionCategories, setPlayerData }) => {
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
      const questionAmount = getRandomAmount(); // Get a random number between 2 and 4

      // Ensure there are categories available
      if (questionCategories.length === 0) {
        throw new Error("No categories available");
      }

      // Initialize with a random category
      const firstCat =
        questionCategories[randomizeArrayIndex(questionCategories)];
      updateOption(option, firstCat);

      let previousCat = firstCat;

      for (let i = 2; i <= questionAmount; i++) {
        if (skewed) {
          if (Math.random() <= 0.5) {
            // Allocate question to the previous category
            updateOption(option, previousCat);
          } else {
            // Select a new random category
            const newCat =
              questionCategories[randomizeArrayIndex(questionCategories)];
            updateOption(option, newCat);
            previousCat = newCat; // Update previousCat to the new category
          }
        } else {
          // Allocate question to a new random category without skew
          const newCat =
            questionCategories[randomizeArrayIndex(questionCategories)];
          updateOption(option, newCat);
        }
      }

      return option;
    };

    const getQuestionChoice = () => {
      const firstOption = getQuestionCats(true);
      const secondOption = getQuestionCats(false);
      console.log({ firstOption, secondOption });
      return { firstOption, secondOption };
    };

    const catOptions = getQuestionChoice();

    const pickChoice = (choice) => {
      setPlayerData(prevValue => {
        const newValue = {...prevValue}
        newValue.currentQuestions = choice
        return newValue;
      })
    };

    return (
      <div>
        {Object.keys(catOptions).map((optionKey) => (
          <div key={optionKey}>
            <label onClick={() => pickChoice(catOptions[optionKey])}>
              {optionKey}
              {Object.keys(catOptions[optionKey]).map((cat) => (
                <div key={cat}>
                  {cat}: {catOptions[optionKey][cat]}
                </div>
              ))}
            </label>
          </div>
        ))}
      </div>
    );
  } else {
    return <>Error</>;
  }
};

export default QuestionChoice;
