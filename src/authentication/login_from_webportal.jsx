import React from 'react';
import Config from './../../environment.js';
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


	toggleForm(e) {
		e.preventDefault();
		this.setState(state => ({
			isLoginForm: !state.isLoginForm
		}));
	}

	loginFormInputOnChange(e) {
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
			this.setState({
				readyToRegister: true
			});
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
				this.setState( prevState => ({ registeringUser :
					{...prevState.registeringUser, registeringUser : {
							agreeToTerms:"on",
						}
					}
				}));
				break;
			default:
				break;

		}
	}


	//region Reviewed for 2.0
	submitLogin(e) {
		e.preventDefault();

		const endpoint = Config.API.HOST_NAME + "/v2/auth/login/client";
		const dataPackage = {
			email: this.state.existingUser.email,
			password: this.state.existingUser.password,
			role: "client"
		};

		const config = {
			method: 'POST',
			url: endpoint,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			data: dataPackage
		};

		axios(config)
			.then((response) => {
				localStorage.setItem("token", response.data.token);
				localStorage.setItem("clientid", response.data.clientid);
				localStorage.setItem("version", Config.Frontend.VERSION);
				this.props.history.push('/dashboard');
			})
			.catch((error) => {
				localStorage.clear();
				alert('We\'re sorry, but that is the wrong password for this account.');
			});
	}
	registrationCreateUser(e) {
		e.preventDefault();
		let userData = this.state.registeringUser;

		const dataPackage = {
			email: userData.email,
			password: userData.password,
			role: "client",
			is_verified: "false"
		};

		const endpoint = Config.API.HOST_NAME + "/auth/register";
		
		fetch(endpoint,{
			method: "POST",
			body: JSON.stringify(dataPackage),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
		}).then(response => {
			response.json().then(data =>{
				if(data.success){
					localStorage.setItem('token', data.token);
					this.registrationCreateClient(data.token);
				} else{
					alert('It appears as though that email is already in use!');
				}
			});
		});
	}
	registrationCreateClient(token){
		//TODO: WHAT IF USER ENTERED INVALID INPUT FOR FULL NAME FIELD?
		const res = this.state.registeringUser.fullName.split(" ");
		const first_name = res[0];
		const last_name = res[1];

		const endpoint = Config.API.HOST_NAME + "/api/client/register";
		
		const dataPackage = {
			email: this.state.registeringUser.email,
			first_name : first_name,
			last_name: last_name,
			business_name: this.state.registeringUser.business_name
		};

		fetch(endpoint,{
			method: "POST",
			body: JSON.stringify(dataPackage),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'JWT '+ token
			},
		}).then(response => {
			response.json().then(data =>{
				if(data.success){
					this.registrationUpdateTokensAndLogin();
				} else{
					alert("We're sorry, but we encountered an internal error. Please try again.");
				}
			});
		});
	}
	registrationUpdateTokensAndLogin(){
		const endpoint = Config.API.HOST_NAME + "/v2/auth/login/client";
		const dataPackage = {
			email: this.state.registeringUser.email,
			password: this.state.registeringUser.password,
			role: "client"
		};

		const config = {
			method: 'POST',
			url: endpoint,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			data: dataPackage
		};

		axios(config)
			.then((response) => {
				localStorage.setItem("token", response.data.token);
				this.props.history.push('/dashboard');
			})
			.catch((error) => {
				localStorage.clear();
				alert('We\'re sorry, but we encountered an error. Please try logging in with the account you have just created. If you are unable to sign in, please contact us at support@addermobile.com');
		});
	}
	handleForgotPassword() {
		this.props.history.push('/authentication/recover-password');
	}
	//endregion

	renderCreateAccountButton() {
        return(
            <Button
				onChange = {this.registrationCreateUser}
				color=" "
				size=""
				className="auth-login-button create-new-account-button"
				type="submit"
			>
				CREATE NEW ACCOUNT
			</Button>
        )
    }
	componentDidMount(){
		 
		 
	}

	render() {
		return <div className="" >
			<div className="auth-wrapper d-flex no-block justify-content-center align-items-center"   > {/**style={sidebarBackground} */}
				<div className="auth-box x-on-sidebar">
					<div id="loginform" className="login-form">
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
					</div>
				</div>
			</div>
		</div>;
	}
}

export default Login;