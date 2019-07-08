import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { NotificationManager } from 'react-notifications';

import { userInfo } from '../../services/gateway.api';

const usernameCache = new Map();

function UsernameProvider({ type, value })
{
	const [ username, setUsername ] = useState("...");

	useEffect(() => {

		if(usernameCache.has(`${type}:${value}`))
		{
			setUsername(usernameCache.get(`${type}:${value}`));
			return;
		}

		userInfo(type, value)
			.then(({ data }) => {
				if(!data || !data.username) throw Error("No username");

				setUsername(data.username);
				usernameCache.set(`${type}:${value}`, data.username);
			})
			.catch(e => {
				if(e.response)
				{
					NotificationManager.error(`Couldn't find "${type}" user with ID "${value}"! API status: ${e.response.status}`, "Error");
				}
				else if(e.request)
				{
					NotificationManager.error(`Couldn't find "${type}" user with ID "${value}"! Empty response!`, "Error");
				}
				else
				{
					NotificationManager.error(`Couldn't find "${type}" user with ID "${value}"!`, "Error");
				}
			});

	}, [ type, value ]);

	return <span>{ username }</span>;
}

export default UsernameProvider;