import { useReducer, useCallback } from 'react';
import { debounce } from 'lodash';

type Primitive = number | string | boolean;

interface IParams {
  value: Primitive;
  error?: boolean;
  onChange?: (arg: Primitive) => any;
  onBlur?: (arg: Primitive) => any;
  withoutInputValue?: boolean;
  validator?: (arg: Primitive) => boolean;
}
interface IArgs {
  [key: string]: IParams;
}

interface IOutputs {
  value: string;
  error?: boolean;
  validator?: (arg: Primitive) => boolean;
}

interface IInitialValues {
  [key: string]: IOutputs;
}

interface IHandlers {
  [key: string]: (e: React.ChangeEvent<HTMLInputElement> | Primitive) => void;
}

interface IAction {
  type: string;
  field: string;
  payload?: {
    value: Primitive;
    error?: boolean;
    onChange?: (arg: Primitive, state: IInitialValues) => any;
  };
}

enum IActions {
  CHANGE = 'CHANGE',
  ERROR = 'ERROR',
}

enum ICallbackParams {
  STRING = 'string',
  OBJECT = 'object',
  BOOLEAN = 'boolean',
  NUMBER = 'number',
}

const useForm = (args: IArgs) => {
  let initialValues: IInitialValues;
  let handlers: IHandlers;
  let blurs: IHandlers;
  const reducer = (state: IInitialValues, action: IAction): IInitialValues => {
    if (action.type === IActions.CHANGE && action.payload) {
      if (action.payload.onChange) {
        const modifiedValue = action.payload.onChange(action.payload.value, state);
        if (modifiedValue && typeof modifiedValue !== ICallbackParams.OBJECT) {
          return { ...state, [action.field]: { value: modifiedValue, error: false } } as IInitialValues;
        } else if (modifiedValue && typeof modifiedValue === ICallbackParams.OBJECT) {
          const modifiedState = modifiedValue
          let modifiedFields = {}
          for (let prop in modifiedState) {
            if (state[prop]) {
              modifiedFields = state[prop].hasOwnProperty('error') ?
              { ...modifiedFields, [prop]: { ...state[prop], value: modifiedState[prop], error: false } }
              :
              {...modifiedFields,[prop]: {...state[prop],value: modifiedState[prop]}}
            }
          }
          return { ...state, ...modifiedFields };
        }
      }
      return state[action.field].hasOwnProperty('error') ?
      { ...state, [action.field]: { ...state[action.field], value: action.payload.value, error: false } } as IInitialValues
      :
      { ...state, [action.field]: { ...state[action.field], value: action.payload.value } } as IInitialValues;
    } else if (action.type === IActions.ERROR) {
      return { ...state, [action.field]: { ...state[action.field], error: action.payload?.error } };
    } else {
      return state;
    }
  };

  const getInitValues = useCallback(() => {
    if (!initialValues) {
      initialValues = Object.keys(args).reduce(
        (accum, val) => ({
          ...accum,
          [val]: { ...args[val], value: args[val].value },
        }),
        {},
      );
    }
    return initialValues;
  }, []);
  const [state, dispatch] = useReducer(reducer, getInitValues());
  const debouncedHandler = debounce((value: Primitive, field: string, onChange?: (arg: Primitive) => any) => {
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
      handlers = Object.keys(args).reduce((accum, val) => {
        return {
          ...accum,
          [val]: (e: React.ChangeEvent<HTMLInputElement> | Primitive) => {
            const value = typeof e === 'object' ? e.target.value : e;
            if (!args[val].withoutInputValue) {
              dispatch({
                type: IActions.CHANGE,
                field: val,
                payload: {
                  value,
                  onChange: args[val].onChange,
                },
              });
            } else {
              debouncedHandler(value, val, args[val].onChange);
            }
          },
        };
      }, {});
    }
    return handlers;
  }, []);

  const isValidForm =
    useCallback(
      () => {
        let isValidForm = true;
        for (let field in state) {
          if (state[field].hasOwnProperty('error') && (!state[field].value || state[field].error) && !(state[field].validator?.(state[field].value))) {
            dispatch({ type: IActions.ERROR, field, payload: { ...state[field], error: true } })
            isValidForm = false;
          }
        }

        return isValidForm;
      },
      [state],
    );

  const initBlurs = useCallback(() => {
    if (!blurs) {
      blurs = Object.keys(args).reduce((accum, val) => {
        return {
          ...accum,
          [val]: (e: React.ChangeEvent<HTMLInputElement> | Primitive) => {
            const value = typeof e === 'object' ? e.target.value : e;
            if (!args[val].withoutInputValue) {
              dispatch({
                type: IActions.CHANGE,
                field: val,
                payload: {
                  value,
                  onChange: args[val].onBlur,
                },
              });
            } else {
              debouncedHandler(value, val, args[val].onBlur);
            }
          },
        };
      }, {});
    }
    return blurs;
  }, []);

  return { state, handlers: initHandlers(), blurs: initBlurs(), isValidForm };
};

export default useForm;
