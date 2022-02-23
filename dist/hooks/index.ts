import React from "react";
import { useState, useMemo, useCallback } from "react";
import {debounce} from 'lodash';


interface IParams {
  value: string;
  onChange?: (value: string, setValue: React.SetStateAction<any>) => void;
  withInputValue?: boolean
}
interface IArgs {
  [key: string]: IParams;
}

interface IMapper {
  [key: string]: {
    value: string;
    onChange: (e: React.ChangeEvent<any>) => void;
    setValue: React.SetStateAction<any>;
  };
}

interface IResults {
  mapper: IMapper;
  getValues: () => {
    [key: string]: string | boolean;
  };
}

const useMapFormState = (arg: IParams,withInputValue?: boolean) => {
  const [value, setValue] = useState(arg?.value || "");
  const handleChange = useCallback(
    (e: React.ChangeEvent<any>) => {
      if(arg.onChange && !withInputValue){
        arg.onChange(e.target.value,setValue)
      }else{
        setValue(e.target.value);
        if(arg.onChange){
          arg.onChange(e.target.value,setValue);
        }
      }
    },[arg,withInputValue])
    
  return {
    value,
    onChange: handleChange,
    setValue
  };
};

const useForm = (args: IArgs): IResults => {
  const mapper = useMemo(() => {
    let result = {} as IMapper;
    for (let item in args) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result[item] = useMapFormState({
        ...args[item],
        // For typescript purposes..... I'm already making a validation...
        onChange: args[item].onChange  && !args[item].withInputValue?  debounce(args[item].onChange as ()=> void ,500) : args[item].onChange,
      },args[item].withInputValue);
    }
    return result;
  }, []) as unknown as IMapper;

  const getValues = () => {
    const values = Object.keys(mapper).reduce((accum, val) => {
      return { ...accum, [val]: mapper[val].value };
    }, {});
    return values;
  };
  return {
    mapper,
    getValues
  };
};

export {
  useForm
}

// function App() {
//   const handleNameChange = (value: string, setValue: React.Dispatcher) => {
//     console.log("This is handler!",value);
//   };
//   const handleInputChange = (value: string, setValue: React.Dispatcher) => {
//     setValue(value);
//     console.log("Some Extra logic",value);
//   };

//   const { mapper,getValues } = useForm({
//     name: { value: "", onChange: handleNameChange, withInputValue: true },
//     input: { value: "", onChange: handleInputChange },
//     password: { value: "" }
//   });

//   console.log("Mapp",getValues());

//   return (
//     <div>
//       <input
//         type="text"
//         value={mapper.name.value}
//         onChange={mapper.name.onChange}
//       />
//       <br />
//       <input type="text" onChange={mapper.input.onChange} />
//       <br />
//       <input value={mapper.password.value} type="text" onChange={mapper.password.onChange} />
//       <br />
//     </div>
//   );
// }
