/* eslint-disable no-console */
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { print } from 'graphql';
import get from 'lodash/get';
import { serializeError } from 'serialize-error';
import { isUndefined } from 'lodash';
import gql from 'graphql-tag';
import settings from '../config/settings';
import { formatQueryByErrorPositions } from './utils';

const link = ApolloLink.from([
  setContext((_, context) => {
    context.headers = context.headers || {};
    context.headers['location-href'] = window?.location?.href;
    return context;
  }),
  onError(({ graphQLErrors, networkError, operation }) => {
    const logError = (error, { errorType }) => {
      const { message, locations, path, extensions, stack } = error;
      if (extensions?.exception) extensions.exception.logged = true;
      const lExtensions = JSON.stringify({
        ...extensions,
        ...(extensions?.exception && {
          exception: { ...extensions.exception, ...(extensions.exception?.stacktrace && { stacktrace: '(below)' }) },
        }),
      });
      const lStacktrace =
        get(extensions, 'exception.stacktrace', []).reduce(
          (p, c, index) => (p || '').concat(index !== 0 ? '\n' : '', c),
          '',
        ) ||
        stack ||
        ''; // array to string
      const lVariables = JSON.stringify(operation.variables);
      const lQuery = formatQueryByErrorPositions({ queryString: print(operation.query), errorPositions: locations });
      const lPath = JSON.stringify(path);
      const lLocations = JSON.stringify(locations);
      const lMessage = JSON.stringify(message);
      console.error(
        [
          `[${errorType}]:`,
          lMessage && `Message: ${lMessage}`,
          lLocations && `Location: ${lLocations}`,
          lPath && `Path: ${lPath}`,
          lQuery && `Query:\n${lQuery}`,
          lVariables && `Variables: ${lVariables}`,
          lExtensions && `Extensions: ${lExtensions}`,
          lStacktrace && `Stacktrace: ${lStacktrace}`,
          error && `Serialized Error: ${JSON.stringify(serializeError(error))}`,
        ]
          .filter(Boolean)
          .join('\n'),
        extensions,
      );
    };
    if (graphQLErrors) {
      graphQLErrors.forEach((error) => {
        const doNotLogOnClient = get(error, 'extensions.exception.doNotLogOnClient');
        if (!doNotLogOnClient) logError(error, { errorType: 'GraphQL error' });
      });
    }

    if (!graphQLErrors && networkError) logError(networkError, { errorType: 'Network error' });
  }),
  new HttpLink({
    uri: settings.graphqlServerUrl,
    credentials: 'include',
  }),
]);

const apollo = new ApolloClient({
  link,
  cache: new InMemoryCache({
    freezeResults: true,
    dataIdFromObject: ({ _id, __typename }) => {
      return _id ? [__typename, _id].filter((e) => !isUndefined(e)).join('___') : null;
    },
  }),
  assumeImmutableResults: true,
});

window.gql = gql;
window.apollo = apollo;

export default apollo;
