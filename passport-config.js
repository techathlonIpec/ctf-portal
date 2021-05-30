const localStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")

function initialize(passport, getTeam, getTeambyId) {
    const authenticateUser = async (teamName, password, done) => {
        const team = await getTeam(teamName)
        if (!team) return done(null, false, { message: 'Team not found.' })
        try {
            const verifiedPass = await bcrypt.compareSync(password, team.password)
            if (!verifiedPass) return done(null, false, { message: 'Incorrect Password' })
            return done(null, team)
        } catch (error) {
            return done(error)
        }
    }
    passport.use(new localStrategy({ usernameField: 'teamName' }, authenticateUser))

    passport.serializeUser(async (user, done) => { return done(null, user._id) })
    passport.deserializeUser(async (id, done) => {
        const user = await getTeambyId(id);
        return done(null, user)
    })
}

module.exports = initialize
