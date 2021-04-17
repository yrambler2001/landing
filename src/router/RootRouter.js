import { BrowserRouter as Router } from 'react-router-dom';
import { ConfirmAlertContainer } from '@uplab/react-confirm-alert';
import AuthRouter from './AuthRouter';

const RootRouter = ({ children }) => {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      {children}
      {<AuthRouter />}
      <ConfirmAlertContainer />
    </Router>
  );
};

export default RootRouter;
