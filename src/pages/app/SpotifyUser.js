/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Timeline from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';
import { find, map, sortBy, uniqBy } from 'lodash';
import { Button, DatePicker } from 'antd';
import { useMemo, useState } from 'react';

const getCodeToCreatePlaylistWithSongs = (name, uris) => {
  return `
  // HOW TO USE:
  // 1. Open developer tools in your browser
  // To open the developer console in Google Chrome, open the Chrome Menu in the upper-right-hand corner of the browser window and select More Tools > Developer Tools. You can also use the shortcut Option + ⌘ + J (on macOS), or Shift + CTRL + J (on Windows/Linux).
  // 2. Open console tab.
  // 3. Copy all the code and paste it into console, press enter.
  // 4. Wait a few seconds.
  // 5. New playlist is created.
  (async () => {
    // override fetch to automatically get token
    let token;
    const fetchOld = window.fetch;
    const newFetch = function fetch(...args) {
      if (args?.[1]?.headers?.authorization) {
        token = args[1].headers.authorization;
      }
      return fetchOld.apply(this, args);
    };
    window.fetch = newFetch;
    // trigger fetch to get token
    try {
      document.querySelector('nav a.logo').click();
    } catch (e) {
      console.log(e);
      try {
        document.querySelector('nav ul a').click();
      } catch (ee) {
        console.log(ee);
      }
    }
    // wait for fetch to be called
    for (let i = 0; i < 80 && !token; i++) {
      await new Promise((res) => window.setTimeout(res), 100);
    }
    window.cache = window.cache || {};
    const cacheEnabled = false;
    const cacheData = async (key, fnForData) =>
      (cacheEnabled && window.cache[key]) || (window.cache[key] = await fnForData());
    const fetchWithCache = async (...params) =>
      cacheData(JSON.stringify(params), () => fetch(...params).then((r) => r.json()));
    const fetchWithCacheGet = async (url) =>
    fetchWithCache(url, {
      headers: {
        accept: 'application/json',
        authorization: token,
      },
      method: 'GET',
    });  
    const fetchWithCachePost = async ({ url, data }) =>
      fetchWithCache(url, {
        headers: {
          accept: 'application/json',
          authorization: token,
        },
        body: JSON.stringify(data),
        method: 'POST',
      });
  
    function chunk(arr, chunkSize) {
      if (chunkSize <= 0) throw new Error('Invalid chunk size');
      const R = [];
      for (let i = 0, len = arr.length; i < len; i += chunkSize) R.push(arr.slice(i, i + chunkSize));
      return R;
    }
    const allUris = ${JSON.stringify(uris)};
    const me = await fetchWithCacheGet('https://api.spotify.com/v1/me');
    const createdPlaylist = await fetchWithCachePost({
      url: \`https://api.spotify.com/v1/users/\${me.id}/playlists\`,
      data: {
        name: ${JSON.stringify(name)},
        description: ${JSON.stringify(name)},
        public: true,
      },
    });
    for (const uris of chunk(allUris, 100)) {
      await fetchWithCachePost({
        url: \`https://api.spotify.com/v1/playlists/\${createdPlaylist.id}/tracks\`,
        data: { uris, position: null },
      });
    }
    console.log('ok');
  })();`.trim();
};
const itemRenderer = ({ item, itemContext, getItemProps }) => {
  return (
    <div {...getItemProps(item.itemProps)}>
      <div className="rct-item-content" style={{ maxHeight: `${itemContext.dimensions.height}` }}>
        {/* <a target="_blank" rel="noopener noreferrer" href={item.url}> */}
        <img alt="" src={item.img} />
        <div>
          {itemContext.title}
          {'\n'}
          {item.artist}
        </div>
        {/* </a> */}
      </div>
    </div>
  );
};

// window.getCodeToCreatePlaylistWithSongs = getCodeToCreatePlaylistWithSongs;

const query = gql`
  query spotifySongsByUser($userUri: String!, $startDate: DateTime!, $endDate: DateTime!) {
    spotifySongsByUser(userUri: $userUri, startDate: $startDate, endDate: $endDate) {
      _id
      song {
        _id
        albumUri
        artistUri
        imageUrl
        name
        artistName
      }
      timestamps
    }
  }
`;
const userQuery = gql`
  query spotifyUser($userUri: String!) {
    spotifyUser(userUri: $userUri) {
      _id
      name
    }
  }
`;

const groupsCount = 20;
const groups = new Array(20).fill(null).map((e, index) => ({ id: index, title: index + 1 }));

export default function Spotify(props) {
  const {
    match: {
      params: { id },
    },
  } = props;
  const [date, setDate] = useState(moment());
  const startDate = useMemo(
    () =>
      moment(date)
        .startOf('month')
        .toDate(),
    [date],
  );
  const endDate = useMemo(
    () =>
      moment(date)
        .endOf('month')
        .toDate(),
    [date],
  );
  const user = useQuery(userQuery, {
    variables: { userUri: id },
  });
  const { data, loading } = useQuery(query, {
    variables: {
      userUri: id,
      startDate,
      endDate,
    },
  });
  // window.data = data;

  const songsWithFilteredTimestamps = useMemo(
    () =>
      map(data?.spotifySongsByUser, (song) => ({
        ...song,
        timestamps: song.timestamps.filter((timestamp) => moment(timestamp).isBetween(startDate, endDate)),
      })),
    [data?.spotifySongsByUser, endDate, startDate],
  );
  const timestampsWithSongs = useMemo(
    () =>
      sortBy(
        map(songsWithFilteredTimestamps, (song) =>
          song.timestamps.map((timestamp) => ({ ...song.song, timestamp })),
        ).flat(),
        'timestamp',
      ),
    [songsWithFilteredTimestamps],
  );
  const items = useMemo(
    () =>
      timestampsWithSongs.map((songWithTimestamp, index) => ({
        id: `${songWithTimestamp._id}_${songWithTimestamp.timestamp}`,
        url: `https://open.spotify.com/track/${songWithTimestamp._id.replace('spotify:track:', '')}?si=`,
        group: index % groupsCount,
        title: songWithTimestamp.name,
        artist: songWithTimestamp.artistName,
        img: songWithTimestamp.imageUrl,
        start_time: new Date(songWithTimestamp.timestamp),
        end_time: new Date(songWithTimestamp.timestamp),
      })),
    [timestampsWithSongs],
  );
  if (user.loading) return 'loading...';
  return (
    <div className="container">
      <h1>{user?.data?.spotifyUser?.name}&apos;s Spotify songs</h1>
      <DatePicker value={date} onChange={setDate} picker="month" />
      {loading ? 'Loading...' : null}
      <Button
        onClick={() => {
          const uniqueSongsFromNewest = uniqBy([...timestampsWithSongs].reverse(), '_id');
          const uniqueSongsFromNewestUris = uniqueSongsFromNewest.map((e) => e._id);
          const stringToCreatePlaylist = getCodeToCreatePlaylistWithSongs('a123', uniqueSongsFromNewestUris);
          // console.log(stringToCreatePlaylist);
          navigator.clipboard.writeText(stringToCreatePlaylist);
        }}
      >
        From newest to oldest
      </Button>
      <Button
        onClick={() => {
          const uniqueSongsFromMostListened = sortBy(songsWithFilteredTimestamps, 'timestamps.length').reverse();
          const uniqueSongsFromLatestUris = uniqueSongsFromMostListened.map((e) => e._id);
          const stringToCreatePlaylist = getCodeToCreatePlaylistWithSongs('a123', uniqueSongsFromLatestUris);
          // console.log(stringToCreatePlaylist);
          navigator.clipboard.writeText(stringToCreatePlaylist);
        }}
      >
        From most listened to least listened
      </Button>
      <br />
      <br />
      <Timeline
        itemTouchSendsClick
        canMove={false}
        canChangeGroup={false}
        canResize={false}
        itemHeightRatio={0.95}
        lineHeight={35}
        itemRenderer={itemRenderer}
        groups={groups}
        items={items}
        defaultTimeStart={startDate}
        defaultTimeEnd={endDate}
        // selected={emptyArray}
        onItemClick={(itemId) => {
          const item = find(items, { id: itemId });
          window.open(item.url, '_blank').focus();
          // console.log(item);
        }}
      />
    </div>
  );
}