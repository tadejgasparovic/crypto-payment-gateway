import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';

import { recoverToken, isValid } from '../../services/gateway.api';

const withAuth = Component => withRouter(props =>
{
	const [ user, setUser ] = useState({});
	const [ isAuth, setIsAuth ] = useState(false);

	useEffect(() => {

		isValid()
			.then(({ data }) => {
				setUser(data);
				setIsAuth(true);
			}) // Token is valid
			.catch(() => {

				recoverToken()
					.then(({ data }) => {
						setUser(data);
						setIsAuth(true);
					}) // We got a valid token
					.catch(() => props.history.push('/')); // We couldn't get a valid token, redirect to login page

			});

	}, [ props.history ]);

	return <Component isAuth={ isAuth } user={ user } { ...props } />;
})

export default withAuth;