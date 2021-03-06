import React from 'react';
import { connect } from 'react-redux';

import Loader from 'react-loader-spinner';

import FlatButton from 'material-ui/FlatButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import styled from 'styled-components';

import 'firebase/auth'
import firebase, { logOption, isLivePoll, signIn } from '../firebase'

import { setLivePoll, fetchLivePollsThunk, setCurrentOption, fetchDateThunk, watchLivePolls, offWatchLivePolls } from '../store/actions'

const Container = styled.div`
 justify-content: center;
 display: flex;
`;

const Voting = ({ livePolls, onChangePoll, currentLivePoll, currentOption, onChangeOption, currentYear, onUserLogin, onUserLogoff }) => (
  <div className='attendance'>
    <VotingWindow livePolls={livePolls}
      currentLivePoll={currentLivePoll} onChangePoll={onChangePoll} 
      currentOption={currentOption} onChangeOption={onChangeOption} currentYear={currentYear} onUserLogin={onUserLogin}
      onUserLogoff={onUserLogoff}/>
  </div>
);

class VotingWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enabled: false,
      user: null,
      logged: false,
      att: "Pending",
      lat: null,
      long: null,
      err: "",
      enabledSubmit: false
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.props.onUserLogin();
        this.setState({
          enabled: true,
          user: user
        })
      }
      else {
        this.props.onUserLogoff();
        this.setState({
          enabled: false,
          user: null
        })
      }
    });
  }

  changePoll(event, index, value) {
    if (value) {
      let newVal = JSON.parse(value);
      this.props.onChangePoll(newVal);
    }
    this.setState({
      logged: false
    })
  }

  //from: https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
  measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
  }

  logAtt() {
    var master = this;
    this.setState({
      att: "Logging In...",
      err: "WARNING: If longer than 10 seconds, please make sure location is allowed and try again",
      logged: false
    })
    let meetingLat = this.props.currentLivePoll.location.latitude;
    let meetingLong = this.props.currentLivePoll.location.longitude;
    let radius = this.props.currentLivePoll.location.radius;
    var userLat;
    var userLong;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        if (position.coords) {
          userLat = position.coords.latitude;
          userLong = position.coords.longitude;
          let distToEvent = master.measure(meetingLat, meetingLong, userLat, userLong);
          if (distToEvent <= radius) {
            master.loginSuccess(userLat, userLong, distToEvent);
          }
          else {
            master.loginFailure(0);
          }
        }
      });
    } else {
      master.loginFailure(1);
    }
  }

  loginSuccess(userLat, userLong, distToEvent) {
    var today = new Date();
    var timestamp = today.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    if (!isLivePoll(this.props.currentLivePoll.uuid)) {
      return this.loginFailure(2);
    }
    logOption(this.props.currentLivePoll, this.props.currentOption, 
      this.state.user, timestamp, userLat, userLong, distToEvent, this.props.currentYear);
    this.setState({
      logged: true,
      lat: userLat,
      long: userLong,
      att: timestamp,
      err: ""
    })
  }

  loginFailure(type) {
    var error = "";
    switch (type) {
      case 0:
        error = "FAIL: Please move into range of the event and try again"
        break;

      case 1:
        error = "FAIL: Please allow location for this page in your browser and try again"
        break;

      case 2:
        error = "FAIL: Event no longer live."
        break;

      default:
        error = "FAIL: Unknown Error, please refresh and try again"
        break;
    }
    this.setState({
      att: "Pending",
      err: error
    })
  }

  changeOption(event, value) {
    if (value) {
      this.props.onChangeOption(value);
    }
  }

  render() {
    let pollsList = [];
    for (let j = 0; j < this.props.livePolls.length; j++) {
      pollsList.push();
    }

    return (
      (!this.state.enabled ?
        <div>
          <FlatButton onClick={() => signIn()} labelStyle={{ color: "#FFFFFF" }} label={"SIGN-IN"}
            backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" />
          <p style={{ color: "#DAA520", "marginTop": "10px" }}>If sign-in button doesn't work, make sure pop-ups are enabled and try again</p>
          <p style={{ color: "#DAA520" }}>(wait a few seconds after returning from sign-in page for this screen to refresh)</p>
        </div>
        :
        (this.props.livePolls[0] ?
          <div>
            <DropDownMenu maxHeight={300} value={JSON.stringify(this.props.currentLivePoll)} 
            onChange={this.changePoll.bind(this)} openImmediately={!(this.props.livePolls.length === 1)}
            onClose={() => this.setState({enabledSubmit: true})}>
              {this.props.livePolls.map((poll, index) => {
                return (<MenuItem key={index}
                  value={JSON.stringify(poll)} primaryText={poll.question
                    + " - " + poll.organization.match(/[A-Z]/g).join('')}></MenuItem>
                )
              })}
            </DropDownMenu>
            <p></p>
            {this.props.livePolls.length === 1 || this.state.enabledSubmit === true ?
            <div>
            {this.props.currentLivePoll.options ?
              <Container>
                <div>
                  <RadioButtonGroup name="whichOpt" defaultSelected={this.props.currentOption} 
                  valueSelected={this.props.currentOption}
                    onChange={this.changeOption.bind(this)}
                    style={{ "maxWidth": "115px", "marginRight": "10px" }}>
                    {this.props.currentLivePoll.options.map((option, index) => {
                      return (<RadioButton key={index}
                        value={option.text}
                        label={option.text}
                        style={{ "marginBottom": "16px" }}
                      />
                      )
                    })}
                  </RadioButtonGroup>
                </div>
              </Container> : null
            }
            <div> </div>
            <FlatButton onClick={() => this.logAtt()} labelStyle={{ color: "#FFFFFF" }} label="Submit"
              backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" />
            <p></p>
            {this.state.att === "Logging In..." ? <Loader type="Triangle" color="#F44336" height={80} width={80}/> : null}
            {(this.state.logged ? <p style={{ color: 'green' }}> Success! </p> : null)}
            <p style={{ color: 'red' }}> {this.state.err} </p>
            </div> : <div style={{"position":"absolute", "bottom":"50px","margin-left":"auto","margin-right":"auto",
            "left":"0", "right":"0"}}>Choose a poll!</div>}
          </div>
          : <div>No live polls at this time.</div>)
      )
    )
  }
}

const mapState = (state) => ({
  livePolls: state.livePolls,
  currentLivePoll: state.currentLivePoll,
  currentOption: state.currentOption,
  currentYear: state.currentYear
})

const mapDispatch = (dispatch) => {
  dispatch(fetchDateThunk());
  return {
    onChangePoll(newLivePoll) { 
      dispatch(setLivePoll(newLivePoll)); 
      dispatch(setCurrentOption(newLivePoll.options[0].text)) },
    onChangeOption(newOption) { dispatch(setCurrentOption(newOption)); }, 
    onUserLogin(){
      dispatch(fetchLivePollsThunk());
      dispatch(watchLivePolls());
    },
    onUserLogoff(){
      dispatch(offWatchLivePolls());
    }
  }
}
export default connect(mapState, mapDispatch)(Voting);