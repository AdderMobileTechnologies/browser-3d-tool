import * as K from "../constants";
//.env fix
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../assets/scss/style.css";
import {
  Input,
  CustomInput,
  FormGroup,
  Form,
  Row,
  Col,
  Button
} from "reactstrap";

import axios from "axios";

import { withRouter } from "react-router";

import { VERSION } from "./../environment.js";

/*
TODO: 

by-pass email verification requirement. 
and clean up to merge
PATH: 
  llogin.js:: renderCreateAccountButton->registrationCreateUser-> /v1/auth/register/ -> 


*/

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      existingUser: {
        email: "not@set.yet",
        password: "notsetyet",
        role: "client"
      },
      isLoginForm: true,
      registeringUser: {
        fullName: "",
        business_name: "",
        email: "not@set.yet",
        password: "",
        agreeToTerms: "off",
        role: "client"
      },
      hasFullName: false,
      hasBusiness_name: false,
      hasEmail: false,
      hasPassword: false,
      isAgreed: false,
      readyToRegister: false,
      cookie_name: ""
    };

    if (localStorage.getItem("token") !== null) {
      //TODO: Add endpoint to API that will check the clientid and token in localStorage, verify they are valid, then redirect to the dashboard.
      this.props.history.push("/main");
      return;
    } else {
      localStorage.clear();
    }

    this.loginFormInputOnChange = this.loginFormInputOnChange.bind(this);
    this.submitLogin = this.submitLogin.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
    this.handleInputRegister = this.handleInputRegister.bind(this);
    this.registrationCreateUser = this.registrationCreateUser.bind(this);
    this.handleForgotPassword = this.handleForgotPassword.bind(this);
  }

  loginFormInputOnChange(e) {
    console.log("loginFormInputOnChange");
    let value = e.target.value;
    let name = e.target.name;

    this.setState(prevState => ({
      existingUser: { ...prevState.existingUser, [name]: value }
    }));
  }

  toggleForm(e) {
    console.log("toggleForm");
    e.preventDefault();
    this.setState(state => ({
      isLoginForm: !state.isLoginForm
    }));
  }

  handleInputRegister(e) {
    console.log("handleInputRegister");
    let value = e.target.value;
    let name = e.target.name;
    this.setState(prevState => ({
      registeringUser: { ...prevState.registeringUser, [name]: value }
    }));

    if (this.state.agreeToTerms === "on") {
      this.setState({
        readyToRegister: true
      });
    }

    switch (name) {
      case "fullName":
        this.setState(state => ({
          hasFullName: true
        }));
        break;
      case "business_name":
        this.setState(state => ({
          hasBusiness_name: true
        }));
        break;
      case "email":
        this.setState(state => ({
          hasEmail: true
        }));
        break;
      case "password":
        this.setState(state => ({
          hasPassword: true
        }));
        break;
      case "agreeToTerms":
        this.setState(prevState => ({
          registeringUser: {
            ...prevState.registeringUser,
            registeringUser: {
              agreeToTerms: "on"
            }
          }
        }));
        break;
      default:
        break;
    }
  }

  registrationCreateUser(e) {
    console.log("registrationCreateUser");
    e.preventDefault();
    let userData = this.state.registeringUser;

    const dataPackage = {
      email: userData.email,
      password: userData.password,
      role: "client",
      is_verified: "false"
    };

    const endpoint = `${K.META_URL}/v1/auth/register/`;

    const config = {
      method: "POST",
      url: endpoint,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      data: dataPackage
    };
    //console.log("login.jsx: submitLogin: config:", config);
    axios(config)
      .then(response => {
        console.log("RESPONSE: positive");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("version", VERSION);
        this.props.history.push("/main");
      })
      .catch(err => {
        localStorage.clear();
        if (err.response) {
          if (err.response.status === 400) {
            if (err.response.data.err === "ALREADY_REGISTERED") {
              return alert("It appears an account with that email already exists!");
            }
          }
        }

        return alert("We apologize, but an internal error has occurred. Please try again.");

      });
    //-=-=-=-=-=-=-=--=-=-=-=-=-=-=--=-=-=-=-=-=-=--=-=-=-=-=-=-=--=-=-=-=-=-=-=--=-=-=-=-=-=-=--=-=-=-=-=-=-=--=-=-=-=-=-=-=-
  }
  handleForgotPassword() {
    console.log("handleForgotPassword");
    this.props.history.push("/recover-password"); // for react-router@3 it would be this.props.router.push('/some/location');
  }
  handleForgotPassword() {
    console.log("handleForgotPassword");
    console.log("this.props.history", this.props.history);
    this.props.history.push("/recover-password");
  }

  submitLogin(e) {
    console.log("submitLogin");
    e.preventDefault();

    const endpoint = `${K.META_URL}` + "/v1/auth/login/client";
    const dataPackage = {
      email: this.state.existingUser.email,
      password: this.state.existingUser.password,
      role: "client"
    };

    const config = {
      method: "POST",
      url: endpoint,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      data: dataPackage
    };
    console.log("login.jsx: submitLogin: config:", config);
    axios(config)
      .then(response => {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("clientid", response.data.clientid);
        //localStorage.setItem("version", Config.Frontend.VERSION);
        localStorage.setItem("version", "Config.Frontend.VERSION");
        this.props.history.push("/main");
      })
      .catch(error => {
        localStorage.clear();

        alert("We're sorry, but that is the wrong password for this account.");
      });
  }
  renderCreateAccountButton() {
    return (
      <Button
        onChange={this.registrationCreateUser}
        color=" "
        size=""
        className="auth-login-button create-new-account-button"
        type="submit"
      >
        CREATE NEW ACCOUNT
      </Button>
    );
  }
  componentDidMount() {
    console.log("componentDidMount");
  }
  render() {
    return (
      <div className="login_body">
        <div className="auth-wrapper d-flex no-block justify-content-center align-items-center">
          {" "}
          {/**style={sidebarBackground} */}
          <div className="auth-box x-on-sidebar">
            <div id="loginform" className="login-form">
              <Row>
                <Col xs="12" md="8">
                  <div className="logo" />
                </Col>
                <Col xs="12" md="4">
                  {this.state.isLoginForm ? (
                    <div>
                      <Button
                        onClick={this.toggleForm}
                        color=""
                        className="auth-login-button create-new-account-button"
                        type="button"
                      >
                        CREATE NEW ACCOUNT
                      </Button>
                      <Form onSubmit={this.submitLogin} className="mt-3">
                        <FormGroup className="mb-3">
                          <Input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Email"
                            bsSize="lg"
                            required
                            onChange={this.loginFormInputOnChange}
                          />
                        </FormGroup>
                        <FormGroup className="mb-3">
                          <Input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Password"
                            bsSize="lg"
                            required
                            onChange={this.loginFormInputOnChange}
                          />
                        </FormGroup>
                        <Row className="mb-3 mt-3">
                          <Col xs="12">
                            <Button
                              onChange={this.submitLogin}
                              color=""
                              size="lg"
                              className="auth-login-button"
                              type="submit"
                              block
                            >
                              Sign In
                            </Button>
                          </Col>
                          <Col className="sm-12" />
                          <Col className="sm-12">
                            <Button
                              onClick={this.handleForgotPassword}
                              color=""
                              className="auth-login-button  create-new-account-button"
                              type="button"
                            >
                              Forgot password?
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    </div>
                  ) : (
                      <div>
                        <Form
                          onSubmit={this.registrationCreateUser}
                          className="mt-3"
                        >
                          <FormGroup className="mb-3">
                            <Input
                              type="text"
                              name="fullName"
                              id="fullName"
                              placeholder="Your Full Name"
                              bsSize="lg"
                              required
                              onChange={this.handleInputRegister}
                            />
                          </FormGroup>
                          <FormGroup className="mb-3">
                            <Input
                              type="text"
                              name="business_name"
                              id="business_name"
                              placeholder="Your Company Name"
                              bsSize="lg"
                              required
                              onChange={this.handleInputRegister}
                            />
                          </FormGroup>
                          <FormGroup className="mb-3">
                            <Input
                              type="email"
                              name="email"
                              id="email"
                              placeholder="Email"
                              bsSize="lg"
                              required
                              onChange={this.handleInputRegister}
                            />
                          </FormGroup>
                          <FormGroup className="mb-3">
                            <Input
                              type="password"
                              name="password"
                              id="password"
                              placeholder="Password"
                              bsSize="lg"
                              required
                              onChange={this.handleInputRegister}
                            />
                          </FormGroup>
                          <CustomInput
                            type="checkbox"
                            id="agreeToTerms"
                            name="agreeToTerms"
                            label="I agree to the terms."
                            onChange={this.handleInputRegister}
                          />
                          {this.state.registeringUser.agreeToTerms === "on" &&
                            this.renderCreateAccountButton()}
                        </Form>
                      </div>
                    )}
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);

/* LIFECYCLE METHODS:
	componentWillReceiveProps(){ }
	componentWillMount(){ }
	componentDidMount(){ }
	componentWillUpdate(){ }
	componentDidUpdate(){ }
	componentWillUnmount(){ }
*/
