import React,{Component} from 'react';
import {Col} from 'react-bootstrap';


//GET https://www.quandl.com/api/v3/datasets/{database_code}/{dataset_code}/data.{return_for
//853b2b2dc54d71bd5c083b684846a852853b2b2d


class TopNavBar extends Component{
    state={
        price:null
    }
    render(){
        return(
            <Col className="text-center" onLoad={this.getData}>
                {console.log(this.props)}
                <strong>{this.props.stockItem} {this.props.priceData}</strong>
            </Col>
        )
    }
}

export default TopNavBar
