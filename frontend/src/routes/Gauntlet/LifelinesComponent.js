import IconComponent from "../../components/IconComponent";
import styles from "./gauntlet.module.css";
import axios from 'axios';

const LifelinesComponent = ({ playerData, setPlayerData, currentQuestion }) => {

  const activateLifeline = async (lifeline) => {
    console.log('cq', currentQuestion);
    switch (lifeline) {
        case "fifty": 
            const fiftyResponse = await axios.get(`/api/gauntlet-routes/lifelines/fifty/${currentQuestion.id}?qtype=${currentQuestion.questionType}`)
            console.log(fiftyResponse)
            break;
        case "skip":  
            const skipResponse = await axios.get(`/api/gauntlet-routes/lifelines/skip`, {question: currentQuestion})
            console.log(skipResponse)

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
            <IconComponent imageName={lifeline} />
          </label>
        ))}
      </div>
    );
  };
  return <>{renderLifelines()}</>;
};

export default LifelinesComponent;
