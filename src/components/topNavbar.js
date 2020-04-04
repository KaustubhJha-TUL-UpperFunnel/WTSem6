import React,{Component} from 'react';
import { Container, Row, Col, Button} from 'react-bootstrap';


//GET https://www.quandl.com/api/v3/datasets/{database_code}/{dataset_code}/data.{return_for

class TopNavBar extends Component{
    render(){
        return(
            <Col className="text-center">
                <strong>{this.props.stockItem} {this.props.currentPrice} </strong>
            </Col>
        )
    }
}

export default TopNavBar
