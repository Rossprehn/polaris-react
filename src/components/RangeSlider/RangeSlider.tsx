import * as React from 'react';
import {autobind} from '@shopify/javascript-utilities/decorators';
import {createUniqueIDFactory} from '@shopify/javascript-utilities/other';
import {classNames} from '@shopify/react-utilities/styles';

import {Error} from '../../types';
import {withAppProvider, WithAppProviderProps} from '../AppProvider';
import Labelled, {Action, helpTextID} from '../Labelled';
import {DualThumb} from './components/DualThumb';
import {invertNumber} from './utilities';

import * as styles from './RangeSlider.scss';

export interface State {
  id: string;
}

export interface BaseProps {
  /** Label for the range input */
  label: string;
  /** Adds an action to the label */
  labelAction?: Action;
  /** Visually hide the label */
  labelHidden?: boolean;
  /** ID for range input */
  id?: string;
  /** Initial value for range input */
  value: number | [number, number];
  /** Minimum possible value for range input */
  min?: number;
  /** Maximum possible value for range input */
  max?: number;
  /** Increment value for range input changes */
  step?: number;
  /** Provide a tooltip while sliding, indicating the current value */
  output?: boolean;
  /** Additional text to aid in use */
  helpText?: React.ReactNode;
  /** Display an error message */
  error?: Error;
  /** Disable input */
  disabled?: boolean;
  /** Element to display before the input */
  prefix?: React.ReactNode;
  /** Element to display after the input */
  suffix?: React.ReactNode;
  /** Displays text fields as the prefix and suffix for the dual thumb slider only */
  accessibilityInputs?: boolean;
  /** Callback when the range input is changed */
  onChange(value: number | [number, number], id: string): void;
  /** Callback when range input is focused */
  onFocus?(): void;
  /** Callback when focus is removed */
  onBlur?(): void;
}

export interface Props extends BaseProps {}
export type CombinedProps = Props & WithAppProviderProps;

const getUniqueID = createUniqueIDFactory('RangeSlider');
const cssVarPrefix = '--Polaris-RangeSlider-';

export class RangeSlider extends React.PureComponent<CombinedProps, State> {
  static getDerivedStateFromProps(nextProps: CombinedProps, prevState: State) {
    return nextProps.id != null && nextProps.id !== prevState.id
      ? {
          id: nextProps.id || prevState.id,
        }
      : null;
  }

  constructor(props: CombinedProps) {
    super(props);

    this.state = {
      id: props.id || getUniqueID(),
    };
  }

  render() {
    const {id} = this.state;
    const {min = 0, max = 100} = this.props;
    const {disabled = false} = this.props;
    const {output = false} = this.props;
    const {
      label,
      labelAction,
      labelHidden,
      step = 1,
      value,
      helpText,
      error,
      prefix,
      suffix,
      accessibilityInputs,
      onChange,
      onFocus,
      onBlur,
    } = this.props;

    const dualThumb = typeof value === 'object';

    const describedBy: string[] = [];

    if (error) {
      describedBy.push(`${id}Error`);
    }

    if (helpText) {
      describedBy.push(helpTextID(id));
    }

    const ariaDescribedBy = describedBy.length
      ? describedBy.join(' ')
      : undefined;

    const sliderProgress = ((value as number - min) * 100) / (max - min);

    const cssVars = {
      [`${cssVarPrefix}min`]: min,
      [`${cssVarPrefix}max`]: max,
      [`${cssVarPrefix}current`]: value,
      [`${cssVarPrefix}progress`]: `${sliderProgress}%`,
      [`${cssVarPrefix}output-factor`]: invertNumber(
        (sliderProgress - 50) / 100,
      ),
    };

    const classNameOutput = classNames(
      styles.Output,
      styles.SingleOutput,
    );

    const outputMarkup = !disabled &&
      output && (
        <output htmlFor={id} className={classNameOutput}>
          <div className={styles.OutputBubble}>
            <span className={styles.OutputText}>{value}</span>
          </div>
        </output>
      );

    const prefixMarkup = prefix && !dualThumb && (
      <div className={styles.Prefix}>{prefix}</div>
    );

    const suffixMarkup = suffix && !dualThumb && (
      <div className={styles.Suffix}>{suffix}</div>
    );

    const className = classNames(
      styles.RangeSlider,
      error && styles.error,
      disabled && styles.disabled,
    );

    const inputMarkup = dualThumb ? (
      <DualThumb
        id={id}
        value={value as [number, number]}
        min={min}
        max={max}
        step={step}
        output={output}
        cssVarPrefix={cssVarPrefix}
        error={error}
        prefix={prefix}
        suffix={suffix}
        disabled={disabled}
        accessibilityInputs={accessibilityInputs}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    ) : (
      <div className={styles.InputWrapper} style={cssVars}>
        <div className={styles.InputWrapper}>
          <input
            type="range"
            className={styles.Input}
            id={id}
            name={id}
            min={min}
            max={max}
            step={step}
            value={value as number}
            disabled={disabled}
            onChange={this.handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value as number}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy}
          />
          {outputMarkup}
        </div>
      </div>
    );

    return (
      <Labelled
        id={id}
        label={label}
        error={error}
        action={labelAction}
        labelHidden={labelHidden}
        helpText={helpText}
      >
        <div className={className}>
          {prefixMarkup}
          {inputMarkup}
          {suffixMarkup}
        </div>
      </Labelled>
    );
  }

  @autobind
  private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const {onChange} = this.props;

    if (onChange == null) {
      return;
    }

    onChange(parseFloat(event.currentTarget.value) as number, this.state.id);
  }
}

export default withAppProvider<Props>()(RangeSlider);
