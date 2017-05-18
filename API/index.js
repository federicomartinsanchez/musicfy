'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3977;


mongoose.connect('mongodb://localhost:27017/mean_stack2',(err,res)=>{
if (err){
    throw(err);
}else{
    console.log('DB running at 27017...');

    app.listen(port,function(){
        console.log('API REST Server listening on port 3977...');
    });
}
});
