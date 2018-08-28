import React from 'react'
import { connect } from 'react-redux'
import firebase from '../../firebase'
import { addLiveEvent, removeLiveEvent }  from '../../firebase'

import {List, ListItem} from 'material-ui/List';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

import { setEvent, fetchAttendanceThunk, setEventDate, fetchEventsThunk, fetchEventDatesThunk, checkEventLive, setAttPath } from '../../store/actions'

const Admin = ({ events, attendance, currentEvent, onChangeEvent, onChangeDate, eventDate, eventDates,
                 currentDate, currentOrg, onChangeAtt, onSetEventLive, isEventLive, onSetAttPath, attPath }) => (
	<div className = "admin">
		<AdminWindow events={events} attendance={attendance} onChangeEvent={onChangeEvent}
    currentEvent={currentEvent} eventDate={eventDate} eventDates={eventDates}
    onChangeDate={onChangeDate} currentDate={currentDate} currentOrg={currentOrg}
    onChangeAtt={onChangeAtt} onSetEventLive={onSetEventLive} isEventLive={isEventLive}
    onSetAttPath={onSetAttPath} attPath={attPath}/>
  </div>
);

class AdminWindow extends React.Component {
	constructor(props){
    super(props);
    this.state = {
      enabled: false,
      user: null
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          enabled: true,
          user: user
        })
      }
      else {
      	this.setState({
          enabled: false,
          user: null
        })
      }
     });
  }

changeEvent(event, index, value){
  if(value){
    this.props.onChangeEvent(value);
  }
  this.props.onSetAttPath("opening");
}

changeDate(event, index, value){
  if(value){
    let newVal = this.props.eventDates[value];
    this.props.onSetAttPath("opening");
    this.props.onChangeDate(newVal);
  }
}

changeAttType(event, value){
  if(value){
    this.props.onSetAttPath(value);
    this.props.onChangeAtt(value)
  }
}

download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

  downloadReport(){
    var jsonArr = [];
    var dataArr = this.props.attendance;
    console.log(dataArr)
    for (var key in dataArr){
      const attObj = {
        NAME: (dataArr[key]).name.toUpperCase(),
        EMAIL: (dataArr[key]).email,
        TIME_SUCCESS: (dataArr[key]).time
      }
      jsonArr.push(attObj);
    }
    const Json2csvParser = require('json2csv').Parser;
    const fields = ['NAME', 'EMAIL', 'TIME_SUCCESS'];
    const json2csvParser = new Json2csvParser({ fields });
    const csv = json2csvParser.parse(jsonArr);
    this.download("test.csv", csv);
  }

  addRemoveLive(e, isInputChecked){
    var liveEvent = {
      'event':this.props.currentEvent,
      'organization':this.props.currentOrg,
      'date':this.props.currentDate,
      'attPath':this.props.attPath
    }
    if(isInputChecked){
      addLiveEvent(liveEvent)
    }
    else{
      removeLiveEvent(liveEvent)
    }
    this.props.onSetEventLive();
  }

  render() {
  	var namesList = [];
    for(var i = 0; i < this.props.attendance.length; i++){
        namesList.push(<ListItem key={i} primaryText={(this.props.attendance[i]).name} secondaryText={"Time Logged: " + (this.props.attendance[i]).time}></ListItem>);
    }

    var eventsList = [];
    for(var j = 0; j < this.props.events.length; j++){
        eventsList.push(<MenuItem key={j} value={this.props.events[j]} primaryText={this.props.events[j]}></MenuItem>);
    }

    var datesList = [];
    for(var k = 0; k < this.props.eventDates.length; k++){
        datesList.push(<MenuItem key={k} value={this.props.eventDates[k].key} primaryText={this.props.eventDates[k].key}></MenuItem>);
    }

    return (
      (!this.state.enabled ?
        <div>
         	<p>Please sign-in with an admin-enabled account!</p>
          	<p style = {{color:"#DAA520"}}>If sign-in button doesn't work, make sure pop-ups are enabled and try again</p>
          	<p style = {{color:"#DAA520"}}>(wait a few seconds after returning from sign-in page for this screen to refresh)</p>
        </div> 
        : 
        <div>
          <div>Attendance:</div>
          <p></p>
          <div>Choose event & date below:</div>
          <div style={{"display":"flex","justifyContent":"center"}}>
            <div>
            <DropDownMenu maxHeight={300} value={this.props.currentEvent} onChange={this.changeEvent.bind(this)}>
        		  {eventsList}
      		  </DropDownMenu>
            </div>
            <div>
            <DropDownMenu maxHeight={300} value={this.props.eventDate.key} onChange={this.changeDate.bind(this)}>
        		  {datesList}
      		  </DropDownMenu>
            </div>
            {(this.props.eventDate.key === this.props.currentDate) ? 
            <div style={{"display":"flex"}}>
            <div style={{"marginTop":"19px"}}>Live:</div>
            <div style={{"marginTop":"17px"}}><Toggle toggled={this.props.isEventLive === true ? this.props.isEventLive : false} onToggle={(e, isInputChecked) => this.addRemoveLive(e, isInputChecked)}></Toggle></div>
            </div> : null}
          </div>
          { (this.props.eventDate.props) ? 
          (this.props.eventDate.props.closingAtt) ? 
          <div>
             <RadioButtonGroup name="whichAtt" defaultSelected="opening" valueSelected={this.props.attPath}
              onChange={this.changeAttType.bind(this)}
             style={{"maxWidth":"125px","marginLeft":"45%"}}>
                <RadioButton
                  value="opening"
                  label="opening"
                  style={{"marginBottom":"16px"}}
                />
                <RadioButton
                  value="closing"
                  label="closing"
                  style={{"marginBottom":"16px"}}
                />
             </RadioButtonGroup>
          </div> : null : <div>error checking if closing attendance.</div>
          }
          <p></p>
          <FlatButton onClick={() => this.downloadReport()} labelStyle={{color:"#FFFFFF"}} label="Download Report" 
          backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336"/>
          <List>
          	{namesList}
          </List>
        </div>
      )
    )
  }
}

const mapState = (state) => ({
    events: state.events,
    attendance: state.attendance,
    currentEvent: state.currentEvent,
    currentDate: state.currentDate,
    eventDate: state.eventDate,
    eventDates: state.eventDates,
    currentOrg: state.currentOrg,
    isEventLive: state.isEventLive,
    attPath: state.attPath
})
 const mapDispatch = (dispatch) => {
  dispatch(setAttPath("opening"));
  dispatch(fetchEventsThunk());
   return {
    onChangeEvent(newEvent){
      dispatch(setEvent(newEvent));
      dispatch(fetchEventDatesThunk());
    }, 
    onChangeDate(newEventDate){
      dispatch(setEventDate(newEventDate));
      dispatch(fetchAttendanceThunk());
    },
    onChangeAtt(newAttPath){
      dispatch(fetchAttendanceThunk(newAttPath));
    },
    onSetEventLive(attPath){
      dispatch(checkEventLive(attPath))
    },
    onSetAttPath(attPath){
      dispatch(setAttPath(attPath));
    }
  }
 }
 export default connect(mapState, mapDispatch)(Admin);