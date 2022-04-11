import { renderHook, act } from '@testing-library/react-hooks';
import useForm from '../useForm'
const TEST_CHANGE = 'TEST-CHANGE';
const mockMultipleFieldsChangeHandler = (state) => ({
  field1: 'Changing',
  field2: 'AWESOME',
  field3: state.field2.value,
});
const handleFieldChange = (newField) => `${newField}+${TEST_CHANGE}`;
const handleFieldsChange = (_, state) => ({ ...mockMultipleFieldsChangeHandler(state) });
const DEFAULT_FIELD1_ERROR_MESSAGE = 'FIELD1_ERROR_MESSAGE';
const DEFAULT_FIELD2_ERROR_MESSAGE = 'FIELD2_ERROR_MESSAGE';
const DEFAULT_FIELD4_ERROR_MESSAGE = 'FIELD4_ERROR_MESSAGE';
let mockInputValues;

const initFields = () => ({
  fields: {
    field1: { value: '', onChange: handleFieldChange, error: false, errorMessage: DEFAULT_FIELD1_ERROR_MESSAGE },
    field2: {
      value: '',
      onChange: handleFieldsChange,
      onBlur: handleFieldChange,
      error: false,
      errorMessage: DEFAULT_FIELD2_ERROR_MESSAGE,
    },
    field3: { value: '' },
    field4: {
      value: '',
      onChange: handleFieldChange,
      withoutInputValue: true,
      error: false,
      errorMessage: DEFAULT_FIELD4_ERROR_MESSAGE,
    },
    field5: {
      value: '',
    }
  },
  onSubmit: jest.fn(),
  onError: jest.fn(),
});
describe('use-form', () => {
  beforeEach(() => {
    mockInputValues = initFields();
  });
  it('should get init values in state', () => {
    const { result } = renderHook(() => useForm(mockInputValues));
    expect(result.current.state).toEqual(mockInputValues.fields);
  });

  it('should get changed field when we type, without a handler', () => {
    const { result } = renderHook(() => useForm(mockInputValues));
    const mockChange = 'testing';
    act(() => {
      result.current.handlers.field3(mockChange);
    });
    expect(result.current.state.field3.value).toEqual(mockChange);
  });

  it('should get changed value by a simple returning string to the specific handler', () => {
    const { result } = renderHook(() => useForm(mockInputValues));
    const mockChange = 'testing-handler';
    act(() => {
      result.current.handlers.field1(mockChange);
    });
    expect(result.current.state.field1.value).toEqual(`${mockChange}+${TEST_CHANGE}`);
  });

  it('should be able to modify multiple fields at once in a handler, just by referencing the field into a returning object with key fields', () => {
    const mockField2 = 'Init Field2';
    mockInputValues.fields.field2.value = mockField2;
    const { result } = renderHook(() => useForm(mockInputValues));
    const mockChange = 'testing-handler';
    act(() => {
      result.current.handlers.field2(mockChange);
    });
    const { field1, field2, field3 } = result.current.state;
    expect(field1.value).toEqual('Changing');
    expect(field2.value).toEqual('AWESOME');
    expect(field3.value).toEqual(mockField2);
  });

  it('should put error flag into true if our error flag is false on field options, and field is empty, and call isValidForm helper', () => {
    const { result } = renderHook(() => useForm(mockInputValues));
    let isFormValid;
    act(() => {
      isFormValid = result.current.isValidForm();
    });
    const { field1, field2, field4 } = result.current.state;
    expect(isFormValid).toBeFalsy();
    expect(field1.error).toBeTruthy();
    expect(field2.error).toBeTruthy();
    expect(field4.error).toBeTruthy();
  });

  it('should put error flag to true  in field if checkFieldErrors field returns true & we have a non empty value in field, and isValidForm called', () => {
    const mockcheckFieldErrors = () => true;
    mockInputValues.fields.field1 = {
      ...mockInputValues.fields.field1,
      value: 'not-empty-str',
      checkFieldErrors: mockcheckFieldErrors,
    };
    const { result } = renderHook(() => useForm(mockInputValues));
    act(() => {
      result.current.isValidForm();
    });

    expect(result.current.state.field1.error).toBeTruthy();
  });

  it('should put error flag to true & error_message key change with the returning value of checkFieldErrors, if checkFieldErrors field returns a string', () => {
    const MOCK_ERROR_MESSAGE = 'RANDOM_STRING'
    const mockcheckFieldErrors = () => MOCK_ERROR_MESSAGE
    mockInputValues.fields.field1 = {
      ...mockInputValues.fields.field1,
      value: 'not-empty-str',
      checkFieldErrors: mockcheckFieldErrors,
    };
    const { result } = renderHook(() => useForm(mockInputValues));
    act(() => {
      result.current.isValidForm();
    });

    expect(result.current.state.field1.error).toBeTruthy();
    expect(result.current.state.field1.errorMessage).toEqual(MOCK_ERROR_MESSAGE);

  });

  it('should put error flag to false if error flag is true, after we call our handler for a specific field', () => {
    mockInputValues.fields.field2.error = true;
    const { result } = renderHook(() => useForm(mockInputValues));
    act(() => {
      result.current.handlers.field2('mock');
    });
    expect(result.current.state.field2.error).toBeFalsy();
  });

  it('should add to state after 500ms if withoutInputValue is true, (debounced)', async () => {
    const value = 'something';
    const { result } = renderHook(() => useForm(mockInputValues));
    act(() => {
      result.current.handlers.field4(value);
    });
    expect(result.current.state.field4.value).toEqual('');
    await act(async () => {
      // Let's set a timeout for 1 second.
      jest.setTimeout(1000);
      // Our promise should be resolved within 500ms;
      await new Promise((r) => setTimeout(r, 500));
      expect(result.current.state.field4.value).toEqual(`${value}+${TEST_CHANGE}`);
    });
  });

  it('onSubmit first param should be current IFields State', () => {
    const { result } = renderHook(() => useForm(mockInputValues));
    act(() => {
      result.current.handleSubmit();
    });
    expect(mockInputValues.onSubmit).toHaveBeenCalledWith(result.current.state);
  });

  it('onError first param should be current IFields state', () => {
    const { result } = renderHook(() => useForm(mockInputValues));
    act(() => {
      result.current.handleErrors();
    });
    expect(mockInputValues.onError).toHaveBeenCalledTimes(1);
    expect(mockInputValues.onError.mock.calls[0][0]).toEqual(result.current.state);
  });

  it('onError should be able to handle more params in arguments as an array', () => {
    const { result } = renderHook(() => useForm(mockInputValues));
    const extraParamMock = '123';
    act(() => {
      result.current.handleErrors(extraParamMock);
    });

    expect(mockInputValues.onError).toHaveBeenCalledTimes(1);
    expect(mockInputValues.onError.mock.calls[0]).toEqual([result.current.state, [extraParamMock]]);
  });

  it(
    'onError should be able to modify ErrorMessageKeys prop when returning an object to specific fields in state',
    () => {
      const NEW_ERROR_MESSAGE = 'NEW_ERROR_MESSAGE';
      mockInputValues.onError.mockImplementationOnce(() => ({ field1: NEW_ERROR_MESSAGE }));
      const { result } = renderHook(() => useForm(mockInputValues));
      act(() => {
        result.current.handleErrors();
      });
      expect(mockInputValues.onError).toHaveBeenCalledTimes(1);
      expect(result.current.state.field1.errorMessage).toEqual(NEW_ERROR_MESSAGE);
    },
  );
  it('resetForm should be able to override field values with key-match', () => {
    const { result } = renderHook(() => useForm(mockInputValues));
    const mockMsg = 'TESTING-FIELD-VALUE'
    act(() => {
      result.current.replaceForm({
        ...result.current.state,
        field1: mockMsg,
      });
    });
    expect(result.current.state.field1.value).toEqual(mockMsg);
  });

  it('should put whole object in state if its not Event Type and handler not defined handler', () => {
    const { result } = renderHook(() => useForm(mockInputValues));
    const mockObject = {
      prop1: 'somerandomstuff',
      prop2: 'good stuff'
    };

    act(() => {
      result.current.handlers.field5(mockObject);
    });

    expect(result.current.state.field5.value).toEqual(mockObject);
  });

  it('should put the value of the Event Type instead of the Event Type as state value', () => {
    const { result } = renderHook(() => useForm(mockInputValues));
    const mockObject = {
      target: {
        value: 'something'
      }
    };

    act(() => {
      result.current.handlers.field5(mockObject);
    });

    expect(result.current.state.field5.value).toEqual(mockObject.target.value);

  })
});


