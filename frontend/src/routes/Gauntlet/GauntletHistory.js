const GauntletHistory = ({ gauntletData }) => {

  const renderGauntletHistory = (gauntletData) => {
    if (gauntletData.data) {

      
      return (
        <div className="gauntletHistoryMainDiv">
          <div>
            Din högsta gauntlet poäng: {gauntletData.data.gauntletHistory.best}
          </div>
          <div>
            Din senaste 5 rundor:
            {gauntletData.data.gauntletHistory.lastFive.map((entry, index) => (
              <div key={index}>{entry}</div>
            ))}
          </div>
        </div>
      );
    } else {
      return <div>No gauntlet history available.</div>;
    }
  };

  return <>{renderGauntletHistory(gauntletData)}</>;
};

export default GauntletHistory;
