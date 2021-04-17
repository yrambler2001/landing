import { Layout } from 'antd';
import Footer from 'components/layout/Footer';
import classes from './AuthLayout.module.css';

const {
  // Header,
  Content,
} = Layout;

export default function AuthLayout({ children }) {
  return (
    <Layout className={classes.layout}>
      {/* <Header className={s.header}>header</Header> */}
      <Content className={classes.content}>{children}</Content>
      <Footer />
    </Layout>
  );
}
