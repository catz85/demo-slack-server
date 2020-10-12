const { gql } = require('apollo-server-express');
module.exports = gql`
type Team {
    id: Int!
    name: String!
    members: [User!]!
    directMessageMembers: [User!]!
    channels: [Channel!]!
    admin: Boolean!
}

type CreateTeamResponse {
    ok: Boolean!
    team: Team
    errors: [Error!]
}

type Query {
    userTeams: [Team!]
    getTeamMembers(teamId: Int!): [User!]! 
    invitedTeams: [Team!]
}

type VoidResponse {
    ok: Boolean!
    errors: [Error!]
}

type Mutation {
    addTeamMember(email: String!, teamId: Int!): VoidResponse!
    createTeam(name: String!): CreateTeamResponse!
}

type Subscription {
    newTeamMember(channelId: Int!): Message!
  }

`;

