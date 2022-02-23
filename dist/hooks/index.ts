import {useReducer} from 'react'
import {debounce} from 'lodash'

interface IParams {
  value: string;
  onChange?: (value: string) => void;
  withoutInputValue?: boolean;
}
interface IArgs {
  [key: string]: IParams;
}

interface IInitialValues {
  [key: string]: string;
}

interface IHandlers{
  [key: string]: (e: React.ChangeEvent<HTMLInputElement>)=> void
}

interface IAction {
  type: string;
  field: string;
  payload?: {
    value: string;
    onChange?: (arg: string) => void | string | boolean | null | number;
  };
}

const reducer = (state: IInitialValues, action: IAction) => {
  if (action.type === "MODIFY" && action.payload) {
    if (action.payload.onChange) {
      const modifiedValue = action.payload.onChange(action.payload.value);
      if (modifiedValue) {
        return { ...state, [action.field]: modifiedValue } as IInitialValues;
      }
    }
    return { ...state, [action.field]: action.payload.value };
  } else {
    return state;
  }
};

const useForm = (args: IArgs) => {
  let initialValues: IInitialValues;
  let handlers: IHandlers;

  const getInitValues = () => {
    if (!initialValues) {
      initialValues = Object.keys(args).reduce(
        (accum, val) => ({ ...accum, [val]: args[val].value }),
        {}
      );
    }
    return initialValues;
  };
  const [state, dispatch] = useReducer(reducer, getInitValues());
  const debouncedHandler = debounce((value: string,onChange,field)=>{
    dispatch({
      type: "MODIFY",
      field,
      payload: {
        value,
        onChange
      }
    });

  },500)

  const initHandlers = () => {
    if (!handlers) {
      handlers = Object.keys(args).reduce((accum, val) => {
        return {
          ...accum,
          [val]:  (e: React.ChangeEvent<HTMLInputElement>) => {
            if(!args[val].withoutInputValue){
                dispatch({
                  type: "MODIFY",
                  field: val,
                  payload: {
                    value: e.target.value,
                    onChange: args[val].onChange
                  }
                });
              }else{
                  debouncedHandler(e.target.value,args[val].onChange,val)
              }
              }
            
        };
      }, {});
    }
    return handlers;
  };

  return [state, initHandlers()];
};

export{
  useForm
}