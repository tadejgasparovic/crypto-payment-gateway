import React from 'react';

import CrudPage from './CrudPage';

import UsernameProvider from './partial/UsernameProvider';

import withAuth from './partial/withAuth';

function Payments()
{
	return (
		
		<CrudPage
			title="Payments"
			endpoint="/payments"
			operations={[]}
			columns={[
				{
					title: "ID",
					field: "_id"
				},
				{
					title: "Merchant",
					field: "merchant",
					render: row => <UsernameProvider type="merchant" value={ row.merchant } />
				},
				{
					title: "Customer Email",
					field: "customerEmail"
				},
				{
					title: "Address",
					field: "address"
				},
				{
					title: "Amount",
					field: "amount"
				},
				{
					title: "Coin",
					field: "currency"
				},
				{
					title: "Status Hook",
					render: ({ statusHook }) => statusHook ? <span title={ statusHook }>Yes</span> : "No"
				},
				{
					title: "Confirmations",
					field: "confirmations"
				},
				{
					title: "Created At",
					field: "createdAt",
					type: "datetime"
				},
				{
					title: "Paid At",
					field: "paidAt",
					type: "datetime"
				},
				{
					title: "Expires At",
					field: "expiresAt",
					type: "datetime",
					render: row => {
						const color = Date.now() - new Date(row.expiresAt) >= 0 ? "red" : "green";
						return <span style={{ color }}>{ row.expiresAt }</span>;
					}
				}
			]}
			/>

	);
}

export default withAuth(Payments);