import React from 'react';
import PropTypes from 'prop-types';

import Layout from './partial/Layout';
import CrudTable from './partial/CrudTable';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	wrapper: {
		padding: theme.spacing(3),
		margin: theme.spacing(5),
		position: 'absolute',
		top: '64px',
		width: '80vw'
	}
}));

function CrudPage({
		title,
		columns,
		isEditable,
		isDeletable,
		endpoint,
		endpointQuery,
		uidField,
		operations,
		makeErrorMsg,
		actions,
		options
	})
{
	const classes = useStyles();

	return (

		<Layout>
			<div className={ classes.wrapper }>
				<CrudTable
					uidField={ uidField }
					endpoint={ endpoint }
					endpointQuery={ endpointQuery }
					title={ title }
					columns={ columns }
					isEditable={ isEditable }
					isDeletable={ isDeletable }
					operations={ operations }
					makeErrorMsg={ makeErrorMsg }
					options={ options }
					actions={ actions }
					/>
			</div>
		</Layout>

	);
}

CrudPage.propTypes = {
	isEditable: PropTypes.func,
	isDeletable: PropTypes.func,
	title: PropTypes.string.isRequired,
	columns: PropTypes.array.isRequired,
	endpoint: PropTypes.string.isRequired,
	endpointQuery: PropTypes.object,
	operations: PropTypes.array,
	makeErrorMsg: PropTypes.func,
	actions: PropTypes.array,
	operations: PropTypes.object
};

export default CrudPage;