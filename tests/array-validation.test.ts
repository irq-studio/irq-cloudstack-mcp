/**
 * Tests for array size validation
 */

import {  validateArraySize, DEFAULT_MAX_ARRAY_SIZE, ValidationError } from '../src/utils/validation.js';

describe('Array Validation', () => {
  describe('validateArraySize', () => {
    it('should accept arrays within the limit', () => {
      const array = ['item1', 'item2', 'item3'];

      expect(() => {
        validateArraySize(array, 10, 'testArray');
      }).not.toThrow();
    });

    it('should accept arrays at the exact limit', () => {
      const array = new Array(100).fill('item');

      expect(() => {
        validateArraySize(array, 100, 'testArray');
      }).not.toThrow();
    });

    it('should reject arrays exceeding the limit', () => {
      const array = new Array(101).fill('item');

      expect(() => {
        validateArraySize(array, 100, 'testArray');
      }).toThrow(ValidationError);

      expect(() => {
        validateArraySize(array, 100, 'testArray');
      }).toThrow(/cannot exceed 100 items/);

      expect(() => {
        validateArraySize(array, 100, 'testArray');
      }).toThrow(/Received: 101 items/);
    });

    it('should include parameter name in error message', () => {
      const array = new Array(50).fill('item');

      expect(() => {
        validateArraySize(array, 10, 'resourceIds');
      }).toThrow(/resourceIds cannot exceed/);
    });

    it('should handle empty arrays', () => {
      const array: unknown[] = [];

      expect(() => {
        validateArraySize(array, 10, 'testArray');
      }).not.toThrow();
    });

    it('should throw error for non-array input', () => {
      expect(() => {
        validateArraySize('not an array' as unknown as unknown[], 10, 'testArray');
      }).toThrow(ValidationError);

      expect(() => {
        validateArraySize('not an array' as unknown as unknown[], 10, 'testArray');
      }).toThrow(/must be an array/);
    });

    it('should handle different size limits', () => {
      const array10 = new Array(10).fill('item');
      const array50 = new Array(50).fill('item');

      expect(() => {
        validateArraySize(array10, 5, 'small');
      }).toThrow(ValidationError);

      expect(() => {
        validateArraySize(array50, 100, 'large');
      }).not.toThrow();
    });
  });

  describe('DEFAULT_MAX_ARRAY_SIZE', () => {
    it('should be set to 100', () => {
      expect(DEFAULT_MAX_ARRAY_SIZE).toBe(100);
    });

    it('should work with validateArraySize', () => {
      const array = new Array(DEFAULT_MAX_ARRAY_SIZE).fill('item');

      expect(() => {
        validateArraySize(array, DEFAULT_MAX_ARRAY_SIZE, 'testArray');
      }).not.toThrow();
    });

    it('should reject arrays exceeding default size', () => {
      const array = new Array(DEFAULT_MAX_ARRAY_SIZE + 1).fill('item');

      expect(() => {
        validateArraySize(array, DEFAULT_MAX_ARRAY_SIZE, 'testArray');
      }).toThrow(ValidationError);
    });
  });

  describe('Integration with different array types', () => {
    it('should work with string arrays', () => {
      const stringArray: string[] = ['a', 'b', 'c'];

      expect(() => {
        validateArraySize(stringArray, 5, 'strings');
      }).not.toThrow();
    });

    it('should work with number arrays', () => {
      const numberArray: number[] = [1, 2, 3, 4, 5];

      expect(() => {
        validateArraySize(numberArray, 3, 'numbers');
      }).toThrow(ValidationError);
    });

    it('should work with object arrays', () => {
      const objectArray: { id: string; value: string }[] = [
        { id: '1', value: 'a' },
        { id: '2', value: 'b' },
      ];

      expect(() => {
        validateArraySize(objectArray, 5, 'objects');
      }).not.toThrow();
    });

    it('should work with mixed type arrays', () => {
      const mixedArray: unknown[] = ['string', 123, { key: 'value' }, true];

      expect(() => {
        validateArraySize(mixedArray, 10, 'mixed');
      }).not.toThrow();
    });
  });
});
