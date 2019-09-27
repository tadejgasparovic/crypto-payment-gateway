import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import { NotificationContainer } from 'react-notifications';
import '../../node_modules/react-notifications/src/notifications.scss';

import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';

import { makeStyles } from '@material-ui/core/styles';

import Login from './Login';
import Dashboard from './Dashboard';
import Merchants from './Merchants';
import Clients from './Clients';
import Coins from './Coins';
import Admins from './Admins';
import Payments from './Payments';
import Deposit from './Deposit';
import Rescans from './Rescans';

const useStyles = makeStyles(theme => ({

	root: {
		flexGrow: 1
	}

}));

export default () => {

	const classes = useStyles();

  return (
	  <BrowserRouter>
	  	<CssBaseline />
	  	<Grid container className={ classes.root }>
	  		<Grid container item xs={ 12 }>
			    <Switch>
			      <Route exact path="/" component={ Login } />
			      <Route exact path="/dashboard" component={ Dashboard } />
			      <Route exact path="/merchants" component={ Merchants } />
			      <Route exact path="/clients" component={ Clients } />
			      <Route exact path="/coins" component={ Coins } />
			      <Route exact path="/admins" component={ Admins } />
			      <Route exact path="/payments" component={ Payments } />
			      <Route exact path="/deposit" component={ Deposit } />
			      <Route exact path="/rescans" component={ Rescans } />
			    </Switch>
		    </Grid>
	    </Grid>
	    <NotificationContainer />
	  </BrowserRouter>
  );
}
