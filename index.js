const express = require('express');
const path = require('path');
const { ApolloServer, PubSub } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const { loadFilesSync } = require("@graphql-tools/load-files");
const { mergeSchemas } = require("graphql-tools");
const http = require('http');
const config = require('./config');

const { jwtMiddleware } = require('./lib/jwtMiddleware')

//loading schemas
const types = loadFilesSync(path.join(__dirname, './schema'));
//loading resolvers
const resolversArray = loadFilesSync(path.join(__dirname, './resolvers'))
//merging schemas
const typeDefs = mergeTypeDefs(types);
//merging resolvers
const resolvers = mergeResolvers(resolversArray);


const sequelize = require('./dbmodels');

const { refreshTokens } = require("./lib/auth");


const app = express();

app.use(jwtMiddleware)

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, connection }) => {
        console.log('User context', connection ? connection.context : req.user)
        return {
            sequelize,
            jswebtokensecret:config.jwt.secretOne,
            jswebtokensecret2:config.jwt.secretTwo,
            user: connection ? connection.context : req.user
        }
    },
    subscriptions: {
        path: '/api/ws',
        onConnect: async (connectionParams, webScokect, context) => {
            const { token, refreshToken } = connectionParams;
            if (token) {
                try {
                    const { user } = jwt.verify(token, config.jwt.secretOne);
                    context.user = user;
                } catch (err) {
                    const newTokens = await refreshTokens(token, refreshToken, sequelize, config.jwt.secretOne, config.jwt.secretTwo)
                    context.user = newTokens.user;
                }

            }
            if (context.user) return context.user;
            return false
        }
    }
});

server.applyMiddleware({ app, path: '/api/gql', cors: { origin: '*', exposedHeaders: ['x-token', 'x-refresh-token'] } });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

sequelize.sync({force:config.db.remove}).then(() => {
    httpServer.listen(config.app.port, () => {
        console.log(`🚀 Server ready at http://localhost:${config.app.port}${server.graphqlPath}`)
        console.log(`🚀 Subscriptions ready at ws://localhost:${config.app.port}${server.subscriptionsPath}`)
    });
})


