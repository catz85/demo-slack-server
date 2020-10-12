const { Op } = require("sequelize");

const createResolver = (resolver) => {
    const baseResolver = resolver;
    baseResolver.createResolver = (childResolver) => {
        const newResolver = async (parent, args, context, info) => {
            await resolver(parent, args, context, info);
            return childResolver(parent, args, context, info);
        }
        return createResolver(newResolver);
    };
    return baseResolver;
}

const requiresAuth = createResolver((parent, variables, context) => {
    if (!context.user || !context.user.id) {
        throw new Error('Not authenticated')
    }
})


const requireTeamMember = createResolver(async (parent, variables, context) => {
    if (!context.user || !context.user.id) {
        throw new Error('Not authenticated')
    }
    let teamId = null;
    if (variables.channelId) {
        const channel = await context.sequelize.models.channel.findOne({ where: { id: variables.channelId } });
        teamId = channel.teamId;
    } else {
        teamId = variables.teamId
    }
    const member = await context.sequelize.models.member.findOne({ where: { teamId, userId: context.user.id } });

    if (!member) {
        throw new Error('You must to be a member!')
    }
})


const directSubscription = createResolver(async (parent, variables, context) => {
    if (!context.user || !context.user.id) {
        throw new Error('Not authenticated')
    }
    const members = await context.sequelize.models.member.findAll({
        where: {
            teamId: variables.teamId,
            [Op.or]: [
                { userId: variables.userId },
                { userId: context.user.id }
            ]
        }
    });

    if (members.length !== 2) {
        throw new Error('You must to be a member!')
    }
})

module.exports = {
    requiresAuth,
    requireTeamMember,
    directSubscription
}