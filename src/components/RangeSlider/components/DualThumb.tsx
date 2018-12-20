import * as React from 'react';
import {autobind} from '@shopify/javascript-utilities/decorators';
import {
  addEventListener,
  removeEventListener,
} from '@shopify/javascript-utilities/events';
import {classNames} from '@shopify/react-utilities/styles';
import {invertNumber} from '../utilities';

import {Error} from '../../../types';

import * as styles from './DualThumb.scss';

export interface State {
  valueLower: number;
  valueUpper: number;
}

interface Props {
  id: string;
  cssVarPrefix: string;
  value: [number, number];
  min: number;
  max: number;
  step: number;
  output?: boolean;
  error?: Error;
  disabled?: boolean;
  onChange(value: [number, number], id: string): void;
  onFocus?(): void;
  onBlur?(): void;
}

export default class DualThumb extends React.Component<Props, State> {
  state: State = {
    valueLower: this.props.value[0],
    valueUpper: this.props.value[1],
  };

  private rail = React.createRef<HTMLDivElement>();
  private lowerThumb = React.createRef<HTMLDivElement>();
  private upperThumb = React.createRef<HTMLDivElement>();

  componentDidMount() {
    if (this.lowerThumb.current) {
      addEventListener(
        this.lowerThumb.current,
        'mousedown',
        this.handleLowerThumbMouseDown,
      );
    }

    if (this.upperThumb.current) {
      addEventListener(
        this.upperThumb.current,
        'mousedown',
        this.handleUpperThumbMouseDown,
      );
    }
  }

  render() {
    const {cssVarPrefix, min, max} = this.props;
    const {valueLower, valueUpper} = this.state;
    const sliderProgressLower = ((valueLower - min) * 100) / (max - min);
    const sliderProgressUpper = ((valueUpper - min) * 100) / (max - min);

    const cssVars = {
      [`${cssVarPrefix}unselected-lower`]: `${sliderProgressLower - 1}%`,
      [`${cssVarPrefix}selected-lower`]: `${sliderProgressLower}%`,
      [`${cssVarPrefix}selected-upper`]: `${sliderProgressUpper - 1}%`,
      [`${cssVarPrefix}unselected-upper`]: `${sliderProgressUpper}%`,
      [`${cssVarPrefix}output-factor-lower`]: invertNumber(
        (sliderProgressLower - 50) / 100,
      ),
      [`${cssVarPrefix}output-factor-upper`]: invertNumber(
        (sliderProgressUpper - 50) / 100,
      ),
    };

    const classNameLowerThumb = classNames(styles.Thumbs, styles.LowerThumb);
    const classNameUpperThumb = classNames(styles.Thumbs, styles.UpperThumb);

    return (
      <div className={styles.Wrapper}>
        <div className={styles.Rail} style={cssVars} ref={this.rail} />
        <div
          className={classNameLowerThumb}
          ref={this.lowerThumb}
          style={{
            left: `${this.state.valueLower}%`,
          }}
        />
        <div
          className={classNameUpperThumb}
          ref={this.upperThumb}
          style={{
            left: `calc(${this.state.valueUpper}%)`,
          }}
        />
      </div>
    );
  }

  @autobind
  private handleLowerThumbMouseDown() {
    if (this.lowerThumb.current) {
      addEventListener(document, 'mousemove', this.handleLowerThumbMouseMove);
      addEventListener(
        document,
        'mouseup',
        () => {
          removeEventListener(
            document,
            'mousemove',
            this.handleLowerThumbMouseMove,
          );
        },
        {once: true},
      );
    }
  }

  @autobind
  private handleLowerThumbMouseMove(event: MouseEvent) {
    if (this.rail.current) {
      const clientRect = this.rail.current.getBoundingClientRect();

      const relativeX = event.clientX - clientRect.left;

      const percentage = (relativeX / clientRect.width) * 100;

      const steppedPercentage = this.props.step
        ? roundToNearestStepValue(percentage, this.props.step)
        : percentage;

      if (steppedPercentage <= 0) {
        this.setState({valueLower: 0});
      } else if (steppedPercentage >= this.state.valueUpper) {
        const {valueUpper} = this.state;
        const valueLessStep = valueUpper - this.props.step;
        this.setState({valueLower: valueLessStep});
      } else {
        this.setState({valueLower: steppedPercentage});
      }
    }
  }

  @autobind
  private handleUpperThumbMouseDown() {
    if (this.upperThumb.current) {
      addEventListener(document, 'mousemove', this.handleUpperThumbMouseMove);
      addEventListener(
        document,
        'mouseup',
        () => {
          removeEventListener(
            document,
            'mousemove',
            this.handleUpperThumbMouseMove,
          );
        },
        {once: true},
      );
    }
  }

  @autobind
  private handleUpperThumbMouseMove(event: MouseEvent) {
    if (this.rail.current) {
      const clientRect = this.rail.current.getBoundingClientRect();

      const relativeX = event.clientX - clientRect.left;

      const percentage = (relativeX / clientRect.width) * 100;

      const steppedPercentage = this.props.step
        ? roundToNearestStepValue(percentage, this.props.step)
        : percentage;

      if (steppedPercentage >= 100) {
        this.setState({valueUpper: 100});
      } else if (steppedPercentage <= this.state.valueLower) {
        const {valueLower} = this.state;
        const valuePlusStep = valueLower + this.props.step;
        this.setState({valueUpper: valuePlusStep});
      } else {
        this.setState({valueUpper: steppedPercentage});
      }
    }
  }
}

function roundToNearestStepValue(value: number, step: number) {
  const intermediateValue = value / step;
  const roundedValue = Math.round(intermediateValue);
  return roundedValue * step;
}
