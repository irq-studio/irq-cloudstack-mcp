/**
 * Tests for formatter utility functions
 */

import {
  safeValue,
  formatBytes,
  formatDate,
  conditionalLine,
  formatItem,
  formatList,
  createMcpResponse,
  formatSections,
  type FieldDefinition,
} from '../src/utils/formatter.js';

describe('Formatter Utilities', () => {
  describe('safeValue', () => {
    it('should return string value as-is', () => {
      expect(safeValue('hello')).toBe('hello');
    });

    it('should convert number to string', () => {
      expect(safeValue(42)).toBe('42');
    });

    it('should convert boolean true to Yes', () => {
      expect(safeValue(true)).toBe('Yes');
    });

    it('should convert boolean false to No', () => {
      expect(safeValue(false)).toBe('No');
    });

    it('should return fallback for undefined', () => {
      expect(safeValue(undefined)).toBe('N/A');
    });

    it('should return fallback for null', () => {
      expect(safeValue(null)).toBe('N/A');
    });

    it('should use custom fallback', () => {
      expect(safeValue(undefined, 'Unknown')).toBe('Unknown');
    });

    it('should handle zero', () => {
      expect(safeValue(0)).toBe('0');
    });

    it('should handle empty string', () => {
      expect(safeValue('')).toBe('');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes', () => {
      expect(formatBytes(500)).toBe('500.00 B');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1.00 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
    });

    it('should format gigabytes', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
    });

    it('should format terabytes', () => {
      expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1.00 TB');
    });

    it('should handle fractional values', () => {
      expect(formatBytes(1536)).toBe('1.50 KB');
    });

    it('should return fallback for undefined', () => {
      expect(formatBytes(undefined)).toBe('N/A');
    });

    it('should return fallback for null', () => {
      expect(formatBytes(null as unknown as undefined)).toBe('N/A');
    });

    it('should use custom fallback', () => {
      expect(formatBytes(undefined, 'Unknown')).toBe('Unknown');
    });

    it('should handle zero bytes', () => {
      expect(formatBytes(0)).toBe('0.00 B');
    });

    it('should handle large TB values', () => {
      // 5 TB
      const result = formatBytes(5 * 1024 * 1024 * 1024 * 1024);
      expect(result).toBe('5.00 TB');
    });
  });

  describe('formatDate', () => {
    it('should format a valid date string', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should return fallback for undefined', () => {
      expect(formatDate(undefined)).toBe('N/A');
    });

    it('should return fallback for empty string', () => {
      expect(formatDate('')).toBe('N/A');
    });

    it('should use custom fallback', () => {
      expect(formatDate(undefined, 'Unknown')).toBe('Unknown');
    });

    it('should return original string for invalid date', () => {
      expect(formatDate('not-a-date')).toBe('not-a-date');
    });
  });

  describe('conditionalLine', () => {
    it('should return formatted line for string value', () => {
      expect(conditionalLine('Name', 'test-vm')).toBe('\n  Name: test-vm');
    });

    it('should return formatted line for number value', () => {
      expect(conditionalLine('Count', 42)).toBe('\n  Count: 42');
    });

    it('should return Yes for true boolean', () => {
      expect(conditionalLine('Enabled', true)).toBe('\n  Enabled: Yes');
    });

    it('should return No for false boolean', () => {
      expect(conditionalLine('Enabled', false)).toBe('\n  Enabled: No');
    });

    it('should return empty string for undefined', () => {
      expect(conditionalLine('Name', undefined)).toBe('');
    });

    it('should return empty string for null', () => {
      expect(conditionalLine('Name', null)).toBe('');
    });

    it('should return empty string for empty string value', () => {
      expect(conditionalLine('Name', '')).toBe('');
    });

    it('should use custom indent', () => {
      expect(conditionalLine('Name', 'test', '    ')).toBe('\n    Name: test');
    });
  });

  describe('formatItem', () => {
    interface TestItem extends Record<string, unknown> {
      id: string;
      name: string;
      state: string;
      count?: number;
      enabled?: boolean;
    }

    const testItem: TestItem = {
      id: 'item-123',
      name: 'Test Item',
      state: 'Running',
      count: 5,
      enabled: true,
    };

    it('should format item with basic fields', () => {
      const fields: FieldDefinition<TestItem>[] = [
        { key: 'state', label: 'State' },
        { key: 'count', label: 'Count' },
      ];

      const result = formatItem(testItem, fields);

      expect(result).toContain('State: Running');
      expect(result).toContain('Count: 5');
    });

    it('should handle function-based key', () => {
      const fields: FieldDefinition<TestItem>[] = [
        { key: (item) => `${item.name} (${item.id})`, label: 'Full Name' },
      ];

      const result = formatItem(testItem, fields);

      expect(result).toContain('Full Name: Test Item (item-123)');
    });

    it('should apply custom format function', () => {
      const fields: FieldDefinition<TestItem>[] = [
        { key: 'enabled', label: 'Status', format: (v) => v ? 'Active' : 'Inactive' },
      ];

      const result = formatItem(testItem, fields);

      expect(result).toContain('Status: Active');
    });

    it('should skip conditional fields when value is undefined', () => {
      const itemWithUndefined: TestItem = { id: '1', name: 'test', state: 'Running' };
      const fields: FieldDefinition<TestItem>[] = [
        { key: 'state', label: 'State' },
        { key: 'count', label: 'Count', conditional: true },
      ];

      const result = formatItem(itemWithUndefined, fields);

      expect(result).toContain('State: Running');
      expect(result).not.toContain('Count');
    });

    it('should use custom indent', () => {
      const fields: FieldDefinition<TestItem>[] = [
        { key: 'state', label: 'State' },
      ];

      const result = formatItem(testItem, fields, '    ');

      expect(result).toContain('    State: Running');
    });

    it('should handle skipIfUndefined', () => {
      const fields: FieldDefinition<TestItem>[] = [
        { key: 'state', label: 'State' },
        { key: 'count', label: 'Count', format: () => undefined, skipIfUndefined: true },
      ];

      const result = formatItem(testItem, fields);

      expect(result).toContain('State: Running');
      expect(result).not.toContain('Count');
    });
  });

  describe('formatList', () => {
    interface TestItem extends Record<string, unknown> {
      id: string;
      name: string;
      state: string;
    }

    const fields: FieldDefinition<TestItem>[] = [
      { key: 'state', label: 'State' },
    ];

    it('should format list with multiple items', () => {
      const items: TestItem[] = [
        { id: 'vm-1', name: 'web-server', state: 'Running' },
        { id: 'vm-2', name: 'db-server', state: 'Stopped' },
      ];

      const result = formatList(items, {
        itemName: 'virtual machine',
        titleField: 'name',
        idField: 'id',
        fields,
      });

      expect(result).toContain('Found 2 virtual machines');
      expect(result).toContain('web-server (vm-1)');
      expect(result).toContain('db-server (vm-2)');
      expect(result).toContain('State: Running');
      expect(result).toContain('State: Stopped');
    });

    it('should format list with single item', () => {
      const items: TestItem[] = [
        { id: 'vm-1', name: 'web-server', state: 'Running' },
      ];

      const result = formatList(items, {
        itemName: 'virtual machine',
        titleField: 'name',
        idField: 'id',
        fields,
      });

      expect(result).toContain('Found 1 virtual machine:');
      expect(result).not.toContain('virtual machines');
    });

    it('should handle empty list', () => {
      const items: TestItem[] = [];

      const result = formatList(items, {
        itemName: 'virtual machine',
        titleField: 'name',
        idField: 'id',
        fields,
      });

      expect(result).toBe('No virtual machines found.');
    });

    it('should use custom plural name', () => {
      const items: TestItem[] = [];

      const result = formatList(items, {
        itemName: 'entry',
        itemNamePlural: 'entries',
        titleField: 'name',
        idField: 'id',
        fields,
      });

      expect(result).toBe('No entries found.');
    });

    it('should handle missing title/id fields', () => {
      const items = [{ id: undefined, name: undefined, state: 'Running' }] as unknown as TestItem[];

      const result = formatList(items, {
        itemName: 'item',
        titleField: 'name',
        idField: 'id',
        fields,
      });

      expect(result).toContain('Unknown (Unknown)');
    });
  });

  describe('createMcpResponse', () => {
    it('should create MCP response with text', () => {
      const result = createMcpResponse('Hello, world!');

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Hello, world!' }],
      });
    });

    it('should handle multiline text', () => {
      const result = createMcpResponse('Line 1\nLine 2');

      expect(result.content[0].text).toBe('Line 1\nLine 2');
    });

    it('should handle empty string', () => {
      const result = createMcpResponse('');

      expect(result.content[0].text).toBe('');
    });
  });

  describe('formatSections', () => {
    it('should format multiple sections', () => {
      const sections = [
        {
          title: 'Section 1',
          items: [
            { label: 'Item A', value: 'Value A' },
            { label: 'Item B', value: 'Value B' },
          ],
        },
        {
          title: 'Section 2',
          items: [
            { label: 'Item C', value: 'Value C' },
          ],
        },
      ];

      const result = formatSections(sections);

      expect(result).toContain('Section 1');
      expect(result).toContain('Item A: Value A');
      expect(result).toContain('Item B: Value B');
      expect(result).toContain('Section 2');
      expect(result).toContain('Item C: Value C');
    });

    it('should handle boolean values as Enabled/Disabled', () => {
      const sections = [
        {
          title: 'Features',
          items: [
            { label: 'Feature A', value: true },
            { label: 'Feature B', value: false },
          ],
        },
      ];

      const result = formatSections(sections);

      expect(result).toContain('Feature A: Enabled');
      expect(result).toContain('Feature B: Disabled');
    });

    it('should skip conditional items when value is undefined', () => {
      const sections = [
        {
          title: 'Info',
          items: [
            { label: 'Name', value: 'Test' },
            { label: 'Description', value: undefined, conditional: true },
          ],
        },
      ];

      const result = formatSections(sections);

      expect(result).toContain('Name: Test');
      expect(result).not.toContain('Description');
    });

    it('should skip conditional items when value is null', () => {
      const sections = [
        {
          title: 'Info',
          items: [
            { label: 'Name', value: 'Test' },
            { label: 'Description', value: null, conditional: true },
          ],
        },
      ];

      const result = formatSections(sections);

      expect(result).toContain('Name: Test');
      expect(result).not.toContain('Description');
    });

    it('should skip sections with only title (no items)', () => {
      const sections = [
        {
          title: 'Empty Section',
          items: [
            { label: 'Item', value: undefined, conditional: true },
          ],
        },
        {
          title: 'Valid Section',
          items: [
            { label: 'Item', value: 'Value' },
          ],
        },
      ];

      const result = formatSections(sections);

      expect(result).not.toContain('Empty Section');
      expect(result).toContain('Valid Section');
    });

    it('should handle numeric values', () => {
      const sections = [
        {
          title: 'Stats',
          items: [
            { label: 'Count', value: 42 },
            { label: 'Size', value: 1024 },
          ],
        },
      ];

      const result = formatSections(sections);

      expect(result).toContain('Count: 42');
      expect(result).toContain('Size: 1024');
    });
  });
});
