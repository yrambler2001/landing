import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
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
      {resp?.data?.spotifySongsUsersList?.map((e) => (
        <div>
          <Link to={`/spotify/${e._id}`} key={e._id}>
            {e.name}
          </Link>
        </div>
      ))}
    </div>
  );
}
