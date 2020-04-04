import React,{Component} from 'react';
import { Container, Row, Col, Button} from 'react-bootstrap';
import "./styles/style.css";
import "./styles/spinner.css";

import stockImage from "./Assets/stockImg.png";
import TopNavBar from "./components/topNavbar";
import {Link} from "react-scroll";

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
// var TrainingDataLoaded = false;
var Min;
var Max;
var Mean;
var Stdev;

class App extends Component {
  state = {
    dataLoading:null,
    dataLoaded:false,
    data:null,
    transformedData:null,
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
    this.buildData();

    if(TrainingData!==[]){
      var t = new timeseries.main(TrainingData);
      console.log(t);
      t.ma().lwma();
      var processed = t.ma().output();
      var chart_url = t.ma({period: 14}).chart();
      //console.log(chart_url,processed)

      //For smoothening out the curve
      Min = t.min();
      Max = t.max();
      Mean = t.mean();
      Stdev = t.stdev();

      //Smoothening
      t.smoother({
        period:     10
      });
      t.dsp_itrend({
        alpha:   0.01
      });
      var chart_url_2 = t.ma({period: 1}).chart();

      //NOISE Seperation
      

      return (
        <div className="bigAssContainer">
          <img className="firstImage fade-in" src={chart_url} ref="first" onLoad={()=>{this.refs.first.scrollIntoView({block: 'end', behavior: 'smooth'})}} />
          <img className="firstImage fade-in" src={chart_url_2} ref="first" />
        </div>
      )
    }
  }

  render(){
    // if(!this.state.dataLoaded){
    //   this.fetchData();
    // }
    return(
      <div>
          <Container className="wrap" fluid>
            <Row className="preheader justify-content-md-center">
              <TopNavBar stockItem="GOLD" currentPrice="136.76"/>
              <TopNavBar stockItem="OIL" currentPrice="228.74" />
              <TopNavBar stockItem="SENSEX" currentPrice ="1846.09" />
              <TopNavBar stockItem="COAL" currentPrice="1067.86" />
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
                <img src={stockImage} width="100%" height="80%">
                </img>
              </Col>
            </Row>
          </Container>
          {
            this.state.dataLoading===true ? <div className="loader spinnerContainer">Loading</div> : this.state.dataLoading === false ? this.transformData() : null
          }
      </div>
    )
  }
}

export default App;
