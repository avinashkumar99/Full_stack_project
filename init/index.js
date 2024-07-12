const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const Mongo_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main(){
    await mongoose.connect(Mongo_URL);

}

main()
.then (()=> console.log("Connected to DB"))
.catch (err => console.log(err));


const initDB = async () =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj, owner: "667d4f5e4690a81e98d8078d"}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
}

initDB();

