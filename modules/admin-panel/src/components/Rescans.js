import React, { useState } from 'react';
import { NotificationManager } from 'react-notifications';

import CrudPage from './CrudPage';

import RemoteSelect from './partial/RemoteSelect';
import Layout from './partial/Layout';
import withAuth from './partial/withAuth';

import StopIcon from '@material-ui/icons/Stop';

import { backend } from '../services/gateway.api';

function Rescans()
{
	const [ nonce, setNonce ] = useState(0);

	const stopRescan = id => {
		backend.post(`/transactions/rescan/${id}/stop`)
			.then(() => {
				setNonce(nonce + 1);
				NotificationManager.success("Rescan stopped", "Success");
			})
			.catch(err => {
				NotificationManager.error("Rescan failed to stop", "Error");
			});
	}

	const makeStatusStyles = status => {
		switch(status)
		{
			case 'failed':
				return { color: '#ff4646', fontWeight: 'bold' };

			case 'finished':
				return { color: '#279527', fontWeight: 'bold' };

			default:
				return { color: 'gray', fontWeight: 'bold' };
		}
	}

	return (

		<CrudPage
			title="Rescans"
			endpoint={ `/transactions/rescan?${nonce}` }
			endpointQuery={{ nonce }}
			operations={[ 'create' ]}
			columns={[
				{
					title: "ID",
					field: "_id",
					editable: "never"
				},
				{
					title: "Current Block",
					field: "currentBlock",
					editable: "never"
				},
				{
					title: "Blocks Left",
					field: "blocksLeft",
					editable: "never",
					render: row => row && row.blocksLeft > -1 ? row.blocksLeft : "N/A"
				},
				{
					title: "Starting Block",
					field: "firstBlock",
					postField: "block"
				},
				{
					title: "Currency",
					field: "currency",
					editComponent: ({ value = "", onChange }) => (
							<RemoteSelect
									selectable="currency"
									endpoint="/coins"
									mapResult={ ({ symbol }) => ({ label: symbol, value: symbol }) }
									value={ value }
									onChange={ ({ value }) => onChange(value) }
									/>
						)
				},
				{
					title: "Status",
					field: "status",
					render: row => <span style={ makeStatusStyles(row && row.status) }>{ row && row.status.toUpperCase() }</span>,
					editable: 'never'
				},
				{
					title: "Errors",
					field: "error",
					render: row => <pre>{ row && JSON.stringify(row.error) }</pre>,
					editable: 'never'
				},
				{
					title: "Created At",
					field: "createdAt",
					type: "datetime",
					editable: 'never'
				},
				{
					title: "Done At",
					field: "doneAt",
					type: "datetime",
					editable: 'never'
				}
			]}
			makeErrorMsg={
				(status, data) => {
					if(status === 409)
					{
						return "Conflict! Rescan already running!";
					}
				}
			}
			actions={[
				{
					icon: StopIcon,
					tooltip: 'Stop',
					onClick: (event, row) => stopRescan(row._id)
				}
			]}
			/>

	);
}

export default withAuth(Rescans);