const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
var Ddos = require('ddos')
const quotable = require('quotable');

var ddos = new Ddos;

const app = express();

const teamsCollection = require('./models/teams.js');
const questionCollection = require('./models/questions.js');
const { checkAuthenticated, checkUnAuthenticated, checkEventTime } = require('./authFunctions')

dotenv.config()

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, (err) => {
    if (err)
        console.log(`Error ${err}`);
    else
        console.log("Connected to MongoDB");

})
app.use(express.urlencoded({ extended: false }));
app.use(ddos.express)
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))

app.set('trust proxy', 1)
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

const initializePassport = require('./passport-config');

initializePassport(passport,
    teamName => teamsCollection.findOne({ teamName: teamName.toLowerCase() }).then(team => team),
    id => teamsCollection.findById(id).then(team => team)
)

app.post('/register', checkUnAuthenticated, (req, res) => {
    var teamName = (req.body.teamName).toLowerCase();
    teamsCollection.findOne({ teamName: teamName }).then(team => {
        if (team) return res.status(400).send({ done: false, message: 'Team already Exists.' })
        let data = {}
        data.teamName = teamName
        data.password = bcrypt.hashSync(req.body.password, 10)
        new teamsCollection(data).save((err, registeredTeam) => {
            if (err) {
                console.log(`Error ${err}`);
                res.send({ done: false, message: 'Unknown Error Occured!' })
            }
            else {
                res.send({ done: true, registeredTeam, message: 'Participant Registered Successfully' });
            }
        })
    })
})

app.post("/login", checkEventTime, passport.authenticate('local', {
    successRedirect: '/eventPage',
    failureRedirect: '/',
    failureFlash: true
}))

app.get('/', checkEventTime, checkUnAuthenticated, (req, res) => {
    res.render('index.ejs')
})

app.get('/eventPage', checkEventTime, checkAuthenticated, (req, res) => {
    // We find the user first
    teamsCollection.findOne({ teamName: req.user.teamName }).then(team => {
        if (!team) return res.status(400).send({ done: false, message: 'No Team found with the given teamName.' })
        // We find the currentQuestion of user
        questionCollection.findOne({ questionNumber: team.currentQuestion }).then(async question => {
            if (!question) {
                req.flash('bigMessage', 'Kuddos!! You have answered all the questions. Go enjoy the weekend with some Netflix or better, "GET CODING"')
                return res.redirect('/message')
            }
            const randomQuote = await quotable.getRandomQuote({ minLength: 45, maxLength: 80, tags: 'education|famous-quotes|wisdom|technology|success|future' });
            res.render('eventPage.ejs', { team, question, randomQuote })
        })
    })


})

app.post('/addQuestion', (req, res) => {
    let data = {}
    data.questionNumber = req.body.questionNumber;
    data.question = req.body.question;
    data.questionHint = []
    questionHint = req.body.questionHint.split('~')
    for (let index = 0; index < questionHint.length; index++) {
        data.questionHint[index] = JSON.parse(questionHint[index]);
    }
    data.questionLink = []
    questionLink = req.body.questionLink.split('~')
    for (let index = 0; index < questionLink.length; index++) {
        data.questionLink[index] = JSON.parse(questionLink[index]);
    }
    data.questionFlag = bcrypt.hashSync(req.body.questionFlag, 10);
    data.weightage = req.body.weightage;
    new questionCollection(data).save((err, question) => {
        if (err) {
            console.log(`Error ${err}`);
            res.send({ done: false, message: 'Unknown Error Occured!' });
        }
        else {
            res.send({ done: true, message: 'Question created Successfully!', question });
        }
    });
})

app.post('/checkAnswer', checkEventTime, checkAuthenticated, (req, res) => {
    if (req.body.questionFlag.length == 0) {
        req.flash('wrongAnswer', 'Do you really think, answer is Empty String?')
        return res.redirect('/eventPage')
    }
    // First we find the team
    teamsCollection.findOne({ teamName: req.user.teamName }).then(team => {
        if (!team) return res.status(400).send({ done: false, message: 'No Team found with the given teamName.' })
        // We find the currentQuestion of user
        questionCollection.findOne({ questionNumber: team.currentQuestion }).then(question => {
            if (!question) {
                req.flash('bigMessage', 'Kuddos!! You have answered all the questions. Go enjoy the weekend with some Netflix or better get Coding!')
                return res.redirect('/message')
            }

            const verifiedFlag = bcrypt.compareSync(req.body.questionFlag, question.questionFlag)
            if (!verifiedFlag) {
                req.flash('wrongAnswer', 'Uhm! Wrong Answer... Try Again')
                return res.redirect('/eventPage')
            }
            team.score = team.score + question.weightage - team.hintsUsed*10
            team.currentQuestion++;
            team.hintsUsed = 0;
            team.save((err, team) => {
                if (err) return res.send('SOME SPECIAL ERROR WHILE SAVING')
                if (team) {
                    let date = new Date().toString()
                    team.lastAnsweredOn = date
                    team.save().then(savedTeam=>{
                        if(savedTeam){
                            req.flash('rightAnswer', 'Awesome! You got it. Score added.')
                            return res.redirect('/eventPage')
                        }
                    })
                }
            })
        })
    })

});

app.get('/skipQuestion', checkEventTime, checkAuthenticated, (req, res) => {
    teamsCollection.findOne({ teamName: req.user.teamName }).then(team => {
        if (team.hintsUsed === 3) {
            team.currentQuestion += 1;
            team.hintsUsed = 0;
            team.save().then(savedTeam => {
                if (savedTeam) {
                    res.redirect('/eventPage')
                }
                else {
                    req.flash('wrongAnswer', 'Unknown Error While Skipping Question. Contact Techathlon Team')
                    res.redirect('/eventPage')

                }
            })
        }
        else {
            req.flash('wrongAnswer', 'You cannot skip questions without using all the hints.')
            res.redirect('/eventPage')

        }
    })
})

app.get('/getHint', checkEventTime, checkAuthenticated, (req, res) => {
    teamsCollection.findOne({ teamName: req.user.teamName }).then(team => {
        if (team.hintsUsed === 3) {
            req.flash('wrongAnswer', 'You have already used maximum number of hints for this Question')
            res.redirect('/eventPage')
        }
        else {
            team.hintsUsed = team.hintsUsed + 1;
            team.save().then(savedTeam => {
                if (savedTeam) {
                    res.redirect('/eventPage')
                }
                else {
                    req.flash('wrongAnswer', 'Unknown Error While Fetching Hint. Contact Techathlon Team')
                    res.redirect('/eventPage')
                }
            })
        }
    })
})

app.get('/message', (req, res) => {
    res.render('bigMessage.ejs')
})

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is listening");
});




