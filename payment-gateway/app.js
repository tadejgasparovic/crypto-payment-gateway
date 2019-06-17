const express = require('express');
const path = require('path');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const paymentRouter = require('./routes/payments');
const transactionRouter = require('./routes/transactions');
const authRouter = require('./routes/auth');
const coinRouter = require('./routes/coins');
const merchantRouter = require('./routes/merchants');

const app = express();

app.use(helmet());
app.use(cors());

if(process.env.NODE_ENV !== 'test') app.use(logger('dev'));

app.use(express.json({ limit: "500kb" }));
app.use(express.urlencoded({ extended: false }));

app.use('/payments', paymentRouter);
app.use('/transactions', transactionRouter);
app.use('/auth', authRouter);
app.use('/coins', coinRouter);
app.use('/merchants', merchantRouter);

module.exports = app;