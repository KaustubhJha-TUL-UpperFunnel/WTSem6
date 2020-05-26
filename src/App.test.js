import React,{Component} from 'react';
import { render } from '@testing-library/react';
import { Container, Row, Col} from 'react-bootstrap';
import TopNavBar from "./components/topNavbar";
import axios from 'axios';
import { unmountComponentAtNode } from "react-dom";
var timeseries = require("timeseries-analysis");
import "./styles/style.css";
import "./styles/spinner.css";

//-------------- Unit testing ---------------------//
let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});


it("post to updating value database test",()=>{
  axios.post('https://wt-project-be33d.firebaseio.com/forecast-values.json',{
    forecast:1.0,
    actualValue:1.0
  })
  .then(response=>{
    console.log(response)
  })
  .catch((err)=>{
    console.log(err)
  })
})

it("fetch from prices json",()=>{
  axios.get("https://wt-project-be33d.firebaseio.com/prices.json")
    .then(response=>{
      console.log(response)
    })
})

it("get data function test",()=>{
  class Temp extends Component{
    state = {
      topNavbarData:null
    }
  }
  axios.get("https://wt-project-be33d.firebaseio.com/prices.json")
    .then(response=>{
      console.log(response)
      this.setState(()=>({
        topNavbarData:response.data
      }))
  })
})


it("fetch data function test",()=>{
  const data = fetch('https://pkgstore.datahub.io/core/gold-prices/monthly_json/data/45a7a9cb9c4a112c95a51be8d2154f91/monthly_json.json'); //https://api.jsonbin.io/b/5e86f8da93960d63f078133d
    data.then(res=>{
      console.log("fetched data is returning");
      res.json().then(
        result=>{
          console.log(result,"resulted json is returning");
        }
      )
  })
})


it("fill training data test and build data",()=>{
  var TrainingData = []
  function fillTrainingData(values){
    for(var obj in values){
      var subData =  [];
      subData.push(values[obj].Date,values[obj].Price);
      TrainingData.push(subData);
    }

    console.log(TrainingData)
  }

  fillTrainingData({"date":"04-09-1998","Price":"1234"})
})


it("transforming data",()=>{
  var TrainingData = [["04-09-1998","1234"],["04-10-1998","1236"],["04-11-1998","1237"],["04-12-1998","1238"],["01-01-1999","1235"]]
  var t = new timeseries.main(TrainingData);
  var chart_url = t.ma({period: 12}).chart() + "&chdl=" +"\"Data Values\"" +"&chtt=Data Values(x-axis) And Dates(y-axis)";
  //console.log(chart_url,processed)

  //For smoothening out the curve

  var Min = t.min();
  var Max = t.max();
  var Mean = t.mean();
  var Stdev = t.stdev();
  console.log(Min,Max,Mean,Stdev);

  //Smoothening
  t.smoother({
    period:     10
  });
  t.dsp_itrend({
    alpha:   0.01
  });

  //NOISE Seperation
  var newVar = t.smoother({period:10}).noiseData().smoother({period:5});
  //smoothing the noisy data without any lag
  newVar.dsp_itrend({
    alpha:0.01
  })
  var chart_noise_url = newVar.chart({main:true,lines:[0]}) + "&chdl=" +"\"Noise Value Smoothend Out\"|\"Main Values\"" + "&chtt=Noise Seperation and Smoothening" ;

  console.log(chart_noise_url,chart_url,Min,Max,Mean,Stdev,newVar)
})


it("get data test",()=>{
  var TrainingData = [["04-09-1998","1234"],["04-10-1998","1236"],["04-11-1998","1237"],["04-12-1998","1238"],["01-01-1999","1235"]]
  
  var GLOBAL_t;
  var Iter = 5;

  var t = new timeseries.main(TrainingData);
  GLOBAL_t = t;
  var forecast = 0;

  

  var coeffs = GLOBAL_t.ARMaxEntropy({
    data: GLOBAL_t.data.slice(Iter-5,Iter)
  })

  console.log(coeffs)

})

it("forecast testing",()=>{
  var TrainingData = [["04-09-1998",1234],["04-10-1998",1236],["04-11-1998",1237],["04-12-1998",1238],["01-01-1999",11235]];
  //console.log(TrainingData[0][1])
  var coeffs = [1,2,3,4,5];
  var forecast = 0;
  for(var i=0;i<coeffs.length;i++){
    forecast -= TrainingData[5-i-1][1]*coeffs[i];
  }

  console.log(forecast)
})

it("periodic refresh",()=>{
  function hello(){
    console.log("hello")
  }
  function componentDidMount(){
    setInterval(hello,5000);
  }

  componentDidMount()
})


//--------------------------UI(System Testing)----------------------------------//
//act for UI testing  
//https://reactjs.org/docs/testing-recipes.html#act

//--------------------------------------------

it("Full Content",()=>{
  const div = document.createElement("div");
  render(<Col></Col>,div);
})

//---------------------------------------------

it(("Transform data UI Testing"),()=>{
  var TrainingData = [["04-09-1998","1234"],["04-10-1998","1236"],["04-11-1998","1237"],["04-12-1998","1238"],["01-01-1999","1235"]]
  var t = new timeseries.main(TrainingData);
  var chart_url = t.ma({period: 12}).chart() + "&chdl=" +"\"Data Values\"" +"&chtt=Data Values(x-axis) And Dates(y-axis)";
  t.smoother({
    period:     10
  });
  t.dsp_itrend({
    alpha:   0.01
  });

  //NOISE Seperation
  var newVar = t.smoother({period:10}).noiseData().smoother({period:5});
  //smoothing the noisy data without any lag
  newVar.dsp_itrend({
    alpha:0.01
  })
  var chart_noise_url = newVar.chart({main:true,lines:[0]}) + "&chdl=" +"\"Noise Value Smoothend Out\"|\"Main Values\"" + "&chtt=Noise Seperation and Smoothening" ;


  const div = document.createElement("div");
  render(<div>
          <img src={chart_url} alt="Data"/>
          <img src={chart_noise_url} alt="smoothened Data"/>
        </div>
  )
})

//---------------------------------------------

it("Spinner UI Test",()=>{
  render(<div className="loader spinnerContainer">Loading</div>)
})

//---------------------------------------------


it("Forecasting Container UI",()=>{
  class Temp{
    
    constructor() {
      this.state = {
        forecastedValue:10,
        actualValue:10,
        year:1
      }
    }
    
  }
  var t = new Temp;
  
  render(
    <div className="Forecasting-container">
        <h1 className="year">Year {t.year}</h1>
        <h1>Forecasted Values: </h1> <div className="Values">{t.forecastedValue}</div><br/>
        <h1>Actual Value: </h1><div className="Values">{t.actualValue}</div><br/>
    </div>
  )
  
})

//-------------------------------------------

it("button",()=>{
  render(
    <button className="getStartedButton">
      <h3 height="100%">Get Started</h3>
    </button>
  )
})
//-------------------------------------------

it("topnavbartest",()=>{
  render(
    <TopNavBar stockItem="GOLD" priceData={5} />
  )
})

//-------------------------------------------------------------------------
//                     PERFORMANCE TESTING IN CONSOLE
//-------------------------------------------------------------------------