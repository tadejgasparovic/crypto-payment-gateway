import React from 'react';
import PropTypes from 'prop-types';

import CrudPage from './CrudPage';

import withAuth from './partial/withAuth';

function Admins({ user })
{
	return (

		<CrudPage
			endpoint="/admins"
			title="Admins"
			isDeletable={ rowData => rowData.username !== user.username }
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
					title: "Created At",
					field: "createdAt",
					type: "datetime",
					editable: "never"
				}
			]}
			/>

	);
}

Admins.propTypes = {
	user: PropTypes.object.isRequired
};

export default withAuth(Admins);