import type {
  BaseArgs,
  ListVirtualMachinesArgs,
  DeployVirtualMachineArgs,
  StartVirtualMachineArgs,
  StopVirtualMachineArgs,
  RebootVirtualMachineArgs,
  DestroyVirtualMachineArgs} from '../src/handler-types.js';
import {
  validateRequiredFields,
  validateEnum,
  validateRange,
  ValidationError
} from '../src/handler-types.js';

describe('ValidationError', () => {
  it('should create error with correct message', () => {
    const error = new ValidationError('Test error message');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('Test error message');
    expect(error.name).toBe('ValidationError');
  });
});

describe('validateRequiredFields', () => {
  it('should not throw when all required fields are present', () => {
    const args = {
      id: '123',
      name: 'test',
      value: 42
    };

    expect(() => {
      validateRequiredFields(args, ['id', 'name'], 'test_operation');
    }).not.toThrow();
  });

  it('should throw ValidationError when single required field is missing', () => {
    const args = {
      name: 'test'
    };

    expect(() => {
      validateRequiredFields(args, ['id'], 'test_operation');
    }).toThrow(new ValidationError('test_operation: Missing required field: id'));
  });

  it('should throw ValidationError when multiple required fields are missing', () => {
    const args = {
      name: 'test'
    };

    expect(() => {
      validateRequiredFields(args, ['id', 'zoneid', 'templateid'], 'test_operation');
    }).toThrow(new ValidationError('test_operation: Missing required fields: id, zoneid, templateid'));
  });

  it('should throw when required field is null', () => {
    const args = {
      id: null,
      name: 'test'
    };

    expect(() => {
      validateRequiredFields(args, ['id'], 'test_operation');
    }).toThrow(ValidationError);
  });

  it('should throw when required field is undefined', () => {
    const args = {
      id: undefined,
      name: 'test'
    };

    expect(() => {
      validateRequiredFields(args, ['id'], 'test_operation');
    }).toThrow(ValidationError);
  });

  it('should throw when required field is empty string', () => {
    const args = {
      id: '',
      name: 'test'
    };

    expect(() => {
      validateRequiredFields(args, ['id'], 'test_operation');
    }).toThrow(ValidationError);
  });

  it('should accept zero as valid value', () => {
    const args = {
      count: 0,
      enabled: false
    };

    expect(() => {
      validateRequiredFields(args, ['count', 'enabled'], 'test_operation');
    }).not.toThrow();
  });

  it('should accept empty array as valid value', () => {
    const args = {
      items: [],
      tags: []
    };

    expect(() => {
      validateRequiredFields(args, ['items', 'tags'], 'test_operation');
    }).not.toThrow();
  });

  it('should handle empty required fields array', () => {
    const args = {
      id: '123'
    };

    expect(() => {
      validateRequiredFields(args, [], 'test_operation');
    }).not.toThrow();
  });
});

describe('validateEnum', () => {
  it('should not throw when value is in allowed list', () => {
    const args = { state: 'running' };
    expect(() => {
      validateEnum(args, 'state', ['running', 'stopped', 'error'], 'test_operation');
    }).not.toThrow();
  });

  it('should throw ValidationError when value is not in allowed list', () => {
    const args = { state: 'invalid' };
    expect(() => {
      validateEnum(args, 'state', ['running', 'stopped', 'error'], 'test_operation');
    }).toThrow(ValidationError);
  });

  it('should be case-sensitive', () => {
    const args = { state: 'RUNNING' };
    expect(() => {
      validateEnum(args, 'state', ['running', 'stopped'], 'test_operation');
    }).toThrow(ValidationError);
  });

  it('should handle single-value enum', () => {
    const args = { type: 'only' };
    expect(() => {
      validateEnum(args, 'type', ['only'], 'test_operation');
    }).not.toThrow();
  });

  it('should handle numeric values', () => {
    const args1 = { priority: '1' };
    expect(() => {
      validateEnum(args1, 'priority', ['1', '2', '3'], 'test_operation');
    }).not.toThrow();

    const args2 = { priority: '4' };
    expect(() => {
      validateEnum(args2, 'priority', ['1', '2', '3'], 'test_operation');
    }).toThrow(ValidationError);
  });

  it('should not throw when field is undefined', () => {
    const args = {};
    expect(() => {
      validateEnum(args, 'state', ['running', 'stopped'], 'test_operation');
    }).not.toThrow();
  });
});

describe('validateRange', () => {
  it('should not throw when value is within range', () => {
    const args = { count: 50 };
    expect(() => {
      validateRange(args, 'count', 0, 100, 'test_operation');
    }).not.toThrow();
  });

  it('should not throw when value equals minimum', () => {
    const args = { count: 0 };
    expect(() => {
      validateRange(args, 'count', 0, 100, 'test_operation');
    }).not.toThrow();
  });

  it('should not throw when value equals maximum', () => {
    const args = { count: 100 };
    expect(() => {
      validateRange(args, 'count', 0, 100, 'test_operation');
    }).not.toThrow();
  });

  it('should throw ValidationError when value is below minimum', () => {
    const args = { count: -1 };
    expect(() => {
      validateRange(args, 'count', 0, 100, 'test_operation');
    }).toThrow(ValidationError);
  });

  it('should throw ValidationError when value is above maximum', () => {
    const args = { count: 101 };
    expect(() => {
      validateRange(args, 'count', 0, 100, 'test_operation');
    }).toThrow(ValidationError);
  });

  it('should handle negative ranges', () => {
    const args = { temperature: -50 };
    expect(() => {
      validateRange(args, 'temperature', -100, 0, 'test_operation');
    }).not.toThrow();
  });

  it('should handle floating point numbers', () => {
    const args1 = { ratio: 3.14 };
    expect(() => {
      validateRange(args1, 'ratio', 0, 10, 'test_operation');
    }).not.toThrow();

    const args2 = { ratio: 10.1 };
    expect(() => {
      validateRange(args2, 'ratio', 0, 10, 'test_operation');
    }).toThrow(ValidationError);
  });

  it('should not throw when field is undefined', () => {
    const args = {};
    expect(() => {
      validateRange(args, 'count', 0, 100, 'test_operation');
    }).not.toThrow();
  });
});

describe('Type Interface Compatibility', () => {
  describe('BaseArgs', () => {
    it('should accept valid base arguments', () => {
      const args: BaseArgs = {
        stringField: 'test',
        numberField: 42,
        boolField: true,
        arrayField: ['a', 'b', 'c']
      };

      expect(args.stringField).toBe('test');
      expect(args.numberField).toBe(42);
      expect(args.boolField).toBe(true);
      expect(args.arrayField).toEqual(['a', 'b', 'c']);
    });
  });

  describe('ListVirtualMachinesArgs', () => {
    it('should accept valid list VM arguments', () => {
      const args: ListVirtualMachinesArgs = {
        id: 'vm-123',
        zoneid: 'zone-1',
        state: 'Running',
        keyword: 'test',
        page: 1,
        pagesize: 50
      };

      expect(args.id).toBe('vm-123');
      expect(args.zoneid).toBe('zone-1');
    });

    it('should accept minimal arguments', () => {
      const args: ListVirtualMachinesArgs = {};

      expect(args).toBeDefined();
    });
  });

  describe('DeployVirtualMachineArgs', () => {
    it('should accept valid deploy VM arguments', () => {
      const args: DeployVirtualMachineArgs = {
        serviceofferingid: 'offering-1',
        templateid: 'template-1',
        zoneid: 'zone-1',
        name: 'my-vm',
        displayname: 'My Virtual Machine',
        networkids: 'net-1,net-2',
        keypair: 'my-key',
        userdata: 'base64-encoded-data'
      };

      validateRequiredFields(
        args,
        ['serviceofferingid', 'templateid', 'zoneid'],
        'deploy_virtual_machine'
      );

      expect(args.serviceofferingid).toBe('offering-1');
      expect(args.templateid).toBe('template-1');
      expect(args.zoneid).toBe('zone-1');
    });

    it('should fail validation when required fields missing', () => {
      const args: DeployVirtualMachineArgs = {
        serviceofferingid: 'offering-1',
        templateid: 'template-1',
        zoneid: '' // Empty string should fail
      };

      expect(() => {
        validateRequiredFields(
          args,
          ['serviceofferingid', 'templateid', 'zoneid'],
          'deploy_virtual_machine'
        );
      }).toThrow(ValidationError);
    });
  });

  describe('StartVirtualMachineArgs', () => {
    it('should require id field', () => {
      const args: StartVirtualMachineArgs = {
        id: 'vm-123'
      };

      expect(() => {
        validateRequiredFields(args, ['id'], 'start_virtual_machine');
      }).not.toThrow();
    });

    it('should fail when id is missing', () => {
      const args: StartVirtualMachineArgs = {} as any;

      expect(() => {
        validateRequiredFields(args, ['id'], 'start_virtual_machine');
      }).toThrow(ValidationError);
    });
  });

  describe('StopVirtualMachineArgs', () => {
    it('should accept id and forced flag', () => {
      const args: StopVirtualMachineArgs = {
        id: 'vm-123',
        forced: true
      };

      validateRequiredFields(args, ['id'], 'stop_virtual_machine');

      expect(args.id).toBe('vm-123');
      expect(args.forced).toBe(true);
    });
  });

  describe('RebootVirtualMachineArgs', () => {
    it('should accept id field', () => {
      const args: RebootVirtualMachineArgs = {
        id: 'vm-123'
      };

      validateRequiredFields(args, ['id'], 'reboot_virtual_machine');

      expect(args.id).toBe('vm-123');
    });
  });

  describe('DestroyVirtualMachineArgs', () => {
    it('should accept id and expunge flag', () => {
      const args: DestroyVirtualMachineArgs = {
        id: 'vm-123',
        expunge: true
      };

      validateRequiredFields(args, ['id'], 'destroy_virtual_machine');

      expect(args.id).toBe('vm-123');
      expect(args.expunge).toBe(true);
    });
  });
});

describe('Integration Tests', () => {
  it('should validate complete deploy VM workflow', () => {
    const args: DeployVirtualMachineArgs = {
      serviceofferingid: 'offering-123',
      templateid: 'template-456',
      zoneid: 'zone-789',
      name: 'test-vm',
      displayname: 'Test Virtual Machine',
      networkids: 'network-1',
      keypair: 'my-keypair'
    };

    // Validate required fields
    expect(() => {
      validateRequiredFields(
        args,
        ['serviceofferingid', 'templateid', 'zoneid'],
        'deploy_virtual_machine'
      );
    }).not.toThrow();

    // Additional validations could be added
    expect(args.name).toBeTruthy();
    expect(args.displayname).toBeTruthy();
  });

  it('should validate VM state transitions', () => {
    const validStates = ['Running', 'Stopped', 'Destroyed', 'Expunging', 'Error'];

    // Test valid state
    const args1 = { state: 'Running' };
    expect(() => {
      validateEnum(args1, 'state', validStates, 'filter_vms');
    }).not.toThrow();

    // Test invalid state
    const args2 = { state: 'InvalidState' };
    expect(() => {
      validateEnum(args2, 'state', validStates, 'filter_vms');
    }).toThrow(ValidationError);
  });

  it('should validate pagination parameters', () => {
    const validArgs = {
      page: 1,
      pagesize: 50
    };

    // Validate page number range
    expect(() => {
      validateRange(validArgs, 'page', 1, 1000, 'list_operation');
    }).not.toThrow();

    // Validate page size range
    expect(() => {
      validateRange(validArgs, 'pagesize', 1, 500, 'list_operation');
    }).not.toThrow();

    // Invalid page number
    const invalidPageArgs = { page: 0 };
    expect(() => {
      validateRange(invalidPageArgs, 'page', 1, 1000, 'list_operation');
    }).toThrow(ValidationError);

    // Invalid page size
    const invalidSizeArgs = { pagesize: 501 };
    expect(() => {
      validateRange(invalidSizeArgs, 'pagesize', 1, 500, 'list_operation');
    }).toThrow(ValidationError);
  });

  it('should handle complex validation scenarios', () => {
    // Scenario: Update VM with optional parameters
    const args = {
      id: 'vm-123',
      displayname: 'Updated Name',
      group: 'production'
    };

    // Required field validation
    validateRequiredFields(args, ['id'], 'update_virtual_machine');

    // Optional fields should be present when provided
    expect(args.displayname).toBeTruthy();
    expect(args.group).toBeTruthy();

    // Scenario: Filter VMs with multiple criteria
    const filterArgs = {
      zoneid: 'zone-1',
      state: 'Running',
      page: 1,
      pagesize: 25
    };

    validateEnum(filterArgs, 'state', ['Running', 'Stopped', 'Destroyed'], 'filter_vms');
    validateRange(filterArgs, 'page', 1, 1000, 'filter_vms');
    validateRange(filterArgs, 'pagesize', 1, 500, 'filter_vms');
  });

  it('should provide clear error messages for debugging', () => {
    const args = {
      name: 'test'
    };

    try {
      validateRequiredFields(args, ['id', 'zoneid'], 'deploy_vm');
      fail('Should have thrown ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toContain('deploy_vm');
      expect((error as ValidationError).message).toContain('id');
      expect((error as ValidationError).message).toContain('zoneid');
    }

    const enumArgs = { state: 'invalid_state' };
    try {
      validateEnum(enumArgs, 'state', ['Running', 'Stopped'], 'filter_vm');
      fail('Should have thrown ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toContain('filter_vm');
      expect((error as ValidationError).message).toContain('state');
      expect((error as ValidationError).message).toContain('Running');
      expect((error as ValidationError).message).toContain('Stopped');
    }

    const rangeArgs = { count: 150 };
    try {
      validateRange(rangeArgs, 'count', 0, 100, 'list_items');
      fail('Should have thrown ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toContain('list_items');
      expect((error as ValidationError).message).toContain('count');
      expect((error as ValidationError).message).toContain('0');
      expect((error as ValidationError).message).toContain('100');
    }
  });
});
