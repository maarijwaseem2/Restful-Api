const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const ProductRoutes = require('./api/routes/products');
const OrderRoutes = require('./api/routes/orders');

const connect = mongoose.connect('mongodb://0.0.0.0:27017/node-restful-api');
connect.then(()=>{
    console.log("Database Connected Successfully");
})
.catch((err)=>{
    console.log("Database cannot be connected: " + err);
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin',"*");
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type,Accept, Authorization');

    if(req.method === "OPTIONS"){
        res.header("Access-Control-Allow-Methods","PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
})
app.use('/products',ProductRoutes);
app.use('/orders',OrderRoutes);

app.use((req,res,next)=>{
    const err = new Error('Not Found');
    res.status(404);
    next(err);
});

app.use((err,req,res,next)=>{
    res.status(err.status || 500);
    res.json({
        err: {
            message: err.message
        }
    })
})
module.exports = app;