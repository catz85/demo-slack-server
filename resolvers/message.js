const { requiresAuth, requireTeamMember } = require('../lib/permission')
const { withFilter } = require('apollo-server-express');
const pubsub = require('../lib/pubsub');

const newChannelMessage = "newChannelMessage";


module.exports = {
    Subscription: {
        newChannelMessage: {
            subscribe: requireTeamMember.createResolver(withFilter(
                () => pubsub.asyncIterator(newChannelMessage),
                (payload, variables) => payload.channelId === variables.channelId
            )
            )
        }
    },
    Query: {
        messages: requiresAuth.createResolver(async (parent, { channelId }, { sequelize: { models } }) =>
            models.message.findAll({ where: { channelId }, order: [['createdAt', 'ASC']] }, { raw: true }))
    },
    Mutation: {
        createMessage: requiresAuth.createResolver(async (parent, variables, { sequelize: { models }, user }) => {
            try {
                const message = await models.message.create({ ...variables, userId: user.id });
                pubsub.publish(newChannelMessage, { newChannelMessage: message.dataValues, channelId: variables.channelId })
                return true
            } catch (error) {
                console.log(error)
                return false
            }
        })
    },
    Message: {
        user: ({ user, userId }, args, { sequelize: { models } }) => {
            if (user) {
                return user
            }
            return models.user.findOne({ where: { id: userId } }, { raw: true })
        }
    }
};