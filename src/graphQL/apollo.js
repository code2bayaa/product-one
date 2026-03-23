import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_ENVIRONMENT === "development" ?
        process.env.REACT_APP_GRAPHQL
        :
        process.env.REACT_APP_GRAPHQL_LIVE
  }),
  cache: new InMemoryCache(),
});
