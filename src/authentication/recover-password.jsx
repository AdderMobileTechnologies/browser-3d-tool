import React from "react";
//import Config from './../../environment.js';
import {
	Input,
	FormGroup,
	Form,
	Row,
	Col,
	Button
} from 'reactstrap';
import { withRouter } from 'react-router';

class RecoverPassword extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
			email: '',
			history: this.props.history,
			submitButtonEnabled: true
		};
		this.handleInput = this.handleInput.bind(this);
		this.handleFormSubmit = this.handleFormSubmit.bind(this);
		this.redirect = this.redirect.bind(this);
    }
    
	handleInput(e) {
		e.preventDefault();
		this.setState({
			email: e.target.value
		});
	}

	async handleFormSubmit(e) {
		e.preventDefault();

		//region Return Early if No Email Is Entered
		if(this.state.email.length === 0) {
			return alert("Please enter your email address before continuing.")
		}
		//endregion

		//region Disable the Submit Button
		await this.setState({
			submitButtonEnabled: false
		});
		//endregion

		//region Make the Request
		const dataPackage = {
			email: this.state.email
		};

		let response;
		try {
			//response = await fetch(Config.API.HOST_NAME + "/auth/forgot-password/?email=" + dataPackage.email);
            response = await fetch("Config.API.HOST_NAME" + "/auth/forgot-password/?email=" + dataPackage.email);

        } catch(err) {
			console.error(err);
			alert("We're sorry, but we could not process your request at this time.");
		}

		console.log("GOOD", response);

		if (response.status === 200 || response.status === 404) {
			alert("If this account exists, an email has been sent to it with instructions on how to reset your password.");
			return this.redirect();
		} else {
			alert("We're sorry, but we could not process your request at this time.");
		}

		this.setState({
			submitButtonEnabled: true
		});
		//endregion
	}

	redirect(){
		// Gives the illusion that the process takes longer than near instant.
		setTimeout(() => {
			this.state.history.push('/#/login');
		}, 1000);
	}


    render() {
		return  <div id="loginform" className="login-form">
						<Row>
							<Col xs="12" md="8">
								<div className="logo"/>
							</Col>
							<Col xs="12" md="4" >
								<div>
									<h2 id="messageDiv">Recover Password </h2>
									<Form
										onSubmit={this.handleFormSubmit}
										className="mt-3"
										id="loginform"
									>
										<FormGroup className="mb-3">
											<Input
												type="email"
												name="email"
												id="email"
												placeholder="Email for a password reset"
												bsSize="lg"
												required
												onChange = {this.handleInput}

											/>
										</FormGroup>
										<Row className="mb-3 mt-3">
											<Col xs="12">
												<Button
													disabled={!this.state.submitButtonEnabled}
													color=""
													size="lg"
													className="auth-login-button"
													type="submit"
													block>
													Submit
												</Button>
											</Col>
											<Col className="sm-12"/>
										</Row>
									</Form>
								</div>
							</Col>
						</Row>
					</div>
				 
	}
}

export default withRouter(RecoverPassword);

/* LIFECYCLE METHODS:
	componentWillReceiveProps(){ }
	componentWillMount(){ }
	componentDidMount(){ }
	componentWillUpdate(){ }
	componentDidUpdate(){ }
	componentWillUnmount(){ }
*/
