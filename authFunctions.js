function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/")
}

function checkUnAuthenticated(req, res, next) {
    if (! req.isAuthenticated()) {
        next()
    } else {
        res.redirect("/eventPage")
    }
}

function checkEventTime(req,res,next) {
    var eventFlag = process.env.EVENT_FLAG
    if(eventFlag == 'BEFORE'){
        res.render('comingSoon.ejs')
    }
    if(eventFlag == 'ONTIME'){
        next()
    }
    if(eventFlag == 'AFTER'){
        res.render('comingSoon.ejs')
    }
}

module.exports = {checkAuthenticated : checkAuthenticated , checkUnAuthenticated : checkUnAuthenticated, checkEventTime}