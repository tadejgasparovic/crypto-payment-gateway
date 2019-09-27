import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import MaterialTable from 'material-table';
import { NotificationManager } from 'react-notifications';
import formatDate from 'date-format';
import _ from 'lodash';

import TextField from '@material-ui/core/TextField';

import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import EditIcon from '@material-ui/icons/Edit';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import FilterListIcon from '@material-ui/icons/FilterList';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import SearchIcon from '@material-ui/icons/Search';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import RemoveIcon from '@material-ui/icons/Remove';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';

import { backend } from '../../services/gateway.api';

import withAuth from './withAuth';

import config from '../../config';

function CrudTable({
		title,
		columns,
		isEditable,
		isDeletable,
		endpoint,
		endpointQuery,
		uidField = 'username',
		isAuth,
		operations = [ 'create', 'update', 'delete' ],
		makeErrorMsg,
		actions,
		options = {}
	})
{
	const makeTargetEndpoint = useCallback(modifier => {
		modifier = modifier || "";
		const separator = endpoint.endsWith('/') ? "" : "/";
		const mod = modifier.startsWith('/') ? modifier.slice(1) : modifier;
		const query = _.toPairs(endpointQuery || {})
						.map(([ key, value ]) => [ key, encodeURIComponent(value) ].join('='))
						.join('&');

		return `${endpoint}${separator}${mod}?${query}`;
	}, [ endpoint, endpointQuery ]);

	const [ data, setData ] = useState([]);
	const [ loading, setLoading ] = useState(true);
	const [ nonce, setNonce ] = useState(0);

	useEffect(() => {
		setLoading(true);

		if(!isAuth) return;

		backend.get(makeTargetEndpoint())
				.then(({ data }) => setData(data))
				.catch(({ request, response }) => {

					if(response) NotificationManager.error(`API request failed! Status code ${response.status}`, "Error");
					else if(request) NotificationManager.error("Empty server response!", "Error");
					else NotificationManager.error("API request failed!", "Error");

				})
				.finally(() => setLoading(false));

	}, [ isAuth, nonce, endpoint, makeTargetEndpoint ]);

	const mappedColumns = columns.map((col, i) => {
		if(col.type === 'datetime')
		{
			return {
				...col,
				render: row => {
					if(!row) return null;

					const formatted = row[col.field] ? formatDate(config.dateFormat, new Date(row[col.field])) : "N/A";

					if(typeof col.render === 'function')
					{
						row[col.field] = formatted;

						return col.render(row);
					}

					return formatted;
				}
			};
		}
		else if(((!col.type && !col.lookup) || col.type === 'numeric') && !col.editComponent)
		{
			const { password, title } = col;

			const editComponent = ({ onChange, value = "", columnDef }) =>
									<TextField
										placeholder={ title }
										value={ value }
										onChange={ ({ target }) => onChange(target.value) }
										InputProps={{
											style: {
												fontSize: 13
											},
											type: password ? "password" : (columnDef.type === 'numeric' ? "number" : "text")
										}}
										autoFocus={ i === 0 }
										/>

			return {
				...col,
				editComponent,
				render: password ? row => "*".repeat(8) : col.render,
			};
		}
		
		return col;
	});

	const makePostData = (newData, ...validEditable) => {
							const mapFields = {};

							const payload = _.pickBy(newData, (val, key) => {
								const colDef = _.find(columns, ({ field }) => field === key) || { editable: "always" };

								if(colDef.postField) mapFields[key] = colDef.postField;

								colDef.editable = colDef.editable || "always";

								return validEditable.includes(colDef.editable) || colDef.field === uidField;
							});

							return _.fromPairs(_.toPairs(payload).map(([ key, value ]) => ([ mapFields[key] || key, value ])));
						}

	const errorMessage = e => {
		if(e.response)
		{
			const { response: { status, data } } = e;
			
			if(typeof makeErrorMsg === 'function')
			{
				const errorMsg = makeErrorMsg(status, data);

				if(errorMsg)
				{
					NotificationManager.error(errorMsg, "Error");
					return;
				}
			}
			
			if(status === 400 && data.error)
			{
				NotificationManager.error(`${data.error}`, "Error");
				return;
			}
			else if(status === 500)
			{
				NotificationManager.error('Internal server error!', "Error");
				return;
			}
		}

		NotificationManager.error("Something went wrong!", "Error");
	}

	const can = (op, cb) => operations && operations.includes(op) ? cb : undefined;

	const canEdit = () => isEditable &&
							operations.includes('update') ?
							isEditable :
							(
								!operations.includes('update') ?
								() => false :
								isEditable
							);
	const canDelete = () => isDeletable &&
							operations.includes('delete') ?
							isDeletable :
							(
								!operations.includes('delete') ?
								() => false :
								isDeletable
							);

	const editable = {
		isEditable: canEdit(),
		isDeletable: canDelete(),
		onRowAdd: can('create', async newData => {
			setLoading(true);

			try
			{
				const postData = makePostData(newData, 'onAdd', 'always');
				await backend.post(makeTargetEndpoint(), postData);
			}
			catch(e)
			{
				errorMessage(e);

				throw e;
			}
			finally
			{
				setLoading(false);
				setNonce(nonce + 1);
			}
		}),
		onRowUpdate: can('update', async (newData, oldData) => {
			setLoading(true);

			try
			{
				const postData = makePostData(newData, 'onUpdate', 'always');
				await backend.post(makeTargetEndpoint(oldData[uidField]), postData);
			}
			catch(e)
			{
				errorMessage(e);
				
				throw e;
			}
			finally
			{
				setLoading(false);
				setNonce(nonce + 1);
			}
		}),
		onRowDelete: can('delete', async oldData => {
			setLoading(true);

			try
			{
				await backend.delete(makeTargetEndpoint(oldData[uidField]));
			}
			catch(e)
			{
				errorMessage(e);

				throw e;
			}
			finally
			{
				setLoading(false);
				setNonce(nonce + 1);
			}
		})
	};

	return (

		<MaterialTable
			title={ title }
			columns={ mappedColumns }
			data={ data }
			isLoading={ loading }
			editable={ _.pickBy(editable) }
			icons={{
				Add: AddIcon,
				Check: CheckIcon,
				Clear: ClearIcon,
				Delete: DeleteOutlineIcon,
				DetailPanel: ChevronRightIcon,
				Edit: EditIcon,
				Export: SaveAltIcon,
				Filter: FilterListIcon,
				FirstPage: FirstPageIcon,
				LastPage: LastPageIcon,
				NextPage: ChevronRightIcon,
				PreviousPage: ChevronLeftIcon,
				ResetSearch: ClearIcon,
				Search: SearchIcon,
				SortArrow: ArrowUpwardIcon,
				ThirdStateCheck: RemoveIcon,
				ViewColumn: ViewColumnIcon
			}}
			options={{
				exportButton: true,
				...options
			}}
			actions={ actions }
		/>

	);
}

CrudTable.propTypes = {
	isEditable: PropTypes.func,
	isDeletable: PropTypes.func,
	title: PropTypes.string.isRequired,
	columns: PropTypes.array.isRequired,
	endpoint: PropTypes.string.isRequired,
	isAuth: PropTypes.bool.isRequired,
	operations: PropTypes.arrayOf(PropTypes.string),
	uidField: PropTypes.string,
	endpointQuery: PropTypes.object,
	readOnly: PropTypes.bool,
	makeErrorMsg: PropTypes.func,
	actions: PropTypes.array,
	options: PropTypes.object
};

export default withAuth(CrudTable);