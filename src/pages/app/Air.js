import { useQuery } from '@apollo/react-hooks';
import { DatePicker } from 'antd';
import gql from 'graphql-tag';
import moment from 'moment';
import { useMemo, useRef, useState } from 'react';
import { Line } from '@nivo/line';
import useComponentSize from '@rehooks/component-size';

const query = gql`
  query co2Data($from: DateTime!, $to: DateTime!) {
    co2Data(from: $from, to: $to) {
      _id
      items {
        _id
        date
        co2
        temp
      }
      latestItem {
        _id
        date
        co2
        temp
      }
    }
  }
`;

export default function Air() {
  const [date, setDate] = useState(moment());

  const startDate = useMemo(
    () =>
      moment(date)
        .startOf('day')
        .toDate(),
    [date],
  );
  const endDate = useMemo(
    () =>
      moment(date)
        .endOf('day')
        .toDate(),
    [date],
  );
  const { data: newData } = useQuery(query, {
    variables: { from: startDate, to: endDate },
  });
  const fetchedData = useRef();
  fetchedData.current = newData || fetchedData.current;
  const data = fetchedData.current;
  const ref = useRef();
  const { width: actualWidth } = useComponentSize(ref);
  const width = Math.min(actualWidth, 1700);
  return (
    <div ref={ref} className="container" style={{ overflow: 'hidden' }}>
      {!fetchedData.current ? (
        'loading...'
      ) : (
        <div>
          <div className="spotify-controls margin-bottom-10">
            <DatePicker value={date} onChange={setDate} picker="day" />
          </div>
          <div className="margin-bottom-10" />
          <div>
            <Line
              key={width}
              {...{
                width,
                height: width * 0.4,
                margin: { top: 20, right: 20, bottom: 60, left: 80 },
                data,
                animate: true,
              }}
              data={[
                {
                  id: 'co2',
                  data: data.co2Data.items
                    .map((e) => ({ x: +new Date(e.date), y: e.co2 }))
                    .map((e) => ({ x: new Date(e.x), y: e.y })),
                },
                {
                  id: 'temp',
                  data: data.co2Data.items.map((e) => ({ x: new Date(e.date), y: (e.temp - 9) * 60 })),
                },
              ]}
              xScale={{
                type: 'time',
                format: '%Y-%m-%d',
                useUTC: false,
                precision: 'minute',
                min: startDate,
                max: endDate,
              }}
              xFormat="time:%Y-%m-%d"
              yScale={{
                type: 'linear',
                stacked: false,
                min: 250,
                max: 2000,
              }}
              axisLeft={{
                legend: 'ppm',
              }}
              axisBottom={{
                format: '%H:%M',
                tickValues: 'every 1 hours',
                legend: 'hour',
              }}
              curve="monotoneX"
              enablePointLabel
              pointSize={0}
              tooltip={(point) => {
                return (
                  <div
                    style={{
                      background: 'white',
                      color: 'inherit',
                      fontSize: 'inherit',
                      borderRadius: 2,
                      boxShadow: 'rgba(0, 0, 0, 0.25) 0px 1px 2px',
                      padding: '5px 9px',
                    }}
                  >
                    <div style={{ whiteSpace: 'pre', display: 'flex', alignItems: 'center' }}>
                      <span
                        style={{
                          display: 'block',
                          width: 12,
                          height: 12,
                          background: point.point.color,
                          marginRight: 7,
                        }}
                      />
                      {point.point.serieId === 'temp' ? (
                        <span>
                          <strong>{moment(point.point.data?.x).format('HH:mm')}</strong>,
                          <strong>{point.point.data.y / 60 + 9}</strong> °C
                        </span>
                      ) : (
                        <span>
                          <strong>{moment(point.point.data?.x).format('HH:mm')}</strong>,
                          <strong>{point.point.data.y}</strong> ppm
                        </span>
                      )}
                    </div>
                  </div>
                );
              }}
              enablePoints={false}
              isInteractive
              useMesh
              enableSlices={false}
            />
          </div>
          <div>{moment(data.co2Data.latestItem.date).format('YYYY-MM-DD HH:mm:ss')}</div>
          <div>{data.co2Data.latestItem.co2} ppm</div>
          <div>{data.co2Data.latestItem.temp} °C</div>
        </div>
      )}
    </div>
  );
}
