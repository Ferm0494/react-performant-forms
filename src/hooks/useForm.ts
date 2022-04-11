import { useReducer, useCallback, useState } from 'react';
import { debounce } from 'lodash';


interface IParams {
  checkFieldErrors?: (arg: any, state: IFields) => boolean;
  error?: boolean;
  errorMessage?: string,
  onBlur?: (arg: any) => any;
  onChange?: (arg: any) => any;
  value: any;
  withoutInputValue?: boolean;
}
interface IArgs {
  fields: {
    [key: string]: IParams,
  },
  onError?: (state: IFields, args: [any]) => {
    [key: string]: string,
  } | void,
  onSubmit?: (state: IFields) => void,
}

interface IFields {
  [key: string]: IParams;
}

interface IHandlers {
  [key: string]: (e: React.ChangeEvent<HTMLInputElement> | any) => void;
}

interface IAction {
  field: string;
  payload?: {
    error?: boolean;
    errorMessage?: string,
    onChange?: (arg: any | object, state: IFields, event?: React.ChangeEvent<HTMLInputElement>) => any;
    value: any;
  };
  type: string;
}
interface IDefaultErrorMessages {
  [key: string]: string
}

enum IActions {
  CHANGE = 'change',
  ERROR = 'error',
  REPLACE = 'replace',
}

enum ICallbackParams {
  STRING = 'string',
  OBJECT = 'object',
  BOOLEAN = 'boolean',
  NUMBER = 'number',
}

const useForm = (args: IArgs) => {
  let initialValues: IFields;
  let handlers: IHandlers;
  let blurs: IHandlers;
  const [errorMessages, setErrorMessages] = useState<IDefaultErrorMessages>({});

  const reducer = (reducerState: IFields, action: IAction): IFields => {

    switch (action.type) {
      case IActions.CHANGE:
        if (action.payload) {
          const { value } = action.payload;
          const isTypeEvent = value?.target;
          if (action.payload.onChange) {
            const modifiedValue = action.payload.onChange(isTypeEvent ? value.target?.value : value, reducerState, isTypeEvent ? value : undefined);
            if (modifiedValue && typeof modifiedValue !== ICallbackParams.OBJECT) {
              return { ...reducerState, [action.field]: { value: modifiedValue, error: false, errorMessage: errorMessages[action.field] } } as IFields;
            } else if (modifiedValue && typeof modifiedValue === ICallbackParams.OBJECT) {
              const modifiedState = modifiedValue;
              let modifiedFields = {};
              for (const prop in modifiedState) {
                if (reducerState[prop]) {
                  modifiedFields = reducerState[prop].hasOwnProperty('error') ?
                    { ...modifiedFields, [prop]: { ...reducerState[prop], value: modifiedState[prop], error: false, errorMessage: errorMessages[prop] } }
                    :
                    { ...modifiedFields, [prop]: { ...reducerState[prop], value: modifiedState[prop], errorMessage: errorMessages[prop] } };
                }
              }
              return { ...reducerState, ...modifiedFields };
            }
          }
          return reducerState[action.field].hasOwnProperty('error') ?
            { ...reducerState, [action.field]: { ...reducerState[action.field], value: isTypeEvent ? value.target?.value : value, error: false, erroMessage: errorMessages[action.field] } } as IFields
            :
            { ...reducerState, [action.field]: { ...reducerState[action.field], value: isTypeEvent ? value.target?.value : value } } as IFields;
        }
        return reducerState;
      case IActions.ERROR:
        return {
          ...reducerState,
          [action.field]: {
            ...reducerState[action.field],
            error: action.payload?.error,
            errorMessage: action.payload?.errorMessage,
          },
        };

      case IActions.REPLACE:
        if (action.payload?.value && typeof action.payload.value === 'object') {
          let newState = { ...reducerState };
          const { value: values } = action.payload;
          // We only copy the values that we have in our reducerState initialized, however IParams remains the same.
          for (const field in values) {
            if (reducerState[field]) {
              newState = { ...newState, [field]: { ...reducerState[field], value: values[field] } };
            }
          }
          return newState;

        } else {
          return reducerState;
        }
      default:
        return reducerState;
    }
  };

  const getInitValues = useCallback(() => {
    if (!initialValues) {
      const defaultErrorMessages = {} as IDefaultErrorMessages;
      initialValues = Object.keys(args.fields).reduce(
        (accum, val) => {
          if (args.fields[val].errorMessage) {
            defaultErrorMessages[val] = args.fields[val].errorMessage as string;
          }
          return {
            ...accum,
            [val]: { ...args.fields[val], value: args.fields[val].value },
          };
        },
        {},
      );
      setErrorMessages(defaultErrorMessages);
    }
    return initialValues;
  }, []);
  const [state, dispatch] = useReducer(reducer, getInitValues());
  const debouncedHandler = debounce((value: any, field: string, onChange?: (arg: any) => any) => {
    dispatch({
      type: IActions.CHANGE,
      field,
      payload: {
        value,
        onChange,
      },
    });
  }, 500);

  const initHandlers = useCallback(() => {
    if (!handlers) {
      handlers = Object.keys(args.fields).reduce((accum, val) => {
        return {
          ...accum,
          [val]: (e: React.ChangeEvent<HTMLInputElement> | any) => {
            if (!args.fields[val].withoutInputValue) {
              dispatch({
                type: IActions.CHANGE,
                field: val,
                payload: {
                  value: e,
                  onChange: args.fields[val].onChange,
                },
              });
            } else {
              debouncedHandler(e, val, args.fields[val].onChange);
            }
          },
        };
      }, {});
    }
    return handlers;
  }, []);

  const validateForm =
    () => {
      let isValidForm = true;
      for (const field in state) {
        if (state[field].hasOwnProperty('error') &&
          (!state[field].value || state[field].error)) {
          dispatch({
            type: IActions.ERROR,
            field,
            payload: {
              ...state[field],
              error: true,
              errorMessage: errorMessages[field],
            },
          });
          isValidForm = false;
        } else if (state[field].hasOwnProperty('error') && state[field].hasOwnProperty('checkFieldErrors')) {
          const validateFieldsResponse = args.fields[field].checkFieldErrors?.(state[field].value, state);
          if (validateFieldsResponse) {
            dispatch({
              type: IActions.ERROR,
              field,
              payload: {
                ...state[field],
                error: true,
                errorMessage: typeof validateFieldsResponse === 'string' ? validateFieldsResponse : errorMessages[field],
              },
            });
            isValidForm = false;
          }
        }
      }
      return isValidForm;
    };

  const initBlurs = useCallback(() => {
    if (!blurs) {
      blurs = Object.keys(args.fields).reduce((accum, val) => {
        return {
          ...accum,
          [val]: (e: React.ChangeEvent<HTMLInputElement> | any) => {
            if (!args.fields[val].withoutInputValue) {
              dispatch({
                type: IActions.CHANGE,
                field: val,
                payload: {
                  value: e,
                  onChange: args.fields[val].onBlur,
                },
              });
            } else {
              debouncedHandler(e, val, args.fields[val].onBlur);
            }
          },
        };
      }, {});
    }
    return blurs;
  }, []);

  const handleSubmit = () => {
    if (args.onSubmit) {
      args.onSubmit(state);
    }
  };

  const handleErrors = (...params: any) => {
    if (args.onError) {
      const newErrors = args.onError(state, params);
      if (!newErrors) return;
      for (const fieldWithError in newErrors) {
        if (state.hasOwnProperty(fieldWithError)) {
          dispatch({
            type: IActions.ERROR,
            field: fieldWithError,
            payload: {
              ...state[fieldWithError],
              error: true,
              errorMessage: newErrors[fieldWithError] || state[fieldWithError].errorMessage,
            },
          });
        }
      }
    }
  };

  const replaceForm = (copyState: any) => {
    dispatch({ type: IActions.REPLACE, field: '', payload: { value: copyState } });
  };

  return {
    state,
    handlers: initHandlers(),
    blurs: initBlurs(),
    isValidForm: validateForm,
    handleSubmit,
    handleErrors,
    replaceForm,
  };
};

export default useForm;
