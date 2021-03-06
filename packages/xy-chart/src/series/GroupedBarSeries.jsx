import React from 'react';
import PropTypes from 'prop-types';

import BarGroup from '@vx/shape/build/shapes/BarGroup';
import color from '@data-ui/theme/build/color';

import { groupedBarSeriesDataShape } from '../utils/propShapes';
import { scaleTypeToScale } from '../utils/chartUtils';

const propTypes = {
  data: groupedBarSeriesDataShape.isRequired,
  groupKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  groupFills: PropTypes.arrayOf(PropTypes.string),
  stroke: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  strokeWidth: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  groupPadding: PropTypes.number, // see https://github.com/d3/d3-scale#band-scales

  // these will likely be injected by the parent xychart
  xScale: PropTypes.func,
  yScale: PropTypes.func,
  onMouseMove: PropTypes.func,
  onMouseLeave: PropTypes.func,
};

const defaultProps = {
  groupKeys: null,
  groupFills: color.categories,
  groupPadding: 0.1,
  stroke: 'none',
  strokeWidth: 1,
  xScale: null,
  yScale: null,
  onMouseMove: undefined,
  onMouseLeave: undefined,
};

const x = d => d.x;

export default class GroupedBarSeries extends React.PureComponent {
  render() {
    const {
      data,
      groupKeys,
      groupFills,
      groupPadding,
      stroke,
      strokeWidth,
      xScale,
      yScale,
      onMouseMove,
      onMouseLeave,
    } = this.props;

    if (!xScale || !yScale) return null;
    if (!xScale.bandwidth) { // @todo figure this out/be more graceful
      throw new Error("'GroupedBarSeries' requires a 'band' type xScale");
    }
    const maxHeight = (yScale.range() || [0])[0];
    const x1Scale = scaleTypeToScale.band({
      rangeRound: [0, xScale.bandwidth()],
      domain: groupKeys,
      padding: groupPadding,
    });
    const zScale = scaleTypeToScale.ordinal({ range: groupFills, domain: groupKeys });
    return (
      <BarGroup
        data={data}
        keys={groupKeys}
        height={maxHeight}
        x0={x}
        x0Scale={xScale}
        x1Scale={x1Scale}
        yScale={yScale}
        zScale={zScale}
        rx={2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        onMouseMove={onMouseMove && (d => (event) => {
          const { key, data: datum } = d;
          onMouseMove({ event, data, datum, key, color: zScale(key) });
        })}
        onMouseLeave={onMouseLeave && (() => onMouseLeave)}
      />
    );
  }
}

GroupedBarSeries.propTypes = propTypes;
GroupedBarSeries.defaultProps = defaultProps;
GroupedBarSeries.displayName = 'GroupedBarSeries';
