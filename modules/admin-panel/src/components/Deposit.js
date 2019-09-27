import React, { useState, useEffect } from 'react';
import { NotificationManager } from 'react-notifications';
import clsx from 'clsx';
import QRCode from 'qrcode';

import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Collapse from '@material-ui/core/Collapse';
import CircularProgress from '@material-ui/core/CircularProgress';

import UserSelect from './partial/UserSelect';
import NavDrawer from './partial/NavDrawer';
import RemoteSelect from './partial/RemoteSelect';
import withAuth from './partial/withAuth';

import { makeStyles } from '@material-ui/core/styles';

import { createPayment, pollPayment } from '../services/gateway.api';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		flexGrow: 1,
		height: '100vh'
	},
	container: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center'
	},
	wrapper: {
		padding: theme.spacing(3),
		margin: theme.spacing(5),
		position: 'absolute',
		top: '64px',
		width: '80vw'
	},
	paper: {
		padding: '1rem',
		maxWidth: '50rem',
		margin: 'auto'
	},
	button: {
		marginTop: '1rem',
		marginBottom: '1rem'
	},
	marginTop: {
		marginTop: '1rem'
	}
}));

let paymentPollTimeout = null;

function Deposit()
{
	const classes = useStyles();

	const [ merchant, setMerchant ] = useState("");
	const [ amount, setAmount ] = useState("");
	const [ currency, setCurrency ] = useState("");
	const [ email, setEmail ] = useState("");
	const [ statusHook, setStatusHook ] = useState("");

	const [ payment, setPayment ] = useState(null);
	const [ qrcode, setQrcode ] = useState(null);

	// Generate a payment status
	let paymentStatus = "N/A";

	if(payment)
	{
		if(payment.paidAt) paymentStatus = 'finalized';
		else if(payment.receivedAt) paymentStatus = 'waiting for confirmations';
		else paymentStatus = 'waiting for payment';

		if((new Date(payment.expiresAt) - new Date()) <= 0)
		{
			paymentStatus = "expired";
			if(paymentPollTimeout) clearTimeout(paymentPollTimeout);
		}
	}

	useEffect(() => {

		if(!payment || !payment.address) return;

		QRCode.toDataURL(payment.address)
				.then(url => setQrcode(url))
				.catch(e => {
					NotificationManager.error("Failed to generate QR code!", "Error");
					console.error(e);
				});

	}, [ payment && payment.address ]);

	useEffect(() => {

		if(!payment)
		{
			if(paymentPollTimeout)
			{
				clearTimeout(paymentPollTimeout);
				paymentPollTimeout = null;
			}
			return;
		}

		const poll = () => {
			paymentPollTimeout = null;
			
			if(!paymentStatus.includes('waiting')) return;

			pollPayment(payment._id)
				.then(({ data }) => setPayment(data))
				.catch(console.error)
				.finally(() => paymentPollTimeout = setTimeout(poll, 5 * 1000));
		};

		if(!paymentStatus.includes('waiting')) return;

		// Poll the payment every 5 seconds
		paymentPollTimeout = setTimeout(poll, 5 * 1000);

	}, [ JSON.stringify(payment) ]);

	const onCreatePayment = () => {
		setPayment(null);

		if(!merchant || !amount || !currency || !email)
		{
			NotificationManager.error("Merchant, amount, currency and email are all required fields!", "Error");
			return;
		}

		if(isNaN(amount))
		{
			NotificationManager.error("Amount must be a valid number!", "Error");
			return;
		}

		createPayment(merchant, amount, currency, email, statusHook)
			.then(({ data }) => setPayment(data))
			.catch(({ request, response }) => {
				
				if(response) NotificationManager.error(`API request failed! Status code ${response.status}`, "Error");
				else if(request) NotificationManager.error("Empty server response!", "Error");
				else NotificationManager.error("API request failed!", "Error");

			});
	};

	return (

		<div className={ classes.root }>
			<NavDrawer />
			<Container className={ classes.container } fixed>
				<div className={ classes.wrapper }>
					<Paper className={ classes.paper }>
						<Typography variant="h6" component="h1">Create a deposit</Typography>
						<UserSelect type="merchant" onChange={ ({ value }) => setMerchant(value) } value={ merchant } />
						<div className={ classes.inlineContainer }>
							<TextField
								type="number"
								value={ amount }
								onChange={ ({ target: { value } }) => setAmount(value) }
								placeholder="Payment Amount"
								className={ classes.marginTop }
								fullWidth
								/>
							<RemoteSelect
								selectable="currency"
								endpoint="/coins"
								mapResult={ ({ symbol }) => ({ label: symbol, value: symbol }) }
								value={ currency }
								onChange={ ({ value }) => setCurrency(value) }
								className={ classes.marginTop }
								/>
							<TextField
								type="email"
								value={ email }
								onChange={ ({ target: { value } }) => setEmail(value) }
								placeholder="Customer email"
								className={ classes.marginTop }
								fullWidth
								/>
							<TextField
								value={ statusHook }
								onChange={ ({ target: { value } }) => setStatusHook(value) }
								placeholder="Status Hook URL"
								className={ classes.marginTop }
								fullWidth
								/>
						</div>
						<Button
							onClick={ onCreatePayment }
							variant="contained"
							color="primary"
							className={ classes.button }
							fullWidth
							>
							Create Payment
						</Button>
						<Divider />
						<Collapse in={ !!payment }>
							<Container classes={ { root: classes.marginTop } }>
								<Typography component="h2" variant="h6">
									Payment ID: <strong>{ payment && payment._id }</strong>
								</Typography>
							</Container>
							<Container classes={ { root: clsx(classes.container, classes.marginTop) } }>
								{ qrcode ? <img src={ qrcode } alt="Deposit address QRCode" /> : <CircularProgress variant="indeterminate" /> }
								<Typography component="p" variant="h6">{ payment && payment.address }</Typography>
								<Typography>Amount: <strong>{ payment && payment.amount }</strong> { payment && payment.currency }</Typography>
								<Typography>Payment Status: <strong>{ paymentStatus.toUpperCase() }</strong></Typography>
								<Typography>Confirmations: <strong>{ payment && payment.confirmations }/{ payment && payment.requiredConfirmations } { paymentStatus.includes('waiting') && <CircularProgress variant="indeterminate" size={ 15 } /> }</strong></Typography>
								<Typography>Notification Email: <strong>{ payment && payment.customerEmail }</strong></Typography>
							</Container>
						</Collapse>
					</Paper>
				</div>
			</Container>
		</div>

	);
}

export default withAuth(Deposit);