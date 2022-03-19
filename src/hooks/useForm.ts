import { useReducer, useCallback,useState } from 'react';
import { debounce } from 'lodash';


interface IParams {
  value: any;
  error?: boolean;
  errorMessage?: string,
  onChange?: (arg: any) => any;
  onBlur?: (arg: any) => any;
  withoutInputValue?: boolean;
  validator?: (arg: any) => boolean;
}
interface IArgs {
  fields:{
    [key: string]: IParams
  },
  onSubmit?: (state: IFields)=>void,
  onError?: (state: IFields,args: [any])=> {
    [key: string]: string
  }  | void
}

interface IFields {
  [key: string]: IParams;
}

interface IHandlers {
  [key: string]: (e: React.ChangeEvent<HTMLInputElement> | any) => void;
}

interface IAction {
  type: string;
  field: string;
  payload?: {
    value: any;
    error?: boolean;
    onChange?: (arg: any | object, state: IFields) => any;
    errorMessage?: string,
  };
}
interface IDefaultErrorMessages{
  [key: string]: string
}

enum IActions {
  CHANGE = 'CHANGE',
  ERROR = 'ERROR',
  REPLACE = 'REPLACE'
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
  const [errorMessages,setErrorMessages] =  useState<IDefaultErrorMessages>({});
  const reducer = (state: IFields, action: IAction): IFields => {
    if (action.type === IActions.CHANGE && action.payload) {
      if (action.payload.onChange) {
        const modifiedValue = action.payload.onChange(action.payload.value, state);
        if (modifiedValue && typeof modifiedValue !== ICallbackParams.OBJECT) {
          return { ...state, [action.field]: { value: modifiedValue, error: false,errorMessage: errorMessages[action.field] } } as IFields;
        } else if (modifiedValue && typeof modifiedValue === ICallbackParams.OBJECT) {
          const modifiedState = modifiedValue
          let modifiedFields = {}
          for (let prop in modifiedState) {
            if (state[prop]) {
              modifiedFields = state[prop].hasOwnProperty('error') ?
              { ...modifiedFields, [prop]: { ...state[prop], value: modifiedState[prop], error: false, errorMessage: errorMessages[prop] } }
              :
              {...modifiedFields,[prop]: {...state[prop],value: modifiedState[prop],errorMessage: errorMessages[prop]}}
            }
          }
          return { ...state, ...modifiedFields };
        }
      }
      return state[action.field].hasOwnProperty('error') ?
      { ...state, [action.field]: { ...state[action.field], value: action.payload.value, error: false } } as IFields
      :
      { ...state, [action.field]: { ...state[action.field], value: action.payload.value } } as IFields;
    } else if (action.type === IActions.ERROR) {
      return { ...state, [action.field]: { ...state[action.field], error: action.payload?.error, errorMessage: action.payload?.errorMessage} };
    }else if(action.type === IActions.REPLACE && action.payload?.value && typeof action.payload.value === 'object'){
        let newState = {...state};
        const {value: values} = action.payload;
        // We only copy the values that we have in our state initialized, however IParams remains the same.
        for(let field in values){
          if(state[field]){
              newState = {...newState,[field]:{...state[field],value: values[field]}};
          }
        };
        return newState;
        
    } else {
      return state;
    }
  };

  const getInitValues = useCallback(() => {
    if (!initialValues) {
      let defaultErrorMessages = {} as IDefaultErrorMessages;
      initialValues = Object.keys(args.fields).reduce(
        (accum, val) => {
          if(args.fields[val].errorMessage){
            // TS not getting the validation on line 100 above.
            defaultErrorMessages[val]= args.fields[val].errorMessage as string;
          }
          return{
          ...accum,
          [val]: { ...args.fields[val], value: args.fields[val].value },
        }},
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
            const value = typeof e === 'object' && e.target?.value ? e.target.value : e;
            if (!args.fields[val].withoutInputValue) {
              dispatch({
                type: IActions.CHANGE,
                field: val,
                payload: {
                  value,
                  onChange: args.fields[val].onChange,
                },
              });
            } else {
              debouncedHandler(value, val, args.fields[val].onChange);
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
          if (state[field].hasOwnProperty('error') && (!state[field].value || state[field].error) || !(state[field].validator?.(state[field].value))) {
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
      blurs = Object.keys(args.fields).reduce((accum, val) => {
        return {
          ...accum,
          [val]: (e: React.ChangeEvent<HTMLInputElement> | any) => {
            const value = typeof e === 'object' ? e.target.value : e;
            if (!args.fields[val].withoutInputValue) {
              dispatch({
                type: IActions.CHANGE,
                field: val,
                payload: {
                  value,
                  onChange: args.fields[val].onBlur,
                },
              });
            } else {
              debouncedHandler(value, val, args.fields[val].onBlur);
            }
          },
        };
      }, {});
    }
    return blurs;
  }, []);

  const handleSubmit = ()=>{
   if(args.onSubmit){
    args.onSubmit(state);
   }
  }

  const handleErrors = (...params: any)=>{
    if(args.onError){
      const newErrors = args.onError(state,params)
      if(!newErrors) return;
      for(let fieldWithError in newErrors){
        if(state.hasOwnProperty(fieldWithError)){
          dispatch({
            type: IActions.ERROR,
            field: fieldWithError,
            payload:{
              ...state[fieldWithError],
              error: true,
              errorMessage: newErrors[fieldWithError] || state[fieldWithError].errorMessage}});
        }
      }
    }
  }

  const replaceForm = (state: any )=>{
    dispatch({type: IActions.REPLACE,field: '',payload:{value: state}})
  }

  return { state, handlers: initHandlers(), blurs: initBlurs(), isValidForm,handleSubmit,handleErrors, replaceForm};
};

export default useForm;
