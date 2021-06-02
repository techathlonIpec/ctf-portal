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
        req.flash('bigMessage', 'Oh Shoot! The event is over. Playtime is over. Hope you participated and Enjoyed. Follow us for results.')
        return res.redirect('/message')
    }
}

module.exports = {checkAuthenticated : checkAuthenticated , checkUnAuthenticated : checkUnAuthenticated, checkEventTime}