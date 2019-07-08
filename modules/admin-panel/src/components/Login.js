import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { NotificationManager } from 'react-notifications';

import { login, recoverToken, isValid } from '../services/gateway.api';

import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import LockOutlinedIcon from '@material-ui/icons/LockOutlined';


import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles(theme => ({
	
	paper: {
		marginTop: theme.spacing(8),
		padding: theme.spacing(3),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center'
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main
	},
	form: {
		width: '100%',
		marginTop: theme.spacing(1)
	},
	submit: {
		margin: theme.spacing(3, 0, 2)
	},
	fieldset: {
		border: 'none'
	}

}));


function Login({ history })
{
	const [ username, setUsername ] = useState("");
	const [ password, setPassword ] = useState("");
	const [ rememberMe, setRememberMe ] = useState(false);
	const [ disabled, setDisabled ] = useState(false);

	useEffect(() => {
		
		isValid()
			.then(() => history.push('/dashboard'))
			.catch(() => {

				recoverToken()
					.then(() => history.push('/dashboard'))
					.catch(() => {});

			})

	}, []);

	const classes = useStyles();

	const signIn = e => {
		e.preventDefault();

		if(username.length < 1 || username.length < 1)
		{
			NotificationManager.error("Username or password too short!", "Error");
			return;
		}

		setDisabled(true);

		login(username, password, rememberMe)
			.then(() => {
				history.push('/dashboard');
			})
			.catch(e => {
				NotificationManager.error(e.message, "Login Failed");
			})
			.finally(() => {
				setDisabled(false);
			});
	}

	return (

		<Container component="main" maxWidth="xs">
			<Paper className={ classes.paper }>
				<Avatar className={ classes.avatar }>
					<LockOutlinedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Sign In
				</Typography>
				<form className={ classes.form } method="POST" noValidate>
					<fieldset disabled={ disabled } className={ classes.fieldset }>
						<TextField
							variant="outlined"
							margin="normal"
							required
							fullWidth
							id="username"
							label="Username"
							name="username"
							autoComplete="username"
							autoFocus
							value={ username }
							onChange={ ({ target: { value } }) => setUsername(value) }
							/>
						<TextField
							variant="outlined"
							margin="normal"
							required
							fullWidth
							id="password"
							label="Password"
							name="password"
							autoComplete="current-password"
							type="password"
							value={ password }
							onChange={ ({ target: { value } }) => setPassword(value) }
							/>
						<FormControlLabel
							control={ <Checkbox value="remember" color="primary" checked={ rememberMe } onChange={ ({ target: { checked } }) => setRememberMe(checked) } /> }
							label="Remember me"
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							color="primary"
							className={ classes.submit }
							onClick={ signIn }>
								Sign In
						</Button>
					</fieldset>
				</form>
			</Paper>
		</Container>

	);
}

Login.propTypes = {
	history: PropTypes.object.isRequired
};

export default withRouter(Login);