const User = require("../models/user.js");

module.exports.renderSignup = (req, res)=>{
    res.render("../views/user/signup.ejs");
};

module.exports.signup = async(req, res)=>{
    try{
        let {username, email, password} = req.body;
    const newUser = new User({username, email});
    let registeredUser = await User.register(newUser, password);
    // console.log(registeredUser);
    req.login(registeredUser, (err)=>{
        if (err) {
            next(err);
        }
        req.flash("success", "Welcome to Wanderlust!")
        return res.redirect("/listings");
    });

    }catch(e){
        req.flash("error", e.message);
        return res.redirect("/signup");
    }


};

module.exports.renderLoginForm = (req, res)=>{
    // console.log("login form");
    return res.render("user/login.ejs");
};

module.exports.login = async(req, res)=>{
    let redirectUrl = res.locals.redirectUrl || "/listings";
    req.flash("success", "Welcome back to Wanderlust");
    // console.log("after login");
    return res.redirect(redirectUrl);

};

module.exports.logout = (req, res, next)=>{
    req.logout((err)=>{
        if(err) {
            return next(err);

        }
        req.flash("success", "You are logged out!");
        return res.redirect("/listings");
    });
};
