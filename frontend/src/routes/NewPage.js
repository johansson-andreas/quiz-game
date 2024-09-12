import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/newPageStyle.css";

const TimeLineQuestion = () => {
  const [questionData, setQuestionData] = useState ({})
  const [minMaxValue, setMinMaxValue]= useState ({})
  const [points, setPoints] = useState(0)

  //Incorrect declaration of useState(), look at the examples above for correct usage
  const [submitResponse, setSubmitResponse] = [useState("")]
  const [currentPoints, setCurrentPoints] = [useState(0)]

  /*
    Using useState(Number) doesnt accomplish anything as variables dont need a variable type. Either use useState(0) (or some other value)
   if you want a default value for the variable or simply useState() if you dont explicitly need the variables to have a default value
   */
  const [value, setValue] = useState (Number)
  const [numberOff, setNumberOff] = [useState(Number)]
  const [correctAnswer, setCorrectAnswer] = [useState (Number)]
  const [answer, setAnswer] = [useState(Number)]


  const getData = async() => {
  
    try {
      const response = await axios.get(
        "/api/question-routes/question/timeLine"
      );
      setQuestionData(response.data)

      /*Not incorrect usage but we already have the minMax values stored in QuestionData above. Using a seperate variable for minMax can
      improve the codes readability but at the cost of increasing the amount of variables and storing the same data in two different places. 
      Clearly not an issue for this amount of data but something to keep in mind for the future
      */
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

    /*Look at 'if-else' statements. With the current code logic the code would check all three 'if' conditions even if the first one is 
    already true which means we know the following two can't be true and so shouldn't bother even checking
    */
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

  const handleSubmit = (e) => {

    //Added .preventDefault() to stop the page from rerendering once the form has submitted its values
    e.preventDefault();


    setAnswer(value)
    setNumberOff(correctAnswer - answer)

    /*Consider instead of mutating the variables in the pointsCalc() function to return the points that should be added to the total  and assigning
    the variables here with the return of the pointsCalc() function. It makes the logic easier to follow and reduces code repetition 
    */
    pointsCalc()

    if (numberOff < 0) {

      //Incorrect assignment to 'answer', answer is a const and shouldn't directly be mutated. Use setAnswer() to change the value of answer
      answer *= -1
    }

    if (answer === correctAnswer) {
      setSubmitResponse("That's the correct answer! You got " + currentPoints +" Points. Total Points:" + points)

      /*This console.log would work in most cases and with most languages but with react specifically using setVariableName() isn't done instantaneously but instead
      is added to a queue of operations. What this means in this particular case is that submitResponse probably won't have updated with the text you wrote above
      at the time you are printing submitResponse to the console log. There are several ways to accomplish what you are trying to do, for example with an useEffect()
      function with submitResponse as a dependancy which is a function that will run whenever submitResponse is actually updated
      */
      console.log(submitResponse)
    }
    else {
      setSubmitResponse("Your answer:" + answer + " the correct answer is:" + correctAnswer + "You were " + numberOff + " off and got " + currentPoints + " Points. Total Points:" + points)

      /*DRY - Don't repeat yourself. If we are gonna print out submitResponse in both of the if-else results we can just print out the log message after the if-else
      conditions instead of doing it in each individual case
      */
      console.log(submitResponse)
    }


  }
  return (
    <div className="slider">
      <h1>{questionData.text}</h1>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input type="range" min={minMaxValue.min } max={minMaxValue.max} value={value} onChange={(e) => setValue(e.target.value)} />
        <button type ="submit">Submit Answer</button>
        <h2>{value}</h2>
      </form>
      <h3>{submitResponse}</h3>
      </div>
  )
}


export default TimeLineQuestion