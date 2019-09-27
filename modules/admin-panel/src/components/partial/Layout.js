import React from 'react';
import PropTypes from 'prop-types';

import Container from '@material-ui/core/Container';
import NavDrawer from './NavDrawer';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
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
	}
});

function Layout({ children })
{
	const classes = useStyles();

	return (

		<div className={ classes.root }>
			<NavDrawer />
			<Container className={ classes.container } fixed>
				{ children }
			</Container>
		</div>

	);
}

Layout.propTypes = {
	children: PropTypes.object.isRequired
};

export default Layout;