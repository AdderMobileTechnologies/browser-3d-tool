import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import * as serviceWorker from './serviceWorker';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import theme from './theme';
import RecoverPassword from './authentication/recover-password';
import Login from './authentication/login';
import Main from './components/Main';
import VerifyRecoveredPassword from './authentication/verify-recovered-password';

import {
  BrowserRouter as Router,
  Route
} from "react-router-dom";
//import {Router} from "react-router";
ReactDOM.render(
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
        <Router> 
          <Route exact path="/" component={Login} />
          <Route path="/recover-password" component={RecoverPassword} />
          <Route path="/verify-recovered-password" component={VerifyRecoveredPassword} />
          <Route path="/main" component={Main} />
          <App />
        </Router>
    </ThemeProvider>,
    document.querySelector('#root'),
  );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();


 
