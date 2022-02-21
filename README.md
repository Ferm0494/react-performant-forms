# A simple hook with customized raw components to handle performant inputs on React :) 
## (Only working for Text components) Work in progress!

# What this solves?
 - We can have a big form with a nice UI that looks awesome but how is the UX?, however when we have big forms we normally do something like this on React:
 
 ## Example:
 **State Declaration:**
 <br/>
 <br/>
 `const [body,setBodyForm] = useState({
    field1: '',
    field2: '',
    field3: '',
    .
    .
    .
    .
 })`
 
**Handlers**
<br/>
<br/>
`
const handleField1= (e)=>{
  .
  .
  .
  setBodyForm({...body,field1: e.target.value})
}
`
<br/>
`
const handleField2 = (e)=>{
  .
  .
  .
  setBodyForm({...body,field2: e.target.value})
}
`
<br/>
<br/>
-So whats the issue? The issue since we are changing the state... Since we are modifying a field and setting a new object into our state our whole parent component renders causing our children to re-render because they receive new handlers, since our parent component is *re-rendering*
<br/>

Alternative: We can ofc `useCallback()` hook, but what will be our array of dependencies? `[]` it must be [body] but again this wont work... since everytime our component changes, it will create a new isntance of body and again same return point.

## Solution

- With `useForm` Hook we got this covered, since we can have 2 types of inputs *debounced* - *non-debounced* Read more here about [Debounce](https://lodash.com/docs/4.17.15#debounce):

**Example**
```
import {useForm} from 'ferm-forms/hooks'
import {NonDebouncedInput,DebouncedInput} from 'ferm-forms/components;

const ParentComponent = ()=>{
const {mapper} = useForm({
<!-- Value is our initial Value it can be any other value in this case is empty -->
  field1:{value: '', onChange: handleField1Change }
  field2:{value:'', onChange: handleField2Change, withInputValue: true }
  field3:{value:''}
  .
  .
  .
})

const handleField1 = (value, setValue)=>{
    console.log("We got our fresh value here",value) IMPORTANT: SINCE FIELD1 IS DEBOUNCED WE MUST SET INTO OUR STATE with setValue();
     setValue(value)
}

const handleField2 = (value,setValue)=>{
  <!-- No need for dispatcher, we already have our value into our mapper -->
  console.log("We have our NonDebounced value",value)
}
return(
  <div>
      <!-- IF WE ARE USING DEBOUNCED INPUT WE CANT HAVE VALUE PROP THIS IS DUE BECAUSE WE GET IT AFTER 500MS ON OUR HANDLER! DONT FORGET TO SET IT IT setValue -->
        <DebouncedInput onChange={mapper.field1.onChange} />
      <!--   IF FOR SOME CASE WE NEEED THE VALUE KEEP IN MIND OUR PARENT COMPONENT WILL RENDER, BUT NOT CHILDREN :), DUE TO NEW STATE   -->
        <NonDebouncedInput value={mapper.field2.value}  onChange={mapper.field2.onChange} />
      <!--  NO USELESS HANDLERS: EG: onChange={(e)=> setField3(e.target.value)}   READ: VALUE PROP IS OPTIONA  -->
      <NonDebouncedInput  onChange={mapper.field3.onChange} />

   
  </div>
)
}
```
## Important :
- Keep in mind if we want to use Debounce we must sent a **handler** callback with `<DebouncedInput/>` component, if we need a **handler** and **value** prop we must use `<NonDebouncedInput/>` component  with
`withInputValue: true` on `useForm`
- If you are using Debounce Inputs keep in mind you need to set the state with second argument `setValue()`

# Getting our Input values:
 - We have 2 alternatives:
 1. Get them separetely with our mapper: mapper.field1.value 
 2. Get them all at once with our callback `getValues()` this is normally used **onSubmit** action.
 EG: 
 ```
 const {mapper, getValues} = useForm({...})
 .
 .
 .
 const handleSubmit = ()=>{
  const body = getValues()
  console.log(body);
  OUTPUT:
  <!--{field1: ${value}, field2: ${value}, field3: ${value}}-->
 }
 ```
## Got more Ideas Feel free to contribute in another branch and submit a PR :)
