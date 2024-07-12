const express = require("express");
const router = express.Router();
const Listing =  require("../models/listing.js");
const {listingSchema}  = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const passport = require("passport");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingControllers = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({storage});


router.route("/")
.get(wrapAsync(listingControllers.index))
.post(isLoggedIn, upload.single("listing[image][url]"), validateListing, wrapAsync(listingControllers.createListing));


// New Route
router.get("/new", isLoggedIn, wrapAsync(listingControllers.renderNewForm));

// Location Search Route
router.get("/location", wrapAsync(listingControllers.searchLocation));

// Category Route
router.get("/category", wrapAsync(listingControllers.category));

router.route("/:id")
.get(wrapAsync(listingControllers.showListing))
.put(isLoggedIn, isOwner, upload.single("listing[image][url]"), validateListing,  wrapAsync(listingControllers.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingControllers.destroyListing));


//  Edit Route
router.get("/:id/edit", isLoggedIn, wrapAsync(listingControllers.renderEditForm));


module.exports = router;