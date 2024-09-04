import IconComponent from "../../components/IconComponent";
import styles from "./gauntlet.module.css";
import axios from "axios";
import { randomProperty } from "./GauntletUtils";

const LifelinesComponent = ({
  playerData,
  setPlayerData,
  currentQuestion,
  setCurrentQuestion,
  setActiveGame,
  setActiveQuestion
}) => {
  const activateLifeline = async (lifeline) => {
    console.log("cq", currentQuestion);
    switch (lifeline) {
      case "fifty":
        if (playerData.lifelines.includes("fifty")) {
          const fiftyResponse = await axios.get(
            `/api/gauntlet-routes/lifelines/fifty/${currentQuestion.id}?qtype=${currentQuestion.questionType}`
          );
          console.log(fiftyResponse);
          setCurrentQuestion(fiftyResponse.data.question);
          delete playerData.lifelines[playerData.lifelines.indexOf("fifty")];
          break;
        } else {
          break;
        }
      case "skip":
        if (Object.keys(playerData.currentQuestions).length > 0) {
          const randomCat = randomProperty(playerData.currentQuestions);
          setActiveQuestion(true);
          setActiveGame(true);

          setPlayerData((prevData) => {
            const newData = { ...prevData };
            newData.currentQuestions[randomCat]--;
            if (newData.currentQuestions[randomCat] <= 0)
              delete newData.currentQuestions[randomCat];
            return newData;
          });
          try {
            const randomQuestion = await axios.get(
              `/api/gauntlet-routes/question/random/${randomCat}`
            );
            console.log("randomQuestion", randomQuestion.data);

            setCurrentQuestion(randomQuestion.data);
          } catch (error) {
            console.log(error);
          }
          console.log("randomcat", randomCat);
        } else {
          setActiveGame(false);
          console.log("Out of questions, showing new ");
        }
        delete playerData.lifelines[playerData.lifelines.indexOf("skip")];

        break;
      default:
        return;
    }
  };

  const renderLifelines = () => {
    return (
      <div className={styles.lifelineIconDiv}>
        {playerData.lifelines.map((lifeline) => (
          <label onClick={() => activateLifeline(lifeline)}>
            <IconComponent imageName={lifeline + "Icon"} />
          </label>
        ))}
      </div>
    );
  };
  return <>{renderLifelines()}</>;
};

export default LifelinesComponent;
