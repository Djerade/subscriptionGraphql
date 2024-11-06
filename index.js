import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { gql } from 'graphql-tag';
// Data Sample
const product = [
  {
    id: 1,
    name: 'Product 1',
    category: "Air Conditionners"
  },
  {
    id: 2,
    name: 'God of war',
    category: "Air Conditionners"
  }
];

// Type
const typeDefs = gql `
  type Product {
    id: ID!
    name: String!
    category: String!
  }
  type Query {
    getAllProducts: [Product]
    getProductsById(id: ID!): Product
  }
`;

// Resolvers
const resolvers = {
  Query: {
    getAllProducts: () => product,
    getProductsById: (parent, args) => product.find(p => p.id === args.id)
  }
}

// Server
const url = "http://localhost:4000/graphql"
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, { listen: { port: 4000}}).then(() => {
  console.log(`🚀 Apollo Server listening at: ${url}`);
})