const GauntletHistory = ({ gauntletData }) => {
  console.log("gauntletData", gauntletData);

  const renderGauntletHistory = (data) => {
    if (data && data.gauntletHistory) {
      console.log("gauntletData.gauntletHistory", data.gauntletHistory);

      return (
        <div className="gauntletHistoryMainDiv">
          <div>
            Din högsta gauntlet poäng: {data.gauntletHistory.best}
          </div>
          <div>
            Din senaste 5 rundor:
            {data.gauntletHistory.lastFive.map((entry, index) => (
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
