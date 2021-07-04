/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Timeline from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';
import { find, groupBy, map, sortBy, uniqBy } from 'lodash';
import { Button, DatePicker, InputNumber, notification, Switch } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { Bar } from '@nivo/bar';
import useComponentSize from '@rehooks/component-size';
import { interpolatePlasma, interpolateRainbow, interpolateRdYlBu } from 'd3-scale-chromatic';
import { DownOutlined, LeftOutlined, MinusOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';

const getCodeToCreatePlaylistWithSongs = ({ name, description = name, uris }) => {
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
        description: ${JSON.stringify(description)},
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
  const itemProps = getItemProps(item.itemProps);
  return (
    <div
      {...itemProps}
      style={{
        ...itemProps.style,
        background: interpolateRdYlBu((item.nextTimestamp - item.start_time) / (2 * 1000 * 60) || 1),
      }}
    >
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

const BarComponent = ({ bar }) => {
  const overflowText = bar.width < 500;

  return (
    <g transform={`translate(${bar.x},${bar.y})`}>
      <rect x={-3} y={7} width={bar.width} height={bar.height} fill="rgba(0, 0, 0, .07)" />
      <rect width={bar.width} height={bar.height} fill={interpolatePlasma(bar.width / 1100)} />
      <rect x={bar.width - 5} width={5} height={bar.height} fill="rgba(0, 0, 0, .07)" fillOpacity={0.2} />
      <foreignObject
        x={overflowText ? bar.width : 0}
        y={bar.height / 2 - 13}
        style={{
          textAlign: overflowText ? 'left' : 'right',
          wordWrap: 'break-word',
          height: 30,
          width: overflowText ? '1000px' : bar.width - 40,
          overflow: 'visible',
        }}
        requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
      >
        <p
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: overflowText ? '1000px' : bar.width - 40,
            fontSize: '17px',
          }}
        >
          {bar.data.data.name}
        </p>
      </foreignObject>
      <text
        x={bar.width - 16}
        y={bar.height / 2}
        textAnchor="end"
        dominantBaseline="central"
        fill={interpolateRainbow(bar.width / 1100)}
        style={{
          fontWeight: 400,
          fontSize: 13,
        }}
      >
        {bar.data.value}
      </text>
    </g>
  );
};

const RaceChart = ({ data }) => {
  const barData = [...data].slice(0, 100).reverse();
  const ref = useRef();
  const { width: actualWidth } = useComponentSize(ref);
  const width = 1000;
  const height = barData.length * 40;
  const allHeight = height; // + 40;
  const scale = Math.min(actualWidth, 1400) / width;
  return (
    <div style={{ overflow: 'hidden' }}>
      <div
        ref={ref}
        style={{
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          height: allHeight * scale,
        }}
      >
        {/* <h2 style={{ marginLeft: 60, fontWeight: 400, color: '#555' }}>
        </h2> */}
        <Bar
          width={1000}
          height={height}
          layout="horizontal"
          margin={{ top: 26, right: 26, bottom: 26, left: 26 }}
          data={barData}
          indexBy="id"
          keys={['value']}
          colors={{ scheme: 'blues' }}
          colorBy="indexValue"
          borderColor={{ from: 'color', modifiers: [['darker', 2.6]] }}
          // enableGridX
          enableGridY={false}
          axisTop={{
            format: '~s',
          }}
          axisBottom={{
            format: '~s',
          }}
          axisLeft={null}
          padding={0.3}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.4]] }}
          isInteractive={false}
          barComponent={BarComponent}
        />
      </div>
    </div>
  );
};

export default function Spotify(props) {
  const {
    match: {
      params: { id },
    },
  } = props;
  const [date, setDate] = useState(moment());
  const [openOnClick, setOpenOnClick] = useState(false);
  const [numberOfRows, setNumberOfRows] = useState(20);
  const groups = useMemo(
    () => new Array(numberOfRows).fill(null).map((e, index) => ({ id: index, title: index + 1 })),
    [numberOfRows],
  );
  const [defaultStart, defaultEnd] = useMemo(() => [+new Date() - 10000000, +new Date() + 10000000], []);
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
  const timestampsWithSongsFilteredSongPauseResume = useMemo(
    () =>
      timestampsWithSongs.reduce((prev, curr) => {
        const lastSong = prev[prev.length - 1];
        if (
          lastSong &&
          lastSong._id === curr._id &&
          new Date(curr.timestamp) - new Date(lastSong.timestamp) < 1000 * 60 * 2 // remove items that are repeated more often that 2 minutes
        )
          return prev;
        return [...prev, curr];
      }, []),
    [timestampsWithSongs],
  );

  const items = useMemo(
    () =>
      timestampsWithSongsFilteredSongPauseResume.map((songWithTimestamp, index, array) => ({
        id: `${songWithTimestamp._id}_${songWithTimestamp.timestamp}`,
        url: `https://open.spotify.com/track/${songWithTimestamp._id.replace('spotify:track:', '')}?si=`,
        group: index % numberOfRows,
        title: songWithTimestamp.name,
        artist: songWithTimestamp.artistName,
        img: songWithTimestamp.imageUrl,
        start_time: new Date(songWithTimestamp.timestamp),
        end_time: new Date(songWithTimestamp.timestamp),
        nextTimestamp: new Date(array[index + 1]?.timestamp),
      })),
    [numberOfRows, timestampsWithSongsFilteredSongPauseResume],
  );
  const timestampsWithSongsFilteredSongPauseResumeBySongs = sortBy(
    Object.values(groupBy(timestampsWithSongsFilteredSongPauseResume, '_id')),
    'length',
  )
    .reverse()
    .map((songsWithTimestamps) => ({
      ...songsWithTimestamps[0],
      timestamps: songsWithTimestamps.map((songWithTimestamp) => songWithTimestamp.timestamp),
    }));

  const chartData = useMemo(
    () =>
      timestampsWithSongsFilteredSongPauseResumeBySongs.map((songWithTimestamps, index) => ({
        name: `${songWithTimestamps.artistName} - ${songWithTimestamps.name}`,
        id: index,
        value: songWithTimestamps.timestamps.length,
      })),
    [timestampsWithSongsFilteredSongPauseResumeBySongs],
  );
  const timelineRef = useRef();
  if (user.loading) return 'loading...';
  const userName = user?.data?.spotifyUser?.name || 'User';
  return (
    <div className="container">
      <h1>
        {user?.data?.spotifyUser?.name}&apos;s Spotify songs {loading ? 'loading...' : null}
      </h1>
      <div className="spotify-controls margin-bottom-10">
        <DatePicker value={date} onChange={setDate} picker="month" />
        <Button
          onClick={() => {
            const uniqueSongsFromNewest = uniqBy([...timestampsWithSongs].reverse(), '_id');
            const uniqueSongsFromNewestUris = uniqueSongsFromNewest.map((e) => e._id);
            const stringToCreatePlaylist = getCodeToCreatePlaylistWithSongs({
              name: `${userName}'s songs in ${moment(date).format('MM.YYYY')} from newest to oldest`,
              uris: uniqueSongsFromNewestUris,
            });
            navigator.clipboard.writeText(stringToCreatePlaylist);
            notification.success({
              message: 'Copied to clipboard',
              description:
                'Please open the Spotify web player in browser, open developer tools console and paste the code into console.',
            });
          }}
        >
          Create playlist from newest to oldest
        </Button>
        <Button
          onClick={() => {
            const uniqueSongsFromMostListenedUris = timestampsWithSongsFilteredSongPauseResumeBySongs.map((e) => e._id);
            const stringToCreatePlaylist = getCodeToCreatePlaylistWithSongs({
              name: `${userName}'s songs in ${moment(date).format('MM.YYYY')} from most listened to least listened`,
              uris: uniqueSongsFromMostListenedUris,
            });
            navigator.clipboard.writeText(stringToCreatePlaylist);
            notification.success({
              message: 'Copied to clipboard',
              description:
                'Please open the Spotify web player in browser, open developer tools console and paste the code into console.',
            });
          }}
        >
          Create playlist from most listened to least listened
        </Button>
        <div>
          <span>Open song on click</span>
          <Switch checked={openOnClick} onChange={setOpenOnClick} />
        </div>
        <div>
          <span>Rows</span>
          <InputNumber min={1} value={numberOfRows} onChange={setNumberOfRows} />
        </div>
      </div>
      <div className="margin-bottom-10">
        <Button
          icon={<LeftOutlined />}
          onClick={() => {
            const delta = timelineRef.current.state.visibleTimeEnd - timelineRef.current.state.visibleTimeStart;
            timelineRef.current.updateScrollCanvas(
              timelineRef.current.state.visibleTimeStart - delta * 0.3,
              timelineRef.current.state.visibleTimeEnd - delta * 0.3,
            );
          }}
        />
        <Button
          icon={<DownOutlined />}
          onClick={() => {
            const delta = timelineRef.current.state.visibleTimeEnd - timelineRef.current.state.visibleTimeStart;
            const half = delta / 2;
            const currentDate = +new Date();
            timelineRef.current.updateScrollCanvas(currentDate - half, currentDate + half);
          }}
        />
        <Button
          icon={<RightOutlined />}
          onClick={() => {
            const delta = timelineRef.current.state.visibleTimeEnd - timelineRef.current.state.visibleTimeStart;
            timelineRef.current.updateScrollCanvas(
              timelineRef.current.state.visibleTimeStart + delta * 0.3,
              timelineRef.current.state.visibleTimeEnd + delta * 0.3,
            );
          }}
        />
        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            const delta = timelineRef.current.state.visibleTimeEnd - timelineRef.current.state.visibleTimeStart;
            if (delta < 500000) return;
            timelineRef.current.updateScrollCanvas(
              timelineRef.current.state.visibleTimeStart + delta * 0.3,
              timelineRef.current.state.visibleTimeEnd - delta * 0.3,
            );
          }}
        />
        <Button
          icon={<MinusOutlined />}
          onClick={() => {
            const delta = timelineRef.current.state.visibleTimeEnd - timelineRef.current.state.visibleTimeStart;
            if (delta > 5000000000) return;
            timelineRef.current.updateScrollCanvas(
              timelineRef.current.state.visibleTimeStart - delta * 0.3,
              timelineRef.current.state.visibleTimeEnd + delta * 0.3,
            );
          }}
        />
        <span className="margin-left-10">
          You can also use Command/Control + mouse wheel to scale the timeline, use shift + mouse wheel to move the
          timeline.
        </span>
      </div>
      <Timeline
        ref={timelineRef}
        // itemTouchSendsClick
        canMove={false}
        canChangeGroup={false}
        canResize={false}
        itemHeightRatio={0.95}
        lineHeight={35}
        sidebarWidth={30}
        itemRenderer={itemRenderer}
        groups={groups}
        items={items}
        minZoom={(60 * 60 * 1000) / 10} // 1/10 of hour
        maxZoom={365.24 * 86400 * 1000} // 1 year
        defaultTimeStart={defaultStart}
        defaultTimeEnd={defaultEnd}
        // selected={emptyArray}
        onItemClick={(itemId) => {
          if (!openOnClick) return;
          const item = find(items, { id: itemId });
          window.open(item.url, '_blank').focus();
          // console.log(item);
        }}
      />
      <RaceChart key={date} data={chartData} />
    </div>
  );
}
