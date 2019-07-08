import React, { useState, useEffect } from 'react';
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

function CrudTable({ title, columns, isEditable, isDeletable, endpoint, uidField = 'username', isAuth })
{
	const [ data, setData ] = useState([]);
	const [ loading, setLoading ] = useState(true);
	const [ nonce, setNonce ] = useState(0);

	useEffect(() => {
		setLoading(true);

		if(!isAuth) return;

		backend.get(endpoint)
				.then(({ data }) => setData(data))
				.catch(({ request, response }) => {

					if(response) NotificationManager.error(`API request failed! Status code ${response.status}`, "Error");
					else if(request) NotificationManager.error("Empty server response!", "Error");
					else NotificationManager.error("API request failed!", "Error");

				})
				.finally(() => setLoading(false));

	}, [ isAuth, nonce, endpoint ]);

	const mappedColumns = columns.map((col, i) => {
		if(col.type === 'datetime')
		{
			return {
				...col,
				render: row => formatDate(config.dateFormat, new Date((row && row[col.field]) || new Date().toISOString()))
			};
		}
		else if(((!col.type && !col.lookup) || col.type === 'numeric') && !col.editComponent)
		{
			const { password, title } = col;

			const editComponent = ({ onChange, value = "", columnDef }) => <TextField
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

	const makePostData = (newData, ...validEditable) => 
							_.pickBy(newData, (val, key) => {
								const colDef = _.find(columns, ({ field }) => field === key) || { editable: "always" };

								colDef.editable = colDef.editable || "always";

								return validEditable.includes(colDef.editable) || colDef.field === uidField;
							});

	const errorMessage = e => {
		if(e.response)
		{
			const { response: { status, data } } = e;
			
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

	return (

		<MaterialTable
			title={ title }
			columns={ mappedColumns }
			data={ data }
			isLoading={ loading }
			editable={{
				isEditable,
				isDeletable,
				onRowAdd: async newData => {
					setLoading(true);

					try
					{
						const postData = makePostData(newData, 'onAdd', 'always');
						await backend.post(endpoint, postData);
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
				},
				onRowUpdate: async (newData, oldData) => {
					setLoading(true);

					try
					{
						const postData = makePostData(newData, 'onUpdate', 'always');
						await backend.post(`${endpoint}${endpoint.endsWith('/') ? "" : "/"}${oldData[uidField]}`, postData);
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
				},
				onRowDelete: async oldData => {
					setLoading(true);

					try
					{
						await backend.delete(`${endpoint}${endpoint.endsWith('/') ? "" : "/"}${oldData[uidField]}`);
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
				}
			}}
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
				exportButton: true
			}}
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
	uidField: PropTypes.string
};

export default withAuth(CrudTable);