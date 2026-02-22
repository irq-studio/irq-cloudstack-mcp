import {
  ValidationError,
  validateDateFormat,
  sanitizeIdList,
  validateDateRange,
  requireAtLeastOneParam,
  checkApiSuccess,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isStringArray,
  isDefined,
  getStringProperty,
  getNumberProperty,
  getBooleanProperty,
  getObjectProperty,
  getArrayProperty,
} from '../src/utils/validation.js';

describe('Validation Utilities', () => {
  describe('validateDateFormat', () => {
    it('should accept valid date format YYYY-MM-DD', () => {
      expect(() => validateDateFormat('2025-01-15', 'testDate')).not.toThrow();
      expect(() => validateDateFormat('2024-12-31', 'testDate')).not.toThrow();
      expect(() => validateDateFormat('2025-06-01', 'testDate')).not.toThrow();
    });

    it('should reject invalid date formats', () => {
      expect(() => validateDateFormat('2025/01/15', 'testDate')).toThrow(ValidationError);
      expect(() => validateDateFormat('15-01-2025', 'testDate')).toThrow(ValidationError);
      expect(() => validateDateFormat('2025-1-5', 'testDate')).toThrow(ValidationError);
      expect(() => validateDateFormat('invalid', 'testDate')).toThrow(ValidationError);
    });

    it('should reject invalid dates', () => {
      expect(() => validateDateFormat('2025-02-30', 'testDate')).toThrow(ValidationError);
      expect(() => validateDateFormat('2025-13-01', 'testDate')).toThrow(ValidationError);
      expect(() => validateDateFormat('2025-00-01', 'testDate')).toThrow(ValidationError);
    });

    it('should include parameter name in error message', () => {
      expect(() => validateDateFormat('invalid', 'startDate')).toThrow(/startDate/);
    });
  });

  describe('sanitizeIdList', () => {
    it('should sanitize valid comma-separated IDs', () => {
      expect(sanitizeIdList('id1,id2,id3')).toBe('id1,id2,id3');
      expect(sanitizeIdList('  id1  ,  id2  ,  id3  ')).toBe('id1,id2,id3');
      expect(sanitizeIdList('single-id')).toBe('single-id');
    });

    it('should reject empty ID lists', () => {
      expect(() => sanitizeIdList('')).toThrow(ValidationError);
      expect(() => sanitizeIdList('   ')).toThrow(ValidationError);
      expect(() => sanitizeIdList(',,,  ,')).toThrow(ValidationError);
    });

    it('should enforce max count limit', () => {
      const ids = Array.from({ length: 101 }, (_, i) => `id${i}`).join(',');
      expect(() => sanitizeIdList(ids, 100)).toThrow(ValidationError);
      expect(() => sanitizeIdList(ids, 100)).toThrow(/Maximum 100 IDs/);
    });

    it('should allow custom max count', () => {
      expect(() => sanitizeIdList('id1,id2,id3', 2)).toThrow(/Maximum 2 IDs/);
      expect(() => sanitizeIdList('id1,id2', 2)).not.toThrow();
    });
  });

  describe('validateDateRange', () => {
    it('should accept valid date ranges', () => {
      expect(() => validateDateRange('2025-01-01', '2025-01-31')).not.toThrow();
      expect(() => validateDateRange('2025-01-01', '2025-12-31')).not.toThrow();
    });

    it('should accept only enddate', () => {
      expect(() => validateDateRange(undefined, '2025-01-31')).not.toThrow();
    });

    it('should reject startdate without enddate', () => {
      expect(() => validateDateRange('2025-01-01', undefined)).toThrow(ValidationError);
      expect(() => validateDateRange('2025-01-01')).toThrow(/requires enddate/);
    });

    it('should reject invalid date formats in range', () => {
      expect(() => validateDateRange('invalid', '2025-01-31')).toThrow(ValidationError);
      expect(() => validateDateRange('2025-01-01', 'invalid')).toThrow(ValidationError);
    });

    it('should reject start date after end date', () => {
      expect(() => validateDateRange('2025-12-31', '2025-01-01')).toThrow(ValidationError);
      expect(() => validateDateRange('2025-12-31', '2025-01-01')).toThrow(/must be before or equal to/);
    });

    it('should accept start date equal to end date', () => {
      expect(() => validateDateRange('2025-01-15', '2025-01-15')).not.toThrow();
    });
  });

  describe('requireAtLeastOneParam', () => {
    it('should pass when at least one parameter is provided', () => {
      expect(() =>
        requireAtLeastOneParam({ id: '123' }, ['id', 'name'], 'test operation')
      ).not.toThrow();

      expect(() =>
        requireAtLeastOneParam({ id: '123', name: 'test' }, ['id', 'name'], 'test operation')
      ).not.toThrow();
    });

    it('should throw when no parameters are provided', () => {
      expect(() =>
        requireAtLeastOneParam({}, ['id', 'name'], 'test operation')
      ).toThrow(ValidationError);

      expect(() =>
        requireAtLeastOneParam({}, ['id', 'name'], 'delete events')
      ).toThrow(/delete events requires at least one parameter/);
    });

    it('should treat undefined and null as not provided', () => {
      expect(() =>
        requireAtLeastOneParam({ id: undefined, name: null }, ['id', 'name'], 'test')
      ).toThrow(ValidationError);
    });

    it('should accept 0 and false as valid values', () => {
      expect(() =>
        requireAtLeastOneParam({ count: 0 }, ['count', 'name'], 'test')
      ).not.toThrow();

      expect(() =>
        requireAtLeastOneParam({ enabled: false }, ['enabled', 'name'], 'test')
      ).not.toThrow();
    });
  });

  describe('checkApiSuccess', () => {
    it('should return true for successful API responses with string "true"', () => {
      const response = {
        deleteeventsresponse: {
          success: 'true',
        },
      };
      expect(checkApiSuccess(response, 'deleteeventsresponse')).toBe(true);
    });

    it('should return true for successful API responses with boolean true', () => {
      const response = {
        deleteeventsresponse: {
          success: true,
        },
      };
      expect(checkApiSuccess(response, 'deleteeventsresponse')).toBe(true);
    });

    it('should throw error for failed API responses', () => {
      const response = {
        deleteeventsresponse: {
          success: false,
          displaytext: 'Operation failed',
        },
      };
      expect(() => checkApiSuccess(response, 'deleteeventsresponse')).toThrow(/Operation failed/);
    });

    it('should throw error for missing response object', () => {
      expect(() => checkApiSuccess(null, 'deleteeventsresponse')).toThrow(/Invalid API response/);
      expect(() => checkApiSuccess(undefined, 'deleteeventsresponse')).toThrow(/Invalid API response/);
      expect(() => checkApiSuccess('invalid', 'deleteeventsresponse')).toThrow(/Invalid API response/);
    });

    it('should throw error for missing response name', () => {
      const response = {
        wrongresponse: {
          success: true,
        },
      };
      expect(() => checkApiSuccess(response, 'deleteeventsresponse')).toThrow(/missing deleteeventsresponse/);
    });

    it('should handle missing displaytext in errors', () => {
      const response = {
        deleteeventsresponse: {
          success: false,
        },
      };
      expect(() => checkApiSuccess(response, 'deleteeventsresponse')).toThrow(/Unknown error/);
    });
  });

  describe('Type Guards', () => {
    describe('isString', () => {
      it('should return true for strings', () => {
        expect(isString('hello')).toBe(true);
        expect(isString('')).toBe(true);
        expect(isString('123')).toBe(true);
      });

      it('should return false for non-strings', () => {
        expect(isString(123)).toBe(false);
        expect(isString(true)).toBe(false);
        expect(isString(null)).toBe(false);
        expect(isString(undefined)).toBe(false);
        expect(isString({})).toBe(false);
        expect(isString([])).toBe(false);
      });
    });

    describe('isNumber', () => {
      it('should return true for valid numbers', () => {
        expect(isNumber(123)).toBe(true);
        expect(isNumber(0)).toBe(true);
        expect(isNumber(-456)).toBe(true);
        expect(isNumber(3.14)).toBe(true);
      });

      it('should return false for NaN', () => {
        expect(isNumber(NaN)).toBe(false);
      });

      it('should return false for non-numbers', () => {
        expect(isNumber('123')).toBe(false);
        expect(isNumber(true)).toBe(false);
        expect(isNumber(null)).toBe(false);
        expect(isNumber(undefined)).toBe(false);
        expect(isNumber({})).toBe(false);
      });
    });

    describe('isBoolean', () => {
      it('should return true for booleans', () => {
        expect(isBoolean(true)).toBe(true);
        expect(isBoolean(false)).toBe(true);
      });

      it('should return false for non-booleans', () => {
        expect(isBoolean(1)).toBe(false);
        expect(isBoolean(0)).toBe(false);
        expect(isBoolean('true')).toBe(false);
        expect(isBoolean(null)).toBe(false);
        expect(isBoolean(undefined)).toBe(false);
      });
    });

    describe('isObject', () => {
      it('should return true for plain objects', () => {
        expect(isObject({})).toBe(true);
        expect(isObject({ key: 'value' })).toBe(true);
      });

      it('should return false for null', () => {
        expect(isObject(null)).toBe(false);
      });

      it('should return false for arrays', () => {
        expect(isObject([])).toBe(false);
        expect(isObject([1, 2, 3])).toBe(false);
      });

      it('should return false for primitives', () => {
        expect(isObject('string')).toBe(false);
        expect(isObject(123)).toBe(false);
        expect(isObject(true)).toBe(false);
        expect(isObject(undefined)).toBe(false);
      });
    });

    describe('isArray', () => {
      it('should return true for arrays', () => {
        expect(isArray([])).toBe(true);
        expect(isArray([1, 2, 3])).toBe(true);
        expect(isArray(['a', 'b'])).toBe(true);
      });

      it('should return false for non-arrays', () => {
        expect(isArray({})).toBe(false);
        expect(isArray('array')).toBe(false);
        expect(isArray(123)).toBe(false);
        expect(isArray(null)).toBe(false);
      });
    });

    describe('isStringArray', () => {
      it('should return true for string arrays', () => {
        expect(isStringArray(['a', 'b', 'c'])).toBe(true);
        expect(isStringArray([])).toBe(true);
        expect(isStringArray(['single'])).toBe(true);
      });

      it('should return false for mixed arrays', () => {
        expect(isStringArray([1, 'two', 3])).toBe(false);
        expect(isStringArray(['a', 2, 'c'])).toBe(false);
      });

      it('should return false for non-string arrays', () => {
        expect(isStringArray([1, 2, 3])).toBe(false);
        expect(isStringArray([true, false])).toBe(false);
      });

      it('should return false for non-arrays', () => {
        expect(isStringArray('not an array')).toBe(false);
        expect(isStringArray({})).toBe(false);
      });
    });

    describe('isDefined', () => {
      it('should return true for defined values', () => {
        expect(isDefined('value')).toBe(true);
        expect(isDefined(0)).toBe(true);
        expect(isDefined(false)).toBe(true);
        expect(isDefined({})).toBe(true);
        expect(isDefined([])).toBe(true);
      });

      it('should return false for undefined and null', () => {
        expect(isDefined(undefined)).toBe(false);
        expect(isDefined(null)).toBe(false);
      });
    });
  });

  describe('Safe Property Accessors', () => {
    const testObj = {
      stringProp: 'hello',
      numberProp: 42,
      boolProp: true,
      objectProp: { nested: 'value' },
      arrayProp: [1, 2, 3],
      nullProp: null,
      undefinedProp: undefined,
    };

    describe('getStringProperty', () => {
      it('should return string values', () => {
        expect(getStringProperty(testObj, 'stringProp')).toBe('hello');
      });

      it('should return default for non-string values', () => {
        expect(getStringProperty(testObj, 'numberProp')).toBe('');
        expect(getStringProperty(testObj, 'boolProp')).toBe('');
        expect(getStringProperty(testObj, 'objectProp')).toBe('');
      });

      it('should return custom default', () => {
        expect(getStringProperty(testObj, 'numberProp', 'N/A')).toBe('N/A');
        expect(getStringProperty(testObj, 'nonexistent', 'default')).toBe('default');
      });

      it('should handle null and undefined', () => {
        expect(getStringProperty(testObj, 'nullProp')).toBe('');
        expect(getStringProperty(testObj, 'undefinedProp')).toBe('');
      });
    });

    describe('getNumberProperty', () => {
      it('should return number values', () => {
        expect(getNumberProperty(testObj, 'numberProp')).toBe(42);
      });

      it('should return default for non-number values', () => {
        expect(getNumberProperty(testObj, 'stringProp')).toBe(0);
        expect(getNumberProperty(testObj, 'boolProp')).toBe(0);
      });

      it('should return custom default', () => {
        expect(getNumberProperty(testObj, 'stringProp', -1)).toBe(-1);
        expect(getNumberProperty(testObj, 'nonexistent', 100)).toBe(100);
      });
    });

    describe('getBooleanProperty', () => {
      it('should return boolean values', () => {
        expect(getBooleanProperty(testObj, 'boolProp')).toBe(true);
      });

      it('should return default for non-boolean values', () => {
        expect(getBooleanProperty(testObj, 'stringProp')).toBe(false);
        expect(getBooleanProperty(testObj, 'numberProp')).toBe(false);
      });

      it('should return custom default', () => {
        expect(getBooleanProperty(testObj, 'stringProp', true)).toBe(true);
        expect(getBooleanProperty(testObj, 'nonexistent', true)).toBe(true);
      });
    });

    describe('getObjectProperty', () => {
      it('should return object values', () => {
        const result = getObjectProperty(testObj, 'objectProp');
        expect(result).toEqual({ nested: 'value' });
      });

      it('should return empty object for non-object values', () => {
        expect(getObjectProperty(testObj, 'stringProp')).toEqual({});
        expect(getObjectProperty(testObj, 'numberProp')).toEqual({});
        expect(getObjectProperty(testObj, 'arrayProp')).toEqual({});
      });

      it('should return empty object for null', () => {
        expect(getObjectProperty(testObj, 'nullProp')).toEqual({});
      });
    });

    describe('getArrayProperty', () => {
      it('should return array values', () => {
        expect(getArrayProperty(testObj, 'arrayProp')).toEqual([1, 2, 3]);
      });

      it('should return empty array for non-array values', () => {
        expect(getArrayProperty(testObj, 'stringProp')).toEqual([]);
        expect(getArrayProperty(testObj, 'numberProp')).toEqual([]);
        expect(getArrayProperty(testObj, 'objectProp')).toEqual([]);
      });

      it('should return empty array for null', () => {
        expect(getArrayProperty(testObj, 'nullProp')).toEqual([]);
      });
    });
  });
});
