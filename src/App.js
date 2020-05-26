import React,{Component} from 'react';
import { Container, Row, Col} from 'react-bootstrap';
import "./styles/style.css";
import "./styles/spinner.css";

import stockImage from "./Assets/stockImg.png";
import TopNavBar from "./components/topNavbar";
import axios from 'axios';

var timeseries = require("timeseries-analysis");

//https://www.npmjs.com/package/timeseries-analysis
//styling with Sass/scss
//graph
//front-end
//front end result to back-end 
//a=back-end fire-base / mongo
//https://iqbroker.co/lp/mobile/en/?aff=97636&afftrack=GAD_IN_EN_09_Trad_Web_aud-544881902108:kwd-19738040773&gclid=Cj0KCQjw9tbzBRDVARIsAMBplx8RNXLjRZ3EhUtmmZviGg1rQF26RKzbAVbxm2HfsUlH0VF-W-eHSOQaAuwiEALw_wcB&gclsrc=aw.ds
//https://blog.stvmlbrn.com/2019/02/20/automatically-refreshing-data-in-react.html


var TrainingData = [];
var GLOBAL_currentForecast = 0;
var GLOBAL_currentActual = 0;
// var TrainingDataLoaded = false;
var Min;
var Max;
var Mean;
var Stdev;

var GLOBAL_t;
var Iter = 24;

class App extends Component {
  state = {
    dataLoading:null,
    dataLoaded:false,
    data:null,
    transformedData:null,
    forecastStarted:false,
    forecastedValue:0,
    actualValue:null,
    year:0,
    topNavbarData:null
  }
  
  setNavbarData =()=>{
    axios.get("https://wt-project-be33d.firebaseio.com/prices.json")
    .then(response=>{
      console.log(response)
      this.setState(()=>({
        topNavbarData:response.data
      }))
    })
  }

  getData=(event)=>{
    if(this.state.forecastStarted){
      console.log("New ForeCast")
      console.log(event)
      var coeffs = GLOBAL_t.ARMaxEntropy({
        data: GLOBAL_t.data.slice(Iter-24,Iter)
      })

      console.log(coeffs);
      var forecast = 0;

      for(var i=0;i<coeffs.length;i++){
        forecast -= GLOBAL_t.data[Iter-i][1]*coeffs[i];
      }

      console.log(forecast,GLOBAL_t.data[Iter+1][1]);
      Iter = Iter+12;

      GLOBAL_currentForecast = forecast;
      GLOBAL_currentActual = GLOBAL_t.data[Iter+1][1];


      axios.post('YOUR_FIREBASE_APP_LINK',{
        forecast:GLOBAL_currentForecast,
        actualValue:GLOBAL_currentActual
      })
      .then(response=>{
        this.setState((prevstate)=>({
          forecastedValue:GLOBAL_currentForecast,
          actualValue:GLOBAL_currentActual,
          year:prevstate.year + 1
        }))
      })
      .catch((err)=>{
        console.log(err)
      })
      console.log('Hero')
    }
  }

  periodicRefresh =(event)=>{

    event.target.style.display = "none";
    this.setState({
      forecastStarted:true
    })

    // var forecastDatapoint = 11;
  }

  fetchData = () =>{
    if(!this.state.dataLoaded){  
      console.log("if statement is returning");
        this.setState(()=>({
          dataLoading:true
        }))
        const data = fetch('https://pkgstore.datahub.io/core/gold-prices/monthly_json/data/45a7a9cb9c4a112c95a51be8d2154f91/monthly_json.json'); //https://api.jsonbin.io/b/5e86f8da93960d63f078133d
        data.then(res=>{
          console.log("fetched data is returning");
          res.json().then(
            result=>{
              console.log(result,"resulted json is returning");
              this.setState(()=>({
                dataLoading:false,
                dataLoaded:true,
                data:result
              }))
            }
          )
        })
    }
  }


  fillTrainingData(values){
    for(var obj in this.state.data){
      var subData =  [];
      subData.push(values[obj].Date,values[obj].Price);
      TrainingData.push(subData);
    }

    console.log(TrainingData)
  }
  buildData=()=>{
    const values = Object.values(this.state.data)
    console.log(values)
    this.fillTrainingData(values);
  }

  transformData = ()=>{
    TrainingData = []
    this.buildData();

    if(TrainingData!==[]){
      var t = new timeseries.main(TrainingData);
      GLOBAL_t = t;
      console.log(t);
      t.ma().lwma();
      //var processed = t.ma().output();
      var chart_url = t.ma({period: 12}).chart() + "&chdl=" +"\"Data Values\"" +"&chtt=Data Values(x-axis) And Dates(y-axis)";
      //console.log(chart_url,processed)

      //For smoothening out the curve
      Min = t.min();
      Max = t.max();
      Mean = t.mean();
      Stdev = t.stdev();
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

      //FORECASTING(console logging that shit out)
      /**This package allows you to easily forecast future values 
      by calculating the Auto-Regression (AR) coefficients for your data. */


      return (
        <div className="bigAssContainer">
          <img className="firstImage fade-in" src={chart_url} ref="first" alt="Data"/> {/* onLoad={()=>{this.refs.first.scrollIntoView({block: 'end', behavior: 'smooth'})}}*/}
          <img className="firstImage fade-in" src={chart_noise_url} ref="first" alt="smoothened Data"/>
          <button className="getStartedButton" onClick={(event)=>this.periodicRefresh(event)}>
            <h3 height="100%">Start ForeCasting</h3>
          </button>
        </div>
      )
    }
  }
  
  componentDidMount(){
    this.setNavbarData();
    this.getData();
    
    setInterval(this.getData,5000);
  }

  render(){
    return(
      <div>
          <Container className="wrap" fluid>
            <Row className="preheader justify-content-md-center">
              <TopNavBar stockItem="GOLD" priceData={this.state.topNavbarData===null ? null : this.state.topNavbarData.gold} />
              <TopNavBar stockItem="OIL" priceData={this.state.topNavbarData===null ? null : this.state.topNavbarData.oil} />
              <TopNavBar stockItem="SENSEX" priceData={this.state.topNavbarData===null ? null : this.state.topNavbarData.sensex}/>
              <TopNavBar stockItem="COAL" priceData={this.state.topNavbarData===null ? null : this.state.topNavbarData.coal} />
            </Row>
            <Row  className="imageRow preheader justify-content">
              <Col xs md={4} lg={5} xl={5} >
                <Container>
                  <Row><Col xs lg = "6" md={{offset:4}}><h1>Instant access to investing, anytime and anywhere</h1></Col></Row>  
                  <Row className="preheader imageRow justify-content">
                    <Col xs lg = "6" md={{offset:4}}>
                    <h5>
                    Investing has never been easier. 
                    Everything you are looking for in an
                    ultimate investment platform — on the 
                    device of your choice.
                    </h5>
                    </Col>
                  </Row>
                  <Row className="preheader imageRow">
                    <Col md={{offset:4}}>
                      <button className="getStartedButton" onClick={()=>this.fetchData()}>
                        <h3 height="100%">Get Started</h3>
                      </button>
                    </Col>
                  </Row>
                </Container>
              </Col>
              <Col className="align-middle">
                <img src={stockImage} width="100%" height="80%" alt="stolenImage">
                </img>
              </Col>
            </Row>
          </Container>
          {
            this.state.dataLoading===true ? <div className="loader spinnerContainer">Loading</div> : this.state.dataLoading === false ? this.transformData() : null //agar data load hogya he to matlab pura data load hogya
          }
          {
            this.state.forecastStarted===true ? (
              <div className="Forecasting-container">
                  <h1 className="year">Year {this.state.year}</h1>
                  <h1>Forecasted Values: </h1> <div className="Values">{this.state.forecastedValue}</div><br/>
                  <h1>Actual Value: </h1><div className="Values">{this.state.actualValue}</div><br/>
              </div>
            )
          : null
          }
      </div>
    )
  }
}
export default App;