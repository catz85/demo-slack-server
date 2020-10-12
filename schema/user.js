const { gql } = require('apollo-server-express');
module.exports = gql`
type User {
  id: Int!
  username: String!
  email: String!
  teams: [Team!]!
}

type Query {
    me: User!
    allUsers: [User!]!
    getUser(userId: Int!): User
}

type RegisterResponse {
  ok: Boolean!,
  user: User,
  errors: [Error!]
}

type LoginResponse {
  ok: Boolean!
  token: String
  refreshToken: String
  errors: [Error!]
}

type Mutation {
    register(username: String!, password: String!, email: String!): RegisterResponse!
    login(email: String!, password: String!): LoginResponse!
}
`;
