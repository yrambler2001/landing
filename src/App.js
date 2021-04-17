import { ApolloProvider } from '@apollo/react-hooks';
import RootRouter from './router/RootRouter';
import apolloClient from './graphql/apollo';
import 'normalize.css';
import './styles/index.less';

const App = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <RootRouter />
    </ApolloProvider>
  );
};

export default App;
