/* eslint-disable import/prefer-default-export */

import groupBy from 'lodash/groupBy';
import max from 'lodash/max';

// adds "^" symbol to query string where error exist
export const formatQueryByErrorPositions = ({ queryString, errorPositions }) => {
  if (!errorPositions) return queryString;
  try {
    const columnsByLine = groupBy(errorPositions, 'line');
    const lineNumbers = Object.keys(columnsByLine).sort((a, b) => b - a);
    const queryStringLines = queryString.split('\n');
    lineNumbers.forEach((lineIndex) => {
      const columns = columnsByLine[lineIndex].map((object) => object.column);
      const maxColumn = max(columns);
      queryStringLines.splice(lineIndex, 0, '');
      queryStringLines[lineIndex] = new Array(maxColumn).fill(' ');
      columns.forEach((column) => {
        queryStringLines[lineIndex][column - 1] = '^';
      });
      queryStringLines[lineIndex] = queryStringLines[lineIndex].join('');
    });
    return queryStringLines.join('\n').trim();
  } catch (e) {
    console.error(e);
    return queryString;
  }
};
