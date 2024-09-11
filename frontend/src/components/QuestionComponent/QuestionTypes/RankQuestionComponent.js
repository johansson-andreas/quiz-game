import styles from "../QuestionComponent.module.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useState, useEffect } from "react";
import classNames from "classnames";


export const RankQuestion = ({ question, setAnswer, answer, correctAnswer }) => {

  const [correctRankList, setCorrectRankList] = useState([])

  const items = question.choices.map((option) => {
    return { id: option, content: option };
  });

  const [list, setList] = useState(items);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const updatedList = Array.from(list);
    const [reorderedItem] = updatedList.splice(result.source.index, 1);
    updatedList.splice(result.destination.index, 0, reorderedItem);

    setList(updatedList);
  };


  const getDivClassName = (option) => {
    

    let baseClass = [];
    if (correctRankList && correctRankList.length > 0) {
      baseClass[0] = "neutral";
      baseClass[1] = "nopulse";

      {
        if (answer.indexOf(option) == correctRankList.indexOf(option)) {
          baseClass[0] = "correct"
          baseClass[1] = "pulse"
        } else if (answer.indexOf(option) !== correctRankList.indexOf(option)) {
          baseClass[0] = "incorrect";
          baseClass[1] = "nopulse"

        }
      }
    } else {
      baseClass[0] = "neutral";
      baseClass[1] = "nopulse";
    }
    return baseClass;
  };

  useEffect(() => {
    if (Object.keys(list).length > 0) {
      const reducedObject = list.flatMap((obj) => {
        return obj.content;
      });
      setAnswer(reducedObject);
    }
  }, [list]);

  useEffect(() => {
    setCorrectRankList(correctAnswer)
  }, [correctAnswer]);

  useEffect(() => {
    setCorrectRankList([]);
    const items = question.choices.map((option) => {
      return { id: option, content: option };
    });

    setList(items);
  }, [question]);

  return (
    <div className={styles.rankQuestionMain}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {list.map((item, index) => {
                const baseClass = getDivClassName(item.content);
                return (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => {
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                        }}
                        className={classNames(
                          styles.rankListItem,
                          styles[baseClass[0]],
                          styles[baseClass[1]]
                        )}
                      >
                        {item.content}
                      </div>
                    );
                  }}
                </Draggable>
              )})}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className={styles.correctRankDiv}>
          {correctRankList && correctRankList.map(listItem => (
            <div className={styles.rankListItem} key={listItem}>{listItem} </div>
          ))}
      </div>
    </div>
  );
};
