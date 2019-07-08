import React from 'react';
import { render, cleanup, waitForElement } from '@testing-library/react';
import 'jest-dom/extend-expect';

import 'react-router-dom';
jest.unmock('react-router-dom');

import axiosMock from 'axios';

import App from '../App';

describe('Tests the app entry point', () => {

	it('Renders without crashing', async () => {
		const { getByLabelText } = render(<App />);

		await waitForElement(() => [
			getByLabelText(/Username/),
			getByLabelText(/Password/)
		]);
	});

});

afterEach(cleanup);