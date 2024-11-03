import { PubSub } from 'graphql-subscriptions';
const pubsub = new PubSub();

const resolvers = {
  Query: {
    // Vos résolveurs de requêtes
  },
  Mutation: {
    addMessage: (parent, { content, user }) => {
      const message = { id: Date.now(), content, user };
      pubsub.publish('MESSAGE_ADDED', { messageAdded: message });
      return message;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator(['MESSAGE_ADDED']),
    },
  },
};
