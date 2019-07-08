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
const adminRouter = require('./routes/admins');
const clientRouter = require('./routes/clients');

const app = express();

app.use(helmet());
app.use(cors());
app.options('*', cors());

if(process.env.NODE_ENV !== 'test' || process.env.DEBUG) app.use(logger('dev'));

app.use(express.json({ limit: "500kb" }));
app.use(express.urlencoded({ extended: false }));

app.use('/payments', paymentRouter);
app.use('/transactions', transactionRouter);
app.use('/auth', authRouter);
app.use('/coins', coinRouter);
app.use('/merchants', merchantRouter);
app.use('/admins', adminRouter);
app.use('/clients', clientRouter);

module.exports = app;