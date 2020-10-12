const {formatErrors} = require('../lib/formatDbErrors')
const {tryLogin} = require('../lib/auth')
const { requiresAuth } = require('../lib/permission')

module.exports = {
    User: {
        teams:(parent, variables, {sequelize, user}) => 
        sequelize.query(
            'select * from teams as team join members as member on team.id = member.team_id where member.user_id =?',
            {
                replacements: [user.id],
                model: sequelize.models.team,
                raw: true
            }
        )
    },
    Query: {
        allUsers: requiresAuth.createResolver((parent, variables, {sequelize : { models }}) => models.user.findAll()),
        me: requiresAuth.createResolver((parent, variables, { sequelize: { models }, user }) =>
            models.user.findOne({ where: { id: user.id } }, { raw: true })
        ),
        getUser: requiresAuth.createResolver((parent, variables, { sequelize: { models }, user }) =>
        models.user.findOne({ where: { id: variables.userId } }, { raw: true })),
        invitedTeams: requiresAuth.createResolver(async (parent, variables, { sequelize, user }) =>
            sequelize.query('select * from teams join members on team_id = id where user_id = ?',
                {
                    replacements: [user.id],
                    model: sequelize.models.team
                })
        )

    },
    Mutation: {
        login: (parent, {email, password}, {sequelize: {models}, jswebtokensecret, jswebtokensecret2}) => tryLogin(email, password,models, jswebtokensecret, jswebtokensecret2),
        register: async(parent, args, {sequelize: {models}}) => {
            try {
                const user = await models.user.create(args);
                return {
                    ok: true,
                    user
                }
            } catch (err) {
                return {
                    ok: false,
                    errors: formatErrors(err)
                }
            }
        }
    }
};