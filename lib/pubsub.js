const { PubSub } = require('apollo-server-express');
const pubsub = new PubSub();
// definition of Publisher Subscirber 
module.exports = pubsub;