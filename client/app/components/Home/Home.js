import React, { Component } from 'react';
import 'whatwg-fetch';
import { getFromStorage, setInStorage } from '../../utils/storage'


class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      token: '',
      signUpError: '',
      loginError: '',
      loginEmail: '',
      loginPassword: '',
      signUpFirstName: '',
      signUpLastName: '',
      signUpEmail: '',
      signUpPassword: ''
    };


  }

  componentDidMount() {
    const obj = getFromStorage('accountInfo');
    
    if (obj && obj.token) {
      const {token} = obj;
      this.setState({
        isLoading: true  
      })
      fetch('/api/account/verify?token=' + token)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.setState({
              token,
              isLoading: false
            })
          } else {
            this.setState({
              isLoading: false,
            })
          }
        })
    }
  }
    // fetch('/api/counters')
    //   .then(res => res.json())
    //   .then(json => {
    //     this.setState({
    //       counters: json
    //     });
    //   });

    // fetch('/api/counters', { method: 'POST' })
    //   .then(res => res.json())
    //   .then(json => {
    //     let data = this.state.counters;
    //     data.push(json);

    //     this.setState({
    //       counters: data
    //     });
    //   });

  onChangeGeneric = event => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }
  onClickLogout = event => {


    const obj = getFromStorage('accountInfo');
    
    if (obj && obj.token) {
      const {token} = obj;
      this.setState({
        isLoading: true  
      })
      fetch('/api/account/logout?token=' + token)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.setState({
              token: '',
              isLoading: false
            })
          } else {
            this.setState({
              isLoading: false,
            })
          }
        })
    }

  }
  onClickLogin = event => {
  //  console.log('inside onClickLogin')
    const {
      loginEmail,
      loginPassword
    } = this.state;
    console.log(loginEmail+" "+loginPassword)
    this.setState({
      isLoading: true
    })

    fetch('/api/account/login', { 
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword
      })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          console.log("json.token"+json.token)
          setInStorage('accountInfo',{token: json.token});
          this.setState({
            loginEmail: "",
            loginPassword: "",
            token: json.token,
            loginError: json.message,
            isLoading: false
          }) 
        } else {
          this.setState({
            loginError: json.message,
            isLoading: false
          })
        }
      })

  }

  onClickSignUp = event => {
    const {
      signUpFirstName,
      signUpLastName,
      signUpEmail,
      signUpPassword
    } = this.state;

    this.setState({
      isLoading: true
    })

    fetch('/api/account/signup', { 
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: signUpFirstName,
        lastName: signUpLastName,
        email: signUpEmail,
        password: signUpPassword
      })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          this.setState({
            signUpError: json.message,
            isLoading: false,
            signUpEmail: '',
            signUpPassword: '',
            signUpFirstName: '',
            signUpLastName: ''
          })
        } else {
          this.setState({
            signUpError: json.message,
            isLoading: false          
          })
        }
      });
  }

  render() {
    const {
      isLoading,
      token,
      signUpError,
      loginError,
      loginEmail, 
      loginPassword,
      signUpFirstName,
      signUpLastName,
      signUpEmail,
      signUpPassword
      
    } = this.state;

    if (isLoading) {
      return (
        <div><p>Loading...</p></div>
      )
    }
    if (!token) {
      return (
        <div>
          <div>
            {
              (loginError) ? (
                <p>{loginError}</p>
              ) : (null)
            }
            <p>Log In</p>
            <input onChange={this.onChangeGeneric} name="loginEmail" type="email" value={loginEmail} placeholder="Email" />
            <br/>
            <input onChange={this.onChangeGeneric} name="loginPassword" type="password" value={loginPassword} placeholder="Password" />
            <br/>
            <button onClick={this.onClickLogin} type="button">Log in</button>
            <br/>
            <br/>
          </div>
          <div>
          {
              (signUpError) ? (
                <p>{signUpError}</p>
              ) : (null)
            }
            <p>Sign Up</p>
            <input onChange={this.onChangeGeneric} name="signUpFirstName" type="text" value={signUpFirstName} placeholder="First Name" />
            <br/>
            <input  onChange={this.onChangeGeneric} name="signUpLastName" type="text" value={signUpLastName} placeholder="Last Name" />
            <br/>
            <input onChange={this.onChangeGeneric} name="signUpEmail" type="email" value={signUpEmail} placeholder="Email" />
            <br/>
            <input  onChange={this.onChangeGeneric} name="signUpPassword" type="password" value={signUpPassword} placeholder="Password" />
            <br/>
            <button onClick={this.onClickSignUp} type="button">Sign Up</button>
            <br/>
          </div>
        </div>
      )
    }
    return (
      <div>
        Account
        <button type="button" onClick={this.onClickLogout}>Logout</button>
      </div>
    );
  }
}

export default Home;
