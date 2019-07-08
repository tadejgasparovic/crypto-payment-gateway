import axios from 'axios';

import localStorage from '../localStorage';
import config from '../config';

export const backendConfig = {
	baseURL: config.apiBase
};

export const backend = axios.create(backendConfig);

export async function login(username, password, type = "admin", remember = false)
{
	// Make the third argument optional
	if(typeof type === 'boolean')
	{
		remember = type;
		type = "admin";
	}

	try
	{
		const { data: { token } } = await backend.post('/auth', { username, password, type });

		if(!token) throw Error("No token!");

		backend.defaults.headers.common['Authorization'] = `Bearer ${token}`;

		if(remember) localStorage.setItem('access_token', token);
	}
	catch({ request, response })
	{
		if(response)
		{
			const { status } = response;

			if(parseInt(status / 10) === 40) throw Error("Incorrect username or password!");
			else throw Error("Internal server error!");
		}
		else if(request) throw Error("Empty server response!");
		else throw Error("Failed to login!");
	}
}

export async function recoverToken()
{
	const token = localStorage.getItem('access_token');

	if(!token) throw Error("No token");

	backend.defaults.headers.common['Authorization'] = `Bearer ${token}`;

	try
	{
		return await isValid();
	}
	catch(e)
	{
		delete backend.defaults.headers.common['Authorization'];
		throw e;
	}
}

export async function isValid()
{
	if(!backend.defaults.headers.common['Authorization']) throw Error("No token");
	return await backend.get('/auth/check');
}

export async function logout()
{
	localStorage.removeItem('access_token');
	// TODO: Invalidate the token on the server
	delete backend.defaults.headers.common['Authorization'];
}