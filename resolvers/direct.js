const { requiresAuth, requireTeamMember, directSubscription } = require('../lib/permission')
const { withFilter } = require('apollo-server-express');
const pubsub = require('../lib/pubsub');
const { Op } = require("sequelize");

const newDirect = "newDirect";


module.exports = {
    Subscription: {
        newDirect: {
            subscribe: directSubscription.createResolver(withFilter(
                () => pubsub.asyncIterator(newDirect),
                (payload, variables, context) => {
                    const decision = (payload.newDirect.teamId === variables.teamId) &&
                    (((payload.newDirect.senderId === context.user.id) &&
                        (payload.newDirect.receiverId === variables.userId)) ||
                        ((payload.newDirect.senderId === variables.userId) &&
                            (payload.newDirect.receiverId === context.user.id)))
                    console.log('DECISION', decision)
                    console.log('payload',payload)
                    console.log('variables', variables)
                    console.log('context', context)
                    return decision
                    }
            )
            )
        }
    },
    Query: {
        direct: requiresAuth.createResolver(async (parent, { teamId, otherUserId }, { sequelize, user }) =>
            sequelize.models.direct.findAll({
                where: {
                    teamId,
                    [Op.or]: [
                        {
                            [Op.and]: [{ receiverId: otherUserId }, { senderId: user.id }]
                        },
                        {
                            [Op.and]: [{ receiverId: user.id }, { senderId: otherUserId }]
                        }
                    ]
                },
                order: [['createdAt', 'ASC']]
            }, { raw: true }))
    },
    Mutation: {
        createDirect: requiresAuth.createResolver(async (parent, variables, { sequelize: { models }, user }) => {
            try {
                const message = await models.direct.create({ ...variables, senderId: user.id });
                pubsub.publish(newDirect, {
                    newDirect: {
                        ...message.dataValues,
                        sender: { username: user.username }
                    }
                })
                return true
            } catch (error) {
                console.log(error)
                return false
            }
        })
    },
    Direct: {
        sender: ({ sender, senderId }, args, { sequelize: { models } }) => {
            if (sender) {
                return sender
            }
            return models.user.findOne({ where: { id: senderId } }, { raw: true })
        }
    }
};