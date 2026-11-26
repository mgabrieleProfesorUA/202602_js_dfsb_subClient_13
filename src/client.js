import { ApolloClient, InMemoryCache, gql, split, HttpLink } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

// 1. Create an HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: 'http://localhost:4000', // Replace with your GraphQL server URL
});

// 2. Create a WebSocket link for subscriptions
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000', // Replace with your GraphQL server URL
  options: {
    reconnect: true,
  },
});

// 3. Use `split` to direct traffic to the appropriate link (HTTP or WebSocket)
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

// 4. Create the Apollo Client
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

// 5. Define the subscription query
const POST_CREATED_SUBSCRIPTION = gql`
  subscription PostCreated {
    postCreated {
      id
      content
    }
  }
`;

// 6. Subscribe to the event
client.subscribe({
  query: POST_CREATED_SUBSCRIPTION,
}).subscribe({
  next(data) {
    console.log('New post created:', data.data.postCreated);
    // Update your UI with the new post
  },
  error(err) {
    console.error('Subscription error:', err);
  },
});