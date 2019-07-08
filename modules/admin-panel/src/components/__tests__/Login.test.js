import React from 'react';
import { MemoryRouter } from 'react-router';
import { render, cleanup, waitForElement, fireEvent } from '@testing-library/react';
import 'jest-dom/extend-expect';

import axiosMock from 'axios';
import 'patch-act-warning';

import App from '../App';

import { backendConfig } from '../../services/gateway.api';

describe('Tests "Login"', () => {

	it('Successful login', async () => {
		const { getByLabelText, getByText, getAllByText, container, debug } = render(<MemoryRouter initialEntries={[ '/' ]}><App /></MemoryRouter>);

		expect(axiosMock.get).not.toBeCalledWith('/auth/check'); // No token recovered = no get call to /auth/check

		// Prepare axiosMock
		const backendMock = axiosMock.instances.get(backendConfig);
		backendMock.post.mockResolvedValueOnce({ data: { token: "__TEST_TOKEN__" } });
		backendMock.get.mockResolvedValueOnce({ data: { valid: true } });

		fireEvent.change(container.querySelector('#username'), { target: { name: "username", value: "admin" } });
		fireEvent.change(container.querySelector('#password'), { target: { name: "password", value: "admin123" } });
		fireEvent.click(getAllByText(/Sign In/)[1]);

		await waitForElement(() => getByText(/Crypto Payment Gateway Admin Panel/));

		expect(backendMock.post).toBeCalledTimes(1);
		expect(backendMock.post).toBeCalledWith('/auth', { username: "admin", password: "admin123", type: "admin" });

		expect(backendMock.get).toBeCalledTimes(1);
		expect(backendMock.get).toBeCalledWith('/auth/check');
	});

});

afterEach(cleanup);
afterEach(() => axiosMock.reset());