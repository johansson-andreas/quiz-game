import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/newPageStyle.css";

const TimeLineQuestion = () => {
  const [questionData, setQuestionData] = useState ({})
  const [minMaxValue, setMinMaxValue]= useState ({})
  const [value, setValue] = useState (Number)
  const [correctAnswer, setCorrectAnswer] = [useState (Number)]
  const [answer, setAnswer] = [useState(Number)]
  const [submitResponse, setSubmitResponse] = [useState("")]
  const [numberOff, setNumberOff] = [useState(Number)]
  const [points, setPoints] = useState(0)
  const [currentPoints, setCurrentPoints] = [useState(0)]
  const getData = async() => {
  
    try {
      const response = await axios.get(
        "/api/question-routes/question/timeLine"
      );
      setQuestionData(response.data)
      setMinMaxValue(response.data.minMax)
      console.log(response)
      console.log(minMaxValue)
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  }
  useEffect(()=> {
    getData()
  }, [])

  const pointsCalc = () =>{

    if (answer === correctAnswer){
      setCurrentPoints(10)
      setPoints(points + 10)
    }

    if (correctAnswer * 0.9 > answer < correctAnswer * 1.1) {
      setCurrentPoints(5)
      setPoints(points + 5)
    }

    if (correctAnswer * 0.5 > answer < correctAnswer * 1.5) {
      setCurrentPoints(1)
      setPoints(points + 1)
    } 
  }

  const handleSubmit = () => {
    setAnswer(value)
    setNumberOff(correctAnswer - answer)
    pointsCalc()
    if (numberOff < 0) {
      answer *= -1
    }
    if (answer === correctAnswer) {
      setSubmitResponse("That's the correct answer! You got " + currentPoints +" Points. Total Points:" + points)
      console.log(submitResponse)
    }
    else {
      setSubmitResponse("Your answer:" + answer + " the correct answer is:" + correctAnswer + "You were " + numberOff + " off and got " + currentPoints + " Points. Total Points:" + points)
      console.log(submitResponse)
    }
  }
  return (
    <div className="slider">
      <h1>{questionData.text}</h1>
      <form onSubmit={handleSubmit}>
        <input type="range" min={minMaxValue.min } max={minMaxValue.max} value={value} onChange={({target: {value: radius} }) => {setValue(radius)}}></input>
        <button type ="submit">Submit Answer</button>
        <h2>{value}</h2>
      </form>
      <h3>{submitResponse}</h3>
      </div>
  )
}


export default TimeLineQuestion