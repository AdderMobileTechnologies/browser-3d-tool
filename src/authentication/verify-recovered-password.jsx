import React from 'react';
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

//import Config from './../../environment';
import { withRouter } from 'react-router';
import {useLocation} from 'react-router-dom';
class VerifyRecoveredPassword extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            token:'',
            existingUser: {
                email: '',
                password: '',
                role: 'client'
            },
            isLoginForm: true,
            registeringUser: {
                fullName: '',
                business_name: '',
                email:'',
                password:'',
                agreeToTerms:'',
                role: 'client'

            },
            hasFullName: false,
            hasBusiness_name: false,
            hasEmail: false,
            hasPassword: false,
            isAgreed: false,
            readyToRegister: false,
            cookie_name: '',
            pwdRecoverURL:'',
            didSendRecoverURL: false,
            didVerifyNewPassword: false,

        };

        // These bindings are necessary to make `this` work in callbacks
        this.handleInput   = this.handleInput.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.toggleForm = this.toggleForm.bind(this);
        this.handleInputRegister   = this.handleInputRegister.bind(this);
    }


    toggleForm(e) {
        e.preventDefault();
        this.setState(state => ({
            isLoginForm: !state.isLoginForm
        }));
    }

    handleInput(e) {
        let value = e.target.value;
        let name = e.target.name;


        this.setState( prevState => ({ existingUser :
                {...prevState.existingUser, [name]: value
                }
        }));

    }

    handleInputRegister(e) {
        let value = e.target.value;
        let name = e.target.name;

        this.setState( prevState => ({ registeringUser :
                {...prevState.registeringUser, [name]: value
                }
        }));


        if(this.state.agreeToTerms === "on") {
            this.setState(state => ({
                readyToRegister: true
            }));

        }


        switch(name) {
            case 'fullName':
                this.setState(state => ({
                    hasFullName: true
                }));
                break;
            case 'business_name':
                this.setState(state => ({
                    hasBusiness_name: true
                }));
                break;
            case 'email':
                this.setState(state => ({
                    hasEmail: true
                }));
                break;
            case 'password':
                this.setState(state => ({
                    hasPassword: true
                }));
                break;
            case 'agreeToTerms':
                this.setState(state => ({
                    isAgreed: true
                }));

                break;

            default:
                break;

        }


    }


    handleFormSubmit(e) {
        e.preventDefault();

        //const endpoint = Config.API.HOST_NAME + "/auth/change-password/" + this.state.pwdRecoverURL;
        const endpoint = "Config.API.HOST_NAME" + "/auth/change-password/" + this.state.pwdRecoverURL;

        const dataPackage = {
            password: this.state.existingUser.password
        };
        const config = {
            method: "POST",
            url: endpoint,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: dataPackage
        };

        axios(config).then((response) => {
            alert('Your password has been successfully reset.');
            this.state.didVerifyNewPassword = true;
            this.props.history.push('/login');
        }).catch((error) => {
            alert("We apologize, but we were unable to reset your password at this time. Please try again.");
        });
    }

    componentDidMount() {
        this.state.pwdRecoverURL = this.props.location.search.split('?')[1].split('=')[1];
    }


    render() {




        return   <div id="loginform" className="login-form">

                        <Row>
                            <Col xs="12" md="8">
                                <div className="logo">
                                    {/** <span className="db"><img src={img1} alt="logo" /></span>*/}

                                </div>
                            </Col>
                            <Col xs="12" md="4" >

                                {this.state.isLoginForm ?
                                    <div>
                                        <h2>Verify New Password </h2>
                                        <Form
                                            onSubmit={this.handleFormSubmit}
                                            ref={c => {
                                                this.form = c;
                                            }}
                                            className="mt-3"
                                            id="verifyNewPaswordForm"

                                        >


                                            <FormGroup className="mb-3">
                                                <Input
                                                    type="password"
                                                    name="password"
                                                    id="password"
                                                    placeholder="Enter new password here."
                                                    bsSize="lg"
                                                    required
                                                    onChange = {this.handleInput}


                                                />
                                                {/** value={this.state.existingUser.password} */}
                                            </FormGroup>
                                            {/** <CustomInput type="checkbox" id="exampleCustomCheckbox" label="Remember Me" />*/}

                                            <Row className="mb-3 mt-3">
                                                <Col xs="12">
                                                    <Button
                                                        onChange = {this.handleFormSubmit}
                                                        color=""
                                                        size="lg"
                                                        className="auth-login-button"
                                                        type="submit"
                                                        block>
                                                        SUBMIT
                                                    </Button>
                                                </Col>
                                                <Col className="sm-12">

                                                </Col>

                                            </Row>

                                        </Form>
                                    </div>
                                    :
                                    <div>
                                        <Form
                                            onSubmit={this.handleRegisterFormSubmit}
                                            ref={c => {
                                                this.form = c;
                                            }}
                                            className="mt-3"
                                            id="registerForm"
                                            action="/auth/register"
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
                                                {/* value={this.state.existingUser.email} */}
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
                                                {/* value={this.state.existingUser.email} */}
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
                                                {/* value={this.state.existingUser.email} */}
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
                                                {/** value={this.state.existingUser.password} */}
                                            </FormGroup>


                                            <CustomInput type="checkbox" id="agreeToTerms" name="agreeToTerms" label="I agree to the terms." onChange = {this.handleInputRegister} />

                                            {this.state.readyToRegister
                                                ?
                                                ' '
                                                :
                                                ''
                                            }
                                            <Button

                                                onChange = {this.handleRegisterFormSubmit}
                                                color=" "
                                                size=""
                                                className="auth-login-button create-new-account-button"
                                                type="submit"
                                            >
                                                CREATE NEW ACCOUNT
                                            </Button>


                                        </Form>
                                    </div>


                                }

                                {/** {this.state.didVerifyNewPassword ? "<a href='/login'>Success, Go To Login</a> " : ""} */}
                            </Col>

                        </Row>

                    </div>
                
    }
}

export default withRouter(VerifyRecoveredPassword);