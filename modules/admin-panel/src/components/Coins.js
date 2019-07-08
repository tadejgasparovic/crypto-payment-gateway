import React from 'react';
import PropTypes from 'prop-types';

import CrudPage from './CrudPage';

import UserSelect from './partial/UserSelect';

import withAuth from './partial/withAuth';

function Coins({ user })
{
	return (

		<CrudPage
			endpoint="/coins"
			title="Coins"
			uidField="symbol"
			columns={[
				{
					title: "Name",
					field: "name"
				},
				{
					title: "Symbol",
					field: "symbol",
					editable: "onAdd"
				},
				{
					title: "Host",
					field: "adapterProps.rpc.host",
					render: row => row.adapterProps &&
									row.adapterProps.rpc ?
									row.adapterProps.rpc.host : "N/A"
				},
				{
					title: "Port",
					field: "adapterProps.rpc.port",
					type: 'numeric',
					render: row => row.adapterProps &&
									row.adapterProps.rpc ?
									row.adapterProps.rpc.port : "N/A"
				},
				{
					title: "User",
					field: "adapterProps.rpc.user",
					render: row => row.adapterProps &&
									row.adapterProps.rpc ?
									row.adapterProps.rpc.user : "N/A"
				},
				{
					title: "Password",
					field: "adapterProps.rpc.password",
					render: row => "*".repeat(8)
				},
				{
					title: "Created By",
					field: "createdBy",
					editComponent: ({ value = "", onChange }) => <UserSelect type="client" label="Provider" value={ value } onChange={ ({ value }) => onChange(value) } />
				},
				{
					title: "Created At",
					field: "createdAt",
					type: "datetime",
					editable: "never"
				}
			]}
			/>

	);
}

Coins.propTypes = {
	user: PropTypes.object.isRequired
};

export default withAuth(Coins);