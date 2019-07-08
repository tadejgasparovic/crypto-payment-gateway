import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import SettingsIcon from '@material-ui/icons/Settings';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';

import { makeStyles } from '@material-ui/core/styles';

import { logout } from '../../services/gateway.api';

const drawerWidth = 270;

const drawerLinks = [
	{
		title: "Dashboard",
		icon: DashboardIcon,
		path: "/dashboard"
	},
	{
		title: "Payments",
		icon: LocalAtmIcon,
		path: "/payments"
	},
	{
		title: "Merchants",
		icon: ShoppingCartIcon,
		path: "/merchants"
	},
	{
		title: "Crypto-currency providers",
		icon: PermIdentityIcon,
		path: "/clients"
	},
	{
		title: "Crypto-currencies",
		icon: MonetizationOnIcon,
		path: "/coins"
	},
	{
		title: "Administrators",
		icon: SupervisorAccountIcon,
		path: "/admins"
	}
];

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		padding: theme.spacing(3),
	},
	contentRoot: {
		display: 'flex',
		flexDirection: 'column',
		width: drawerWidth,
		flexGrow: 1
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	contentFoot: {
		marginTop: 'auto'
	},
	chevron: {
		margin: theme.spacing(2)
	},
	chevronContainer: {
		textAlign: 'right'
	},
	toolbar: theme.mixins.toolbar
}));

function DrawerLinkRaw({ title, icon: Icon, path, history, location })
{
	return (

		<ListItem button onClick={ () => history.push(path) } selected={ location.pathname === path }>
			<ListItemIcon><Icon /></ListItemIcon>
			<ListItemText primary={ title } />
		</ListItem>

	);
}

DrawerLinkRaw.propTypes = {
	title: PropTypes.string.isRequired,
	icon: PropTypes.elementType.isRequired,
	path: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired
};

const DrawerLink = withRouter(DrawerLinkRaw);

function DrawerContentRaw({ onClose, history })
{
	const classes = useStyles();

	return (

		<div className={ classes.contentRoot }>
			<div className={ classes.toolbar }>
				<div className={ classes.chevronContainer }>
					<IconButton onClick={ () => onClose() } className={ classes.chevron }>
						<ChevronLeftIcon />
					</IconButton>
				</div>
			</div>
			<Divider />
			<List>
				{
					drawerLinks.map(link => <DrawerLink { ...link } key={ link.path } />)
				}
			</List>
			<div className={ classes.contentFoot }>
				<Divider />
				<List>
					{ /* <ListItem button onClick={ () => history.push('/settings') }>
						<ListItemIcon>
							<SettingsIcon />
						</ListItemIcon>
						<ListItemText>
							Settings
						</ListItemText>
					</ListItem> */ }
					<ListItem button onClick={ () => logout().finally(() => history.push('/')) }>
						<ListItemIcon>
							<VpnKeyIcon />
						</ListItemIcon>
						<ListItemText>
							Logout
						</ListItemText>
					</ListItem>
				</List>
			</div>
		</div>

	);
}

DrawerContentRaw.propTypes = {
	onClose: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired
};

const DrawerContent = withRouter(DrawerContentRaw);


function NavDrawer()
{
	const classes = useStyles();
	const [ drawerOpen, setDrawerOpen ] = useState(false);

	return (

		<div className={ classes.root }>
			<AppBar position="fixed">
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="Open drawer"
						edge="start"
						onClick={ () => setDrawerOpen(!drawerOpen) }
						className={ classes.menuButton }>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" noWrap>
						Crypto Payment Gateway Admin Panel
					</Typography>
				</Toolbar>
			</AppBar>
			<Drawer open={ drawerOpen } onClose={ () => setDrawerOpen(false) }>
				<DrawerContent onClose={ () => setDrawerOpen(false) } />
			</Drawer>
		</div>

	);
}

export default NavDrawer;