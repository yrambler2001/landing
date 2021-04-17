export default {
  isDevelopment: process.env.NODE_ENV !== 'production', // on localhost this is true
  isProduction: process.env.NODE_ENV === 'production',
  graphqlServerUrl: process.env.REACT_APP_GRAPHQL_SERVER_URL,
};
