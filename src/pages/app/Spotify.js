import { useQuery } from '@apollo/react-hooks';
import { List } from 'antd';
import gql from 'graphql-tag';
import { sortBy } from 'lodash';
import { Link } from 'react-router-dom';

const query = gql`
  query spotifySongsUsersList {
    spotifySongsUsersList {
      _id
      name
    }
  }
`;

export default function Spotify() {
  const resp = useQuery(query);
  return (
    <div className="container">
      <h1>Spotify</h1>
      <List
        style={{ width: 'fit-content' }}
        size="small"
        bordered
        dataSource={sortBy(resp?.data?.spotifySongsUsersList || [], (e) =>
          e._id === 'spotify:user:215ruo2tpvxeodikkltkwx5oa' ? '0' : e.name,
        )}
        renderItem={(item) => (
          <List.Item>
            <Link to={`/spotify/${item._id}`} key={item._id}>
              {item.name}
            </Link>
          </List.Item>
        )}
      />
    </div>
  );
}
