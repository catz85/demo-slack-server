const {requiresAuth} = require('../lib/permission')
const {formatErrors} = require("../lib/formatDbErrors");
module.exports = {
    Mutation: {
        createChannel:requiresAuth.createResolver( async (parent, variables, {sequelize: { models }, user}) => {
            try {
                const member = await models.member.findOne({ where: {teamId: variables.teamId, userId: user.id}}, {raw:true});
                if (!member.admin) {
                    return {
                        ok: false,
                        errors: [
                            {
                                path: 'name',
                                message: 'You cant do this'
                            }
                        ]
                    }
                }
                const channel = await models.channel.create({...variables, owner: user.id})
                return {
                    ok: true,
                    channel
                }
            } catch(error) {
                //console.log(error)
                return {
                    ok: false,
                    errors: formatErrors(error)
                }
            }
        }
    )}
};