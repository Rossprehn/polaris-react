import * as React from 'react';
import {noop} from '@shopify/javascript-utilities/other';
import {shallowWithAppProvider, mountWithAppProvider} from 'test-utilities';
import RangeSlider from '../RangeSlider';
import {invertNumber} from '../utilities';
import {DualThumb} from '../components/DualThumb';

describe('<RangeSlider />', () => {
  it('allows specific props to pass through properties on the input', () => {
    const input = shallowWithAppProvider(
      <RangeSlider
        label="RangeSlider"
        value={15}
        min={10}
        max={20}
        step={0.5}
        disabled
        onChange={noop}
      />,
    ).find('input');

    expect(input.prop('value')).toBe(15);
    expect(input.prop('min')).toBe(10);
    expect(input.prop('max')).toBe(20);
    expect(input.prop('step')).toBe(0.5);
    expect(input.prop('disabled')).toBe(true);
  });

  it('does not render if value is a tuple', () => {
    const element = mountWithAppProvider(
      <RangeSlider label="RangeSlider" id="MyRangeSlider" value={[0, 25]} onChange={noop} />,
    );

    expect(element.find('input')).toHaveLength(0);
  });

  describe('onChange()', () => {
    it('is called with the new value', () => {
      const spy = jest.fn();
      const element = mountWithAppProvider(
        <RangeSlider
          id="MyRangeSlider"
          label="RangeSlider"
          value={50}
          onChange={spy}
        />,
      );

      (element.find('input') as any).instance().value = 40;
      element.find('input').simulate('change');

      expect(spy).toHaveBeenCalledWith(40, 'MyRangeSlider');
    });
  });

  describe('onFocus()', () => {
    it('is called when the input is focused', () => {
      const spy = jest.fn();
      shallowWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          value={50}
          onChange={noop}
          onFocus={spy}
        />,
      )
        .find('input')
        .simulate('focus');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('onBlur()', () => {
    it('is called when the input is blurred', () => {
      const spy = jest.fn();
      const element = shallowWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          value={50}
          onChange={noop}
          onBlur={spy}
        />,
      );

      element.find('input').simulate('focus');
      element.find('input').simulate('blur');

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('id', () => {
    it('sets the id on the input', () => {
      const id = shallowWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={50}
          onChange={noop}
        />,
      )
        .find('input')
        .prop('id');

      expect(id).toBe('MyRangeSlider');
    });

    it('sets a random id on the input when none is passed', () => {
      const id = shallowWithAppProvider(
        <RangeSlider label="RangeSlider" value={50} onChange={noop} />,
      )
        .find('input')
        .prop('id');

      expect(typeof id).toBe('string');
      expect(id).toBeTruthy();
    });
  });

  describe('output', () => {
    it('connects the input to the output', () => {
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={50}
          output
          onChange={noop}
        />,
      );
      const inputId = element.find('input').prop<string>('id');

      expect(typeof inputId).toBe('string');
      expect(element.find('output').prop<string>('htmlFor')).toBe(inputId);
    });

    it('contains the correct value text', () => {
      const element = mountWithAppProvider(
        <RangeSlider label="RangeSlider" value={50} output onChange={noop} />,
      );
      const outputText = element.find('output').find('span');

      expect(outputText.text()).toBe('50');
    });
  });

  describe('helpText', () => {
    it('connects the input to the help text', () => {
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          value={50}
          helpText="Some help"
          onChange={noop}
        />,
      );
      const helpTextID = element.find('input').prop<string>('aria-describedby');

      expect(typeof helpTextID).toBe('string');
      expect(element.find(`#${helpTextID}`).text()).toBe('Some help');
    });
  });

  describe('error', () => {
    it('marks the input as invalid', () => {
      const element = shallowWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          value={50}
          error={<span>Invalid</span>}
          onChange={noop}
        />,
      );
      expect(element.find('input').prop<string>('aria-invalid')).toBe(true);

      element.setProps({error: 'Some error'});
      expect(element.find('input').prop<string>('aria-invalid')).toBe(true);
    });

    it('connects the input to the error', () => {
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          value={50}
          error="Some error"
          onChange={noop}
        />,
      );
      const errorID = element.find('input').prop<string>('aria-describedby');

      expect(typeof errorID).toBe('string');
      expect(element.find(`#${errorID}`).text()).toBe('Some error');
    });

    it('connects the input to both an error and help text', () => {
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          value={50}
          helpText="Some help"
          error="Some error"
          onChange={noop}
        />,
      );
      const descriptions = element
        .find('input')
        .prop<string>('aria-describedby')
        .split(' ');

      expect(descriptions).toHaveLength(2);
      expect(element.find(`#${descriptions[1]}`).text()).toBe('Some help');
      expect(element.find(`#${descriptions[0]}`).text()).toBe('Some error');
    });
  });

  describe('prefix', () => {
    const text = 'prefix text';

    it('outputs the provided prefix element', () => {
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          value={50}
          prefix={<p>{text}</p>}
          onChange={noop}
        />,
      );
      const prefixElement = element.find('p');

      expect(prefixElement.text()).toBe(text);
    });
  });

  describe('suffix', () => {
    const text = 'suffix text';

    it('outputs the provided suffix element', () => {
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          value={50}
          suffix={<p>{text}</p>}
          onChange={noop}
        />,
      );
      const suffixElement = element.find('p');

      expect(suffixElement.text()).toBe(text);
    });
  });

  describe('invertNumber', () => {
    it('returns a negative number when the argument is positive', () => {
      const negative = invertNumber(10);
      expect(negative).toBe(-10);
    });

    it('returns a positive number when the argument is negative', () => {
      const negative = invertNumber(-10);
      expect(negative).toBe(10);
    });

    it('returns 0 when the argument is 0', () => {
      const negative = invertNumber(0);
      expect(negative).toBe(0);
    });
  });

  describe('CSS custom properties', () => {
    it('sets the correct css custom properties', () => {
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={25}
          onChange={noop}
        />,
      );
      const expected = {
        '--Polaris-RangeSlider-min': 0,
        '--Polaris-RangeSlider-max': 100,
        '--Polaris-RangeSlider-current': 25,
        '--Polaris-RangeSlider-progress': '25%',
        '--Polaris-RangeSlider-output-factor': 0.25,
      };
      const actual = element.find('[style]').prop('style');

      expect(expected).toEqual(actual);
    });
  });

  describe('DualThumb', () => {
    it('does not get rendered if value is a single number', () => {
      const id = 'MyRangeSlider';
      const element = mountWithAppProvider(
        <RangeSlider label="RangeSlider" id={id} value={25} onChange={noop} />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb).toHaveLength(0);
    });

    it('gets rendered if value is a tuple', () => {
      const id = 'MyRangeSlider';
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id={id}
          value={[0, 50]}
          onChange={noop}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb).toHaveLength(1);
    });

    it('gets passed the id', () => {
      const id = 'MyRangeSlider';
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id={id}
          value={[0, 50]}
          onChange={noop}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('id')).toBe(id);
    });

    it('gets passed the min', () => {
      const min = 5;
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[10, 50]}
          onChange={noop}
          min={min}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('min')).toBe(min);
    });

    it('gets passed a default min if none is set', () => {
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[10, 50]}
          onChange={noop}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('min')).toBe(0);
    });

    it('gets passed the max', () => {
      const max = 0;
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[0, 50]}
          onChange={noop}
          max={max}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('max')).toBe(max);
    });

    it('gets passed a default max if none is set', () => {
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[0, 50]}
          onChange={noop}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('max')).toBe(100);
    });

    it('gets passed the step', () => {
      const step = 5;
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[0, 50]}
          onChange={noop}
          step={step}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('step')).toBe(step);
    });

    it('gets passed a default step if none is set', () => {
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[0, 50]}
          onChange={noop}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('step')).toBe(1);
    });

    it('gets passed the output', () => {
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[0, 50]}
          onChange={noop}
          output
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('output')).toBe(true);
    });

    it('gets passed the cssVarPrefix', () => {
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[0, 50]}
          onChange={noop}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('cssVarPrefix')).toBe('--Polaris-RangeSlider-');
    });

    it('gets passed the error', () => {
      const error = 'Error';
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[0, 50]}
          onChange={noop}
          error={error}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('error')).toBe(error);
    });

    it('gets passed the prefix', () => {
      const prefix = '$';
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[0, 50]}
          onChange={noop}
          prefix={prefix}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('prefix')).toBe(prefix);
    });

    it('gets passed the suffix', () => {
      const suffix = '$';
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[0, 50]}
          onChange={noop}
          suffix={suffix}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('suffix')).toBe(suffix);
    });

    it('gets passed disabled', () => {
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[0, 50]}
          onChange={noop}
          disabled
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('disabled')).toBe(true);
    });

    it('gets passed accessibilityInputs', () => {
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[0, 50]}
          onChange={noop}
          accessibilityInputs
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('accessibilityInputs')).toBe(true);
    });

    it('gets passed onChange', () => {
      const onChange = noop;
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[0, 50]}
          onChange={onChange}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('onChange')).toBe(onChange);
    });

    it('gets passed onFocus', () => {
      const onFocus = noop;
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[0, 50]}
          onChange={noop}
          onFocus={onFocus}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('onFocus')).toBe(onFocus);
    });

    it('gets passed onBlur', () => {
      const onBlur = noop;
      const element = mountWithAppProvider(
        <RangeSlider
          label="RangeSlider"
          id="MyRangeSlider"
          value={[0, 50]}
          onChange={noop}
          onBlur={onBlur}
        />,
      );

      const dualThumb = element.find(DualThumb);
      expect(dualThumb.prop('onBlur')).toBe(onBlur);
    });
  });
});
