const { access } = require("fs");
const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken });


module.exports.index = async(req, res)=>{
    const allListings = await Listing.find({});
    return res.render("listings/index.ejs",{allListings});

};

module.exports.renderNewForm = (req, res)=>{
    // console.log("rendering new form");
    return res.render("listings/new.ejs"); 
};

module.exports.showListing = async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews", populate : {
        path:"author" },
    }).populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requestd for does not exist");
        return res.redirect("/listings");
    }
    return res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async(req, res)=>{
    let response = await geocodingClient.forwardGeocode ({
        query: req.body.listing.location,
        limit: 1
    }).send();
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { filename, url };
    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    // console.log(newListing);
    req.flash("success", "New listing created!");
    return res.redirect("/listings");
};

module.exports.renderEditForm = async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requestd for does not exist");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    return res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async(req, res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing.")
    }
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {filename, url};
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    return res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req, res)=>{
    let {id}= req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    return res.redirect("/listings");
};

module.exports.category = async(req, res)=>{
    let getCategory = req.query.category;
    let categoryListing = await Listing.find({category:getCategory});
    if (!categoryListing.length>0){
        req.flash("error","No relevant listings found!")
        return res.redirect("/listings");
    }
    return res.render("listings/category.ejs",{categoryListing, getCategory});

};

module.exports.searchLocation = async(req, res)=>{
    let queryLocation = req.query.location;
    let queryLocationArray = queryLocation.split(" ");
    // console.log(queryLocation);
    // console.log(req.query);
    const query = {
        $or: queryLocationArray.map(queryLocationArray => ({
          $or: [
            { location: { $regex: queryLocationArray, $options: 'i' } },
            { country: { $regex: queryLocationArray, $options: 'i' } }
          ]
        }))
      };
    let locationListing = await Listing.find(query);
    // console.log(locationListing);
    if (locationListing.length == 0) {
        req.flash("error", `No listing found for ${queryLocation}`);
        return res.redirect("/listings");
    }
    return res.render("listings/location.ejs", {locationListing, queryLocation});
};
