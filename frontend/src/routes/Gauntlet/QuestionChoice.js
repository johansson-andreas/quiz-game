import IconComponent from "../../components/IconComponent";
import styles from "./gauntlet.module.css";

const QuestionChoice = ({
  questionCategories,
  setPlayerData,
  unusedQuestions,
  playerData
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
      const bonuses = generateBonuses(questionDifficulties)
      

      option.difficulties = questionDifficulties;
      option.bonuses = bonuses;
      return option;
    };

    const randomDiff = () => {
      const difficulties = ["Easy", "Medium", "Hard"];
      return ["Easy", "Medium", "Hard"][Math.floor(Math.random() * difficulties.length)];
    };

    const getQuestionDifficulties = (questionAmount) => {
      const difficulties = { Easy: 0, Medium: 0, Hard: 0 };
      let lastDifficulty = randomDiff();

      for (let i = 0; i < questionAmount; i++) {
        const chosenDifficulty =
          Math.random() <= 0.3 ? lastDifficulty : randomDiff();
        difficulties[chosenDifficulty] += 1;
        lastDifficulty = chosenDifficulty;
      }

      return difficulties;
    };

    const generateBonuses = (difficulties) => {

      const bonusScore = Object.keys(difficulties).reduce((acc, diff) => {
        let score = 0;
        switch (diff) {
          case "Easy": {
            score = 10;
            break;
          }
          case "Medium": {
            score = 15;
            break;
          }
          case "Hard": {
            score = 25;
            break;
          }
        }
        return (acc += difficulties[diff] * score), acc;
      }, 0);
      const roll = Math.random();
      const rollToBeat = (bonusScore / 100) / 2
      if(roll < rollToBeat) {
        let potBonus = [];
        Object.keys(playerData.lifelines).map(lifeline => {
          if(playerData.lifelines[lifeline] < 3) potBonus.push(lifeline);
        })
        if(playerData.lives < 5) potBonus.push("lives")

        return (potBonus[randomizeArrayIndex(potBonus)]);
      }
      return null;

    };

    const getQuestionChoice = () => {
      const firstOption = getQuestionCats(true);
      const secondOption = getQuestionCats(false);
      return { firstOption, secondOption };
    };

    const catOptions = getQuestionChoice();

const pickChoice = async (choice) => {
  setPlayerData((prevValue) => {
    // Create a copy of the previous value
    const newValue = { ...prevValue, currentQuestions: choice };

    // Handle bonuses
    if (choice.bonuses) {
      switch (choice.bonuses) {
        case "fifty":
          newValue.lifelines["fifty"]++;
          break;
        case "skip":
          newValue.lifelines["skip"]++;
          break;
        case "lives":
          newValue.lives++;
          break;
      }
    }

    return newValue;
  });
};

    const diffName = (diff) => {
      switch (diff) {
        case "Hard": return "Svår";
        case "Medium": return "Medel";
        case "Easy": return "Lätt";
        default: return "Error";
      }
    }

    return (
      <div className={styles.questionChoiceMain}>
        {Object.keys(catOptions).map((optionKey) => (
          <label
            key={optionKey}
            onClick={() => pickChoice(catOptions[optionKey])}
            className={styles.categoryChoicesLabel}
          >
             <div className={styles.qChoiceCategoriesDiv}>
            {Object.keys(catOptions[optionKey].categories).map((cat) => (
             <div>
                {cat}: {catOptions[optionKey].categories[cat]}
                </div>
            ))}
             </div>
            <div className={styles.qChoiceDiffDiv}>
            {Object.keys(catOptions[optionKey].difficulties).map((diff) => (
              <div>
                {diffName(diff)}: {catOptions[optionKey].difficulties[diff]}
             </div>
            ))}
             </div>
             {catOptions[optionKey].bonuses && <div className={styles.bonusIcon}>+<IconComponent imageName={catOptions[optionKey].bonuses  + "Icon"}  /></div>}
          </label>
        ))}
      </div>
    );
  } else {
    return <>Error</>;
  }
};

export default QuestionChoice;
