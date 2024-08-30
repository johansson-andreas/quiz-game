import { useMemo} from 'react';
import IconComponent from './IconComponent';

const ScorePanel = ({scoreArray, totalQuestionsScore, questionCategories, streakRecord, currentStreak}) => {

    const chunkArray = (array, chunkSize) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    };
    const correctAnswers = totalQuestionsScore[0];
    const totalQuestions = totalQuestionsScore[1];

    const scoreArrayEntries = useMemo(() => Object.entries(scoreArray), [scoreArray]);
    const groupedEntries = useMemo(() => chunkArray(scoreArrayEntries, 3), [scoreArrayEntries]);

    const findIcon = (imageName) => 
        {
            let iconName = imageName;
            questionCategories.filter(qCat => {if(qCat._id === imageName) iconName = qCat.icon; return qCat});
            return iconName;
        }


    return (
        <div id="scorePanel">
            <p id='scorePanelTitle'>Statistik denna session</p>
            <p id='answerTally'>Korrekta svar: {correctAnswers} / Totala frågor: {totalQuestions} </p>
            <p id='streakDisplay'>Rätt svar i rad: {currentStreak} / Rekord: {streakRecord}</p>
            <div id="scoreCatPanel">
                {groupedEntries.length > 0 ? (
                groupedEntries.map((group, index) => (
                    <div key={index}>
                    {group.map(([cat, count]) => (
                        <div key={cat} className="iconScoreDiv">
                            <div className="iconCompDiv"> <IconComponent imageName={findIcon(cat)} /> </div>
                            <div className="catCount">{count[0]}/{count[1]}
                            </div>
                        </div>
                        
                    ))}
                    </div>
                ))
                ) : (
                <div>Inga svar än</div>
                )}
            </div>
        </div>
        )
}

export default ScorePanel;