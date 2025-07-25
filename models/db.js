const mongoose=require("mongoose")

const conn_string=process.env.mongo_conn

mongoose.connect(conn_string).then(()=>{
    console.log("MongoDB Connected")
}).catch(()=>{
    console.log("MongoDB Disconnected")
})