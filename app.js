if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
// const mongodbUrl = "mongodb://127.0.0.1:27017/wanderlust"
const dbUrl = process.env.ATLASDB_URL;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


port = 8080;
const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter : 24*3600,
});
const sessionOptions = {
    store : store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true,
    },
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


main().then(()=> console.log("Connected to DB"))
.catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
}
app.get("/", (req, res)=>{
    res.send("root is working");
});

app.use((req, res, next)=>{
    res.locals.success = req.flash ("success");
    res.locals.error = req.flash ("error");
    res.locals.currUser = req.user;
    next();

});



// listings routes
app.use("/listings", listingRouter);

// review routes
app.use("/listings/:id/reviews", reviewsRouter);

// user routes
app.use("/", userRouter);


app.all("*", (req, res, next)=>{
    next(new ExpressError(404,"Page not found!"));
});

app.use((err, req, res, next)=>{
    let {statusCode=500, message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
});
app.listen (port, ()=>{
    console.log("Server is listening to port 8080");
});
