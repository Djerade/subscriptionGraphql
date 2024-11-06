import { ApolloServer } from '@apollo/server';
  import { expressMiddleware } from '@apollo/server/express4';
  import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
  import { createServer } from 'http';
  import { makeExecutableSchema } from '@graphql-tools/schema';
  import { WebSocketServer } from 'ws';
  import { useServer } from 'graphql-ws/lib/use/ws';
  import { PubSub } from 'graphql-subscriptions';
  import { gql } from 'graphql-tag';
  import express from 'express';
  import bodyParser from 'body-parser';
  import cors from 'cors';
 
  async function startServer() {
 
    const typeDefs = gql`
      type UserStatus {
        userId: String!
        isOnline: Boolean!
      }
 
      type Query {
        userStatus: UserStatus!
      }
 
      type Subscription {
        userStatusUpdated: UserStatus!
      }
    `;
    const pubsub = new PubSub();
    const resolvers = {
      Query: {
        userStatus() {
          return userStatus;
        },
      },
      Subscription: {
        userStatusUpdated: {
          subscribe: () => pubsub.asyncIterator(['USER_STATUS_UPDATED']),
        },
      },
    };
    const schema = makeExecutableSchema({ typeDefs, resolvers });
 
 
    const app = express();
    const httpServer = createServer(app);
    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/',
    });
    const serverCleanup = useServer({ schema }, wsServer);
    const server = new ApolloServer({
      schema,
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
      ],
    });
 
    await server.start();
    app.use('/', cors(), bodyParser.json(), expressMiddleware(server));
 
   
    const PORT = 4000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 GraphQL Server ready at http://localhost:${PORT}/`);
      console.log(`🚀 GraphQL WS ready at ws://localhost:${PORT}/`);
    });
 
   
    let userStatus = {
      userId: "ceqak08y3sjkbasdfausjg",
      isOnline: true
    };
    function toggleUserStatus() {
      userStatus.isOnline = !userStatus.isOnline;
      pubsub.publish('USER_STATUS_UPDATED', { userStatusUpdated: userStatus });
      setTimeout(toggleUserStatus, 5000);
    }
    toggleUserStatus()
  }
 
  startServer()