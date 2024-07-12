const { ref, required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { type } = require("os");
const listingSchema = new Schema ({
    title : {
        type: String,
        required: true
    },
    description : {
        type:String,
    },
    image : { 
        filename: String,
        url: {
            type: String,
            default: "https://images.pexels.com/photos/17644421/pexels-photo-17644421/free-photo-of-seagulls-flying-on-sea-shore.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            set : (v) => v === "" ? "https://images.pexels.com/photos/17644421/pexels-photo-17644421/free-photo-of-seagulls-flying-on-sea-shore.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1": v,
        }
 },
    price : {
        type: Number,
        required: true,
        min : 0
    },
    location: String,
    country: String,
    reviews : [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
    category : {
        type: String,
        enum : ["Trending", "Rooms", "Farms", "Mountain", "City", "Pools", "Beach", "Castle", "Picnic", "Camper Vans"],
        required: true,
    },
});


listingSchema.post("findOneAndDelete", async(listing)=>{
    if (listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
