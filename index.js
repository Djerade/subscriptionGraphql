
import { WebSocketServer } from 'graphql-ws';
import express from 'express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/lib/use/ws';
import http from 'http';
import { typeDefs, resolvers } from './schema';

const app = express();
const schema = makeExecutableSchema({ typeDefs, resolvers });

const httpServer = http.createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            wsServer.close();
          },
        };
      },
    },
  ],
});

await server.start();
server.applyMiddleware({ app, path: '/graphql' });

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/graphql`);
});
