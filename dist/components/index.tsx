import React from 'react';

interface IDebouncedInputProps extends Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'value'>{
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
}

/* With debounce we dont use value prop , we store it until the end  */
export const DebouncedTextInput = (props: IDebouncedInputProps) => {
    return <input type="text" {...props} />;
};
/* We are not using debounce we can store our state value into the value prop  */
export const NonDebouncedTextInput = (props:React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> ) => {
    return <input type="text" {...props} />;
};

