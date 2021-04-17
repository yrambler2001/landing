import { Switch, Route, Redirect } from 'react-router-dom';
import AuthLayout from 'components/layouts/AuthLayout';
import Home from 'pages/app/Home';
import ScrollToTop from 'components/common/ScrollToTop';
import NotFoundPage from 'pages/NotFound';

export const routes = [
  {
    path: '/',
    component: Home,
  },
];

const AuthRouter = () => (
  <AuthLayout>
    <ScrollToTop />
    <Switch>
      {routes.map(({ path, component, ...rest }) => (
        <Route key={path} path={path} component={component} exact {...rest} />
      ))}
      <Route render={() => <Redirect to={NotFoundPage} />} />
    </Switch>
  </AuthLayout>
);

export default AuthRouter;
