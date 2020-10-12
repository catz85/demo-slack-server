const { formatErrors } = require("../lib/formatDbErrors");
const { requiresAuth, requireTeamMember } = require('../lib/permission')
module.exports = {
    Mutation: {
        createTeam: requiresAuth.createResolver(async (parent, variables, { sequelize, user }) => {
            try {
                const response = await sequelize.transaction(async () => {
                    const team = await sequelize.models.team.create({ ...variables, owner: user.id });
                    await sequelize.models.channel.create({ name: 'general', public: true, teamId: team.id });
                    await sequelize.models.member.create({ teamId: team.id, userId: user.id, admin: true });
                    return team
                })
                return {
                    ok: true,
                    team: response
                }
            } catch (error) {

                return {
                    ok: false,
                    errors: formatErrors(error)
                }
            }
        }),
        addTeamMember: requiresAuth.createResolver(async (parent, { email, teamId }, { sequelize: { models }, user }) => {
            try {
                const memberPromise = models.member.findOne({ where: { teamId, userId: user.id } }, { raw: true });
                const userAddPromise = models.user.findOne({ where: { email } }, { raw: true });
                const [member, userAdd] = await Promise.all([memberPromise, userAddPromise]);
                if (!member.admin) {
                    return {
                        ok: false,
                        errors: [{ path: 'email', message: 'You cant do this!' }]
                    }
                }
                if (!userAdd) {
                    return {
                        ok: false,
                        errors: [{ path: 'email', message: 'User doesnt exist!' }]
                    }
                }

                await models.member.create({ userId: userAdd.id, teamId });
                return {
                    ok: true
                }

            } catch (error) {
                return {
                    ok: false,
                    errors: formatErrors(error)
                }
            }

        })
    },
    Query: {
        getTeamMembers: requireTeamMember.createResolver(async (parent, { teamId }, { sequelize, user }) =>
            sequelize.query(
                'select * from users as u join members as m on m.user_id = u.id where m.team_id = ?',
                {
                    replacements: [teamId],
                    model: sequelize.models.user,
                    raw: true,
                },
            )
        )
    },
    Team: {
        channels: ({ id }, variables, { sequelize: { models }, user }) => models.channel.findAll({ where: { teamId: id } }),
        directMessageMembers: ({ id }, variables, { sequelize, user }) =>
            sequelize.query(
                'select distinct on (u.id) u.id, u.username from users as u join directs as dm on (u.id = dm.sender_id) or (u.id = dm.receiver_id) where (:currentUserId = dm.sender_id or :currentUserId = dm.receiver_id) and dm.team_id = :teamId',
                {
                    replacements: { currentUserId: user.id, teamId: id },
                    model: sequelize.models.user,
                    raw: true,
                }
            )
    }
};