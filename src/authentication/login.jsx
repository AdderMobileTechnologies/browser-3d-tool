import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
//import './../assets/scss/style.css';
import {
	Input,
	CustomInput,
	FormGroup,
	Form,
	Row,
	Col,
	Button
} from 'reactstrap';
import axios from "axios";
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        token:'',
        existingUser: {
            email: 'not@set.yet',
            password: 'notsetyet',
            role: 'client'
        },
        isLoginForm: true,
        registeringUser: {
            fullName: '',
            business_name: '',
            email:'not@set.yet',
            password:'',
            agreeToTerms:"off",
            role: 'client'

        },
        hasFullName: false,
        hasBusiness_name: false,
        hasEmail: false,
        hasPassword: false,
        isAgreed: false,
        readyToRegister: false,
        cookie_name: ''

    };

    if(localStorage.getItem("token") !== null) {
        //TODO: Add endpoint to API that will check the clientid and token in localStorage, verify they are valid, then redirect to the dashboard.
        this.props.history.push('/dashboard');
        return;
    } else {
        localStorage.clear();
    }

    this.loginFormInputOnChange   = this.loginFormInputOnChange.bind(this);
    this.submitLogin = this.submitLogin.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
    this.handleInputRegister   = this.handleInputRegister.bind(this);
    this.registrationCreateUser = this.registrationCreateUser.bind(this);
    this.handleForgotPassword = this.handleForgotPassword.bind(this);

  }

  loginFormInputOnChange(){
    console.log("loginFormInputOnChange");
  }
  submitLogin(){
    console.log("submitLogin");
  }
  
  toggleForm(e) {
    console.log("toggleForm");
    e.preventDefault();
    this.setState(state => ({
        isLoginForm: !state.isLoginForm
    }));
}
  handleInputRegister(){
    console.log("handleInputRegister");
  }
  registrationCreateUser(){
    console.log("registrationCreateUser");
  }
  handleForgotPassword(){
    console.log("handleForgotPassword");
  }

  componentDidMount(){ 
      console.log("componentDidMount");
  }
  render() {
    return  <div id="loginform" className="login-form">
                    <Row>
                        <Col xs="12" md="8">
                            <div className="logo"/>
                        </Col>
                        <Col xs="12" md="4" >
                            {this.state.isLoginForm ?
                                <div>
                                    <Button
                                        onClick={this.toggleForm}
                                        color=""
                                        className="auth-login-button create-new-account-button"
                                        type="button"
                                    >
                                        CREATE NEW ACCOUNT
                                    </Button>
                                    <Form
                                        onSubmit={this.submitLogin}
                                        className="mt-3"
                                    >
                                        <FormGroup className="mb-3">
                                            <Input
                                                type="email"
                                                name="email"
                                                id="email"
                                                placeholder="Email"
                                                bsSize="lg"
                                                required
                                                onChange = {this.loginFormInputOnChange}
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
                                                onChange = {this.loginFormInputOnChange}
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
                                                    block>
                                                    Sign In
                                                </Button>
                                            </Col>
                                            <Col className="sm-12"/>
                                            <Col className="sm-12">
                                                <Button
                                                    onClick = {this.handleForgotPassword}
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
                                :
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
                                                onChange = {this.handleInputRegister}
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
                                                onChange = {this.handleInputRegister}
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
                                                onChange = {this.handleInputRegister}
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
                                                onChange = {this.handleInputRegister}
                                            />
                                        </FormGroup>
                                        <CustomInput type="checkbox" id="agreeToTerms" name="agreeToTerms" label="I agree to the terms." onChange={this.handleInputRegister} />
                                        {this.state.registeringUser.agreeToTerms === "on" && this.renderCreateAccountButton()}
                                    </Form>
                                </div>
                            }
                        </Col>
                    </Row>
                </div>;
            
}
}

export default Login;

/* LIFECYCLE METHODS:
	componentWillReceiveProps(){ }
	componentWillMount(){ }
	componentDidMount(){ }
	componentWillUpdate(){ }
	componentDidUpdate(){ }
	componentWillUnmount(){ }
*/
