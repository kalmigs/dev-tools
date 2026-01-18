import { ChevronDown, ChevronUp } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useState, useRef } from 'react';
import { NumericFormat, type NumericFormatProps } from 'react-number-format';
import { Button } from './button';
import { Input } from './input';

export interface NumberInputProps
  extends Omit<NumericFormatProps, 'value' | 'onValueChange'> {
  stepper?: number;
  thousandSeparator?: string;
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  value?: number; // Controlled value
  suffix?: string;
  prefix?: string;
  onValueChange?: (value: number | undefined) => void;
  fixedDecimalScale?: boolean;
  decimalScale?: number;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      stepper,
      thousandSeparator,
      placeholder,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      onValueChange,
      fixedDecimalScale = false,
      decimalScale = 0,
      suffix,
      prefix,
      value: controlledValue,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null); // Create an internal ref
    const combinedRef = ref || internalRef; // Use provided ref or internal ref
    const [internalValue, setInternalValue] = useState<number | undefined>(defaultValue);

    // Controlled value takes precedence when provided
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleIncrement = useCallback(() => {
      const newValue = value === undefined ? stepper ?? 1 : Math.min(value + (stepper ?? 1), max);
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    }, [value, stepper, max, isControlled, onValueChange]);

    const handleDecrement = useCallback(() => {
      const newValue = value === undefined ? -(stepper ?? 1) : Math.max(value - (stepper ?? 1), min);
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    }, [value, stepper, min, isControlled, onValueChange]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          document.activeElement ===
          (combinedRef as React.RefObject<HTMLInputElement>).current
        ) {
          if (e.key === 'ArrowUp') {
            handleIncrement();
          } else if (e.key === 'ArrowDown') {
            handleDecrement();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [handleIncrement, handleDecrement, combinedRef]);

    const handleChange = (values: {
      value: string;
      floatValue: number | undefined;
    }) => {
      let newValue = values.floatValue;
      let clamped = false;

      // Clamp value if out of bounds
      if (newValue !== undefined) {
        if (newValue > max) {
          newValue = max;
          clamped = true;
        } else if (newValue < min) {
          newValue = min;
          clamped = true;
        }
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);

      // Force update the input display after clamping
      if (clamped) {
        setTimeout(() => {
          const inputRef = combinedRef as React.RefObject<HTMLInputElement>;
          if (inputRef.current && newValue !== undefined) {
            inputRef.current.value = String(newValue);
          }
        }, 0);
      }
    };

    // Block further input once at min/max
    const isAllowed = (values: { floatValue: number | undefined }) => {
      const { floatValue } = values;
      if (floatValue === undefined) return true;
      // If current value is already at max/min, only allow same or smaller/larger values
      if (value === max && floatValue > max) return false;
      if (value === min && floatValue < min) return false;
      return true;
    };

    return (
      <div className="flex items-center">
        <NumericFormat
          value={value}
          onValueChange={handleChange}
          isAllowed={isAllowed}
          thousandSeparator={thousandSeparator}
          decimalScale={decimalScale}
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={min < 0}
          valueIsNumericString
          suffix={suffix}
          prefix={prefix}
          customInput={Input}
          placeholder={placeholder}
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-r-none h-[35px] hover:bg-transparent dark:hover:bg-input/30 focus-visible:ring-0 focus-visible:border-input"
          getInputRef={combinedRef} // Use combined ref
          {...props}
        />
        <div className="flex flex-col">
          <Button
            aria-label="Increase value"
            className="px-2 h-4 rounded-l-none rounded-br-none border-input border-l-0 border-b-[0.5px] focus-visible:relative"
            variant="outline"
            onClick={handleIncrement}
            disabled={value === max}
          >
            <ChevronUp size={15} />
          </Button>
          <Button
            aria-label="Decrease value"
            className="px-2 h-4 rounded-l-none rounded-tr-none border-input border-l-0 border-t-[0.5px] focus-visible:relative"
            variant="outline"
            onClick={handleDecrement}
            disabled={value === min}
          >
            <ChevronDown size={15} />
          </Button>
        </div>
      </div>
    );
  }
);
