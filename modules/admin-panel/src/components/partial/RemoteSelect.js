import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import _ from 'lodash';
import { NotificationManager } from 'react-notifications';

import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';

import { makeStyles, useTheme } from '@material-ui/core/styles';

import { backend } from '../../services/gateway.api';

import withAuth from './withAuth';

const useStyles = makeStyles(theme => ({
	input: {
		display: 'flex',
		padding: 0,
		height: 'auto'
	},
	valueContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		flex: 1,
		alignItems: 'center',
		overflow: 'hidden',
		minWidth: '5rem'
	},
	noOptionsMessage: {
		padding: theme.spacing(1, 2)
	},
	singleValue: {
		fontSize: 16
	},
	placeholder: {
		position: 'absolute',
		left: 2,
		bottom: 6,
		fontSize: 16
	},
	paper: {
		position: 'absolute',
		zIndex: 1,
		marginTop: theme.spacing(1),
		left: 0,
		right: 0
	}
}));

function NoOptionsMessage(props)
{
	return (
		<Typography
			color="textSecondary"
			className={props.selectProps.classes.noOptionsMessage}
			{...props.innerProps}
			>
			{props.children}
		</Typography>
	);
}

NoOptionsMessage.propTypes = {
	children: PropTypes.node,
	innerProps: PropTypes.object,
	selectProps: PropTypes.object.isRequired,
};

function inputComponent({ inputRef, ...props })
{
	return <div ref={inputRef} {...props} />;
}

inputComponent.propTypes = {
	inputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};

function Control(props)
{
	const {
		children,
		innerProps,
		innerRef,
		selectProps: { classes, TextFieldProps },
	} = props;

	return (
		<TextField
			fullWidth
			InputProps={{
				inputComponent,
				inputProps: {
					className: classes.input,
					ref: innerRef,
					children,
					...innerProps,
				}
			}}
			{...TextFieldProps}
			/>
	);
}

Control.propTypes = {
	children: PropTypes.node,
	innerProps: PropTypes.object,
	innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
	selectProps: PropTypes.object.isRequired,
};

function Option(props)
{
	return (
		<MenuItem
			ref={props.innerRef}
			selected={props.isFocused}
			component="div"
			style={{
			fontWeight: props.isSelected ? 500 : 400,
			}}
			{...props.innerProps}
			>
			{props.children}
		</MenuItem>
	);
}

Option.propTypes = {
	children: PropTypes.node,
	innerProps: PropTypes.object,
	innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
	isFocused: PropTypes.bool,
	isSelected: PropTypes.bool,
};

function Placeholder(props)
{
	return (
		<Typography
			color="textSecondary"
			className={props.selectProps.classes.placeholder}
			{...props.innerProps}
			>
			{props.children}
		</Typography>
	);
}

Placeholder.propTypes = {
	children: PropTypes.node,
	innerProps: PropTypes.object,
	selectProps: PropTypes.object.isRequired,
};

function SingleValue(props)
{
	return (
		<Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
			{props.children}
		</Typography>
	);
}

SingleValue.propTypes = {
	children: PropTypes.node,
	innerProps: PropTypes.object,
	selectProps: PropTypes.object.isRequired,
};

function ValueContainer(props)
{
	return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

ValueContainer.propTypes = {
	children: PropTypes.node,
	selectProps: PropTypes.object.isRequired,
};

function Menu(props)
{
	return (
		<Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
			{props.children}
		</Paper>
	);
}

Menu.propTypes = {
	children: PropTypes.node,
	innerProps: PropTypes.object,
	selectProps: PropTypes.object,
};

const components = {
	Control,
	Menu,
	NoOptionsMessage,
	Option,
	Placeholder,
	SingleValue,
	ValueContainer,
};

function RemoteSelect({ selectable, endpoint, onChange, value, label, mapResult, className, isAuth })
{
	const classes = useStyles();
	const theme = useTheme();

	const [ data, setData ] = useState([]);

	useEffect(() => {
		
		if(!isAuth) return;

		backend.get(endpoint)
				.then(({ data }) => {
					if(!data || data.constructor !== Array) NotificationManager.error("Invalid server response!", "Error");
					else setData(data.map(entry => mapResult(entry)));
				})
				.catch(({ request, response }) => {
					
					if(response) NotificationManager.error(`API request failed! Status code ${response.status}`, "Error");
					else if(request) NotificationManager.error("Empty server response!", "Error");
					else NotificationManager.error("API request failed!", "Error");

				});

	}, [ endpoint, isAuth ]);

	const styles = {
		input: base => ({
			...base,
			color: theme.palette.text.primary,
			'& input': {
				font: 'inherit'
			}
		}),
	};

	return (

		<Select
			className={ className }
			classes={ classes }
			styles={ styles }
			TextFieldProps={{
				label: label ? label : selectable[0].toUpperCase() + selectable.substring(1),
				InputLabelProps: {
					shrink: true
				},
				placeholder: `Select ${selectable}...`
			}}
			options={ data }
			components={ components }
			value={ _.find(data, { value }) || _.find(data, { label: value }) || null }
			onChange={ onChange }
			/>

	);
}

RemoteSelect.propTypes = {
	selectable: PropTypes.string.isRequired,
	mapResult: PropTypes.func.isRequired,
	endpoint: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	value: PropTypes.string.isRequired,
	className: PropTypes.string,
	label: PropTypes.string
};

export default withAuth(RemoteSelect);