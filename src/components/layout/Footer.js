import { Layout } from 'antd';
import classes from './Footer.module.css';

const { Footer } = Layout;

export default function DefaultFooter() {
  return (
    <Footer className={classes.footer}>
      <footer>
        <div>
          <small>
            Made with
            <span className="emoji" role="img" aria-label="love">
              ❤
            </span>
            by yrambler2001
            <br />
            Copyright © 2001-2021 - All Rights Reserved
          </small>
        </div>
      </footer>
    </Footer>
  );
}
