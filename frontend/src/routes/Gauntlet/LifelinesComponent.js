import IconComponent from "../../components/IconComponent";
import styles from "./gauntlet.module.css";
import axios from "axios";
import { getNewQuestion, randomProperty } from "./GauntletUtils";

const LifelinesComponent = ({
  playerData,
  setPlayerData,
  currentQuestion,
  setCurrentQuestion,
  setActiveGame,
  setActiveQuestion,
  unusedQuestions
}) => {
  const activateLifeline = async (lifeline) => {
    const newPlayerData = {...playerData}
    switch (lifeline) {
      case "fifty":
        if (newPlayerData && newPlayerData.lifelines["fifty"] > 0) {
          const fiftyResponse = await axios.get(
            `/api/gauntlet-routes/lifelines/fifty/${currentQuestion.id}?qtype=${currentQuestion.questionType}`
          );
          setCurrentQuestion(fiftyResponse.data.question);
          newPlayerData.lifelines["fifty"]--;
          return newPlayerData;
        } else {
          break;
        }
      case "skip":
        if (Object.keys(newPlayerData.currentQuestions).length > 0) {
          const {updatedPlayerData, randomQuestion} = await getNewQuestion(playerData, unusedQuestions);
          if(updatedPlayerData){
            setActiveQuestion(true)
            setPlayerData(updatedPlayerData);
            setCurrentQuestion(randomQuestion);
          }
          else {
            setCurrentQuestion({})
            setPlayerData(prevData => {
              const newData = {...prevData}
              newData.currentQuestions = {categories: {}, difficulties: {}};
              return newData;
            })
            setActiveGame(false);
          }
        } else {
          setActiveGame(false);
        }
        newPlayerData.lifelines["skip"]--;
        return newPlayerData;
        
      default:
        return;
    }
  };

  const renderLifelines = () => {
    return (
      <div className={styles.lifelineIconDiv}>
        {playerData && Object.keys(playerData.lifelines).map((lifeline) => {
          if(playerData.lifelines[lifeline] > 0 ) return (
           <label onClick={() => activateLifeline(lifeline)}>
            <IconComponent imageName={lifeline + "Icon"} />
          </label> )
        })}
      </div>
    );
  };
  return <>{renderLifelines()}</>;
};

export default LifelinesComponent;
