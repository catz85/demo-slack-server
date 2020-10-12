const { DirectiveLocation } = require("graphql");

function applyExtraSetup(sequelize) {
	const { message, team, user, channel, member, direct } = sequelize.models;

    message.belongsTo(user, {
        foreignKey: { 
            name: "userId",
            field: "user_id"
        }
    });

    message.belongsTo(channel, {
        foreignKey: { 
            name: "channelId",
            field: "channel_id"
        }
    });
    team.belongsToMany(user, {
        through: member,
        foreignKey: {
            name: "teamId",
            field: "team_id" 
        }
    });
    user.belongsToMany(team, {
        through: member,
        foreignKey: {
            name: "userId",
            field: "user_id"
        }
    });
    user.belongsToMany(channel, {
        through: "channel_member",
        foreignKey: {
            name: "userId",
            field: "user_id"
        }
    });
    channel.belongsTo(team, {
        foreignKey: {
            name: "teamId",
            field: "team_id" 
        }
    });
    channel.belongsToMany(user, {
        through: "channel_member",
        foreignKey: {
            name: "channelId",
            field: "channel_id"
        }
    });
    direct.belongsTo(user, {
        foreignKey: {
            name: 'receiverId',
            field: 'receiver_id'
        }
    })
    direct.belongsTo(user, {
        foreignKey: {
            name: 'senderId',
            field: 'sender_id'
        }
    })
    direct.belongsTo(team, {
        foreignKey: {
            name: 'teamId',
            field: 'team_id'
        }
    })
};
module.exports = { applyExtraSetup }