import React from 'react';
import PropTypes from 'prop-types';

import CrudPage from './CrudPage';

import withAuth from './partial/withAuth';

function Clients({ user })
{
	return (

		<CrudPage
			endpoint="/clients"
			title="Crypto-currency providers"
			columns={[
				{
					title: "Username",
					field: "username",
					editable: "onAdd"
				},
				{
					title: "Password",
					field: "password",
					password: true
				},
				{
					title: "Created By",
					field: "createdBy",
					editable: "never",
					emptyValue: user.username
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

Clients.propTypes = {
	user: PropTypes.object.isRequired
};

export default withAuth(Clients);