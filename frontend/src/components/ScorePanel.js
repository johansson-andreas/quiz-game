import React, { useMemo} from 'react';

const ScorePanel = ({scoreArray, totalQuestionsScore}) => {

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


    return (
        <div id="scorePanel">
            <p id='answerTally'>Correct answers: {correctAnswers} / Total questions: {totalQuestions} </p>
            <div id="scoreCatPanel">
                {groupedEntries.length > 0 ? (
                groupedEntries.map((group, index) => (
                    <div key={index}>
                    {group.map(([cat, count]) => (
                        <div>
                        {cat}: {count[0]}/{count[1]}
                        </div>
                    ))}
                    </div>
                ))
                ) : (
                <div>No scores available</div>
                )}
            </div>
        </div>
        )
}

export default ScorePanel;