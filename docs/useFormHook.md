# useForm hook.

`import {useForm} from 'react-performant-forms'`

## Why was it created ?

This hook is created to control inputs in a parent component, with less code boilerplate & optimize rerenders as possible, we normally do something like this when we create a form.
<br>
<br>
**Example:**
```js
const [form,setForm] = useState({
  field1: '',
  field2: ''
})

const [errors,setErrors] = useState({
  field1: false,
  field2: true
}); 

const handleField1Change = (value)=>{
   setForm({...form, field1: value);
}   
/* THIS IS SOME RANDOM LOGIC BASED ON FIELD1 STATE VALUE */
const handleField2Change = (value)=>{
  const field2 =  value.toUpperCase();
  if(!field1){
    setForm({field1: value, field2})
  }else{
  } setForm({..form,field2})
}

const handleSubmit = (e)=>{
  if(!field1 || !field2){
    setErrors({
      field1: !field1,
      field2: !field2,
    })
    return;
  }
.
.
.

}
return(
    <form onSubmit={hanldeSubmit}>
      <Input type="text" onChange={handleField1Change} value={form.field1}/>
      <Input type="text" onChange={handleField2Change} value={form.field2} />
      <button type="submit">Submit</button>
    </form>
)
```

**Context**:  So whats happening here? Whats happening is that if our `field1 || field2` changes our whole form gets to render, due to the state change in our parent component contatining our inputs, of course we can use `memo` in our children components, but that wont simply work due to the new instances in our handlers being created everytime our parent gets to re-render. So even if one input changes, our whole inputs will change disregarding if they have `memo`

**Alternative**
<br>
*Can't we just use useCallback  & memo*?
<br>
- The short answer is **no**, since in some cases we need access to the state form values, and since this is the case... we must include the depending fields that we are going to use in our dependency array in our `useCallback()`, so we get back to the previous point where we get if one of our field in our dependency changes... the callback will be recreated, and again it will re-render whenever this callback is being used. Disregarding if your input changed or not.

# How to solve it with useForm hook ?
- Pretty much the idea of the useForm is to summarize form actions which involves:
1. Change Handlers being summarized as memoized dispatchers ( So we can use `memo` )
2. Field Values.
3. Error Handlers
4. Submit Handlers
5. Blur Handlers
6. Validation callbacks
7. Error Flags.
8. Error Messages

## How to use it ?

- Declare the hook and the fields you are going to use in your **form** it can be any type for this case Im going to use text fields.
```js
const {state,handlers,handleSubmit} = useForm({
  fields:{
    field1:{value:'Initial value for field1'}
    field2: {value: '' }
  }
  onSubmit:(values)=>{
    console.log(values)
  <!-- You should be seeing the state values for field1 and field2-->
  }
});

return(
  <form onSubmit={handleSubmit}>
    <Input type="text" onChange={handlers.field1} value={state.field1}/>
    <Input type="text" onChange={handlers.field2} value={state.field2} />
    <button type="submit>Submit</button>
  </form>
)
```
Thats it, you created a simple form in a single *JSON* and the good thing is that you can `memo` your inputs components and they wont re-render disregarding if the other 1 changed, due that you are handling via a memoized dispatcher callback
<br>

# Adding Custom Handlers for extra logic in our Fields.

- We can add a custom handler to handle logic into our field for example any transformation or pasing that it may need, it can surely be added with the key *onChange* in our respective field prop we are interested, once we are done with the logic it's just simple enough to *return* it to set into the inner state of our *useForm hook*.

```js
const handleField2Change = (valueofField2)=>{
<!-- JUST A SIMPLE LOGIC  -->
  return valueOfField2.trim();
}
const {state,handlers,handleSubmit} = useForm({
  fields:{
    field1:{value:'Initial value for field1'}
    field2: {value: '', onChange: handleField2Change }
  }
  onSubmit:(values)=>{
    console.log(values)
  <!-- You should be seeing the state values for field1 and field2-->
  }
});

return(
  <form onSubmit={handleSubmit}>
    <Input type="text" onChange={handlers.field1} value={state.field1}/>
    <Input type="text" onChange={handlers.field2} value={state.field2} />
    <button type="submit">Submit</button>
  </form>
)
```
# Accessing other values of our forms into our handlers.

Cant I just simply use the *state* prop from `useForm` ? Short answer: *NO* ,since they are memoized, you will only get the field fresh to the connected handler, however the rest will remain to their **initial state** .

## SOLUTION: 
```js
const handleField2Change = (field2Value,state)=>{
const {field2,field1} = state
<!-- field2 and field here we get our current states for field1 && field2 -->
.
.
.
}
```
# Setting Multiple fields state in a single handler

Let's say you want to return a new state for your field1 based on field2 as well set the new value for field2 in your `handleField2Change`

## SOLUTION:

```js
const handleField2Change = (field2Value,state)=>{
  const {field2,field1} = state;
  return{field1: field2, field2: field2Value}
}
```
By just returning an object with the corresponding keys, the `useForm` hook will set the state values for those corresponding keys.
<br>
<br>
IMPORTANT: Keep in mind that those keys needs to be defined in our `fields` prop in our `useForm` hook, the reason for this is to not add thrash and keep our form well defined from the beginning.

# Controlling Events in our Handler:
```js
const handleField2Change = (field2Value,state,event)=>{
.
.
.
}
```

# Validations & Errors.

We can handle errors and validations within our `JSON` config `useForm`,
## Getting started 
```js
const {state,handleSubmit} = useForm({
  fields:{
    field1:{value:'Initial value for field1',error: false, errorMessage: 'SOME_DEFAULT_ERROR_MESSAGE_FIELD1'}
    field2: {value: '' , error: false, errorMessage: 'SOME_DEFAULT_ERROR_MESSAGE_FIELD2'}
  }
  onSubmit:(values)=>{
    console.log(values)
  <!-- You should be seeing the state values for field1 and field2-->
  }
});

return(
  <form onSubmit={handleSubmit}>
    <Input type="text" onChange={handlers.field1} value={state.field1} error={state.field1.error} errorMessage={state.field1.errorMessage}/>
    <Input type="text" onChange={handlers.field2} value={state.field2} error={state.field2.error} errorMessage={state.field2.errorMessage}/>
    <button type="submit">Submit</button>
  </form>
);
```
1. `error` : is the state of our error field we initialized as false.
2. `errorMessage`: is the defaultErrorMessage that will pop when we trigger a validation.

## Triggering Errors and Changing Error Messages in our Fields.
- Triggering Error Fields:
```js
const {state,handlers,isValidForm,handleSubmit} = useForm({
  fields:{
    field1:{value:'Initial value for field1',error: false, errorMessage: 'SOME_DEFAULT_ERROR_MESSAGE_FIELD1',checkFieldErrors: ()=> true}
    field2: {value: '' , error: false, errorMessage: 'SOME_DEFAULT_ERROR_MESSAGE_FIELD2', checkFieldErrors: ()=> true}
  }
  onSubmit:(values)=>{
  <!-- You should be seeing the state values for field1 and field2-->
  console.log(values);  
  <!-- NEEDED: In order to trigger each checkErrorFields callback for each field  -->
  if(isValidForm()){
  <!--  since each of our checkErrorFields is returning true isValidForm() will return true    -->
  console.log("our form has some errors")
  }
  }
});

return(
  <form onSubmit={handleSubmit}>
    <Input type="text" onChange={handlers.field1} value={state.field1} error={state.field1.error} errorMessage={state.field1.errorMessage}/>
    <Input type="text" onChange={handlers.field2} value={state.field2} error={state.field2.error} errorMessage={state.field2.errorMessage}/>
    <button type="submit">Submit</button>
  </form>
);
```
1. `isValidForm()`: Is our helper callback that will check every `checkFieldErrors` of our fields if **ONE OF THEM RETURNS TRUE**, `isValidForm` will **return FALSE**
2. `checkFieldErrors`: Is a prop that needs `error` prop to be DEFINED,it validates the field for our specific needs, if it returns true, the `error` defined in our field prop will be set up to **true**, and `isValidForm()` will return **false** when executed.
<br>
NOTE: Please keep in mind that `error` prop is attached to the `checkFieldErrors` and `checkFieldErrors` gets executed when we call `isValidForm()`

- Changing Default Error Messages within our Fields:

```js
const {state,handlers,isValidForm,handleSubmit} = useForm({
  fields:{
    field1:{value:'Initial value for field1',error: false, errorMessage: 'SOME_DEFAULT_ERROR_MESSAGE_FIELD1',checkFieldErrors: ()=> 'INVALID_MSG1'}
    field2: {value: '' , error: false, errorMessage: 'SOME_DEFAULT_ERROR_MESSAGE_FIELD2', checkFieldErrors: ()=> 'INVALID_MSG2'}
  }
  onSubmit:(values)=>{
  <!-- You should be seeing the state values for field1 and field2-->
  console.log(values);  
  <!-- NEEDED: In order to trigger each checkErrorFields callback for each field  -->
  if(isValidForm()){
  <!--  since each of our checkErrorFields is returning true isValidForm() will return true    -->
  console.log("our form has some errors")
  }
  }
});

return(
  <form onSubmit={handleSubmit}>
    <Input type="text" onChange={handlers.field1} value={state.field1} error={state.field1.error} errorMessage={state.field1.errorMessage}/>
    <Input type="text" onChange={handlers.field2} value={state.field2} error={state.field2.error} errorMessage={state.field2.errorMessage}/>
    <button type="submit">Submit</button>
  </form>
);
```
- If `checkFieldErrors` returns a string it means that's is  the error string message we want to display when executing `isValidForm()`, so our `errorMessage` will have the returning string value of the `checkFieldErrors`.

NOTE: IMPORTANT Once we show the returning string of `checkFieldErrors` once we change the value of that field via our `handler` , `errorMessage` will have the value we initialized it.

## Server Errors
- We normally want to check if our server is returning a valid request or not, is our request is invalid based on server validation and we want to display which fields failed we can do that with our helper: `onError`

```js
const {state,handlers,isValidForm,handleSubmit,handleErrors} = useForm({
  fields:{
    field1:{value:'Initial value for field1',error: false, errorMessage: 'SOME_DEFAULT_ERROR_MESSAGE_FIELD1',checkFieldErrors: ()=> 'INVALID_MSG1'}
    field2: {value: '' , error: false, errorMessage: 'SOME_DEFAULT_ERROR_MESSAGE_FIELD2', checkFieldErrors: ()=> 'INVALID_MSG2'}
  }
  onSubmit:(values)=>{
  <!-- You should be seeing the state values for field1 and field2-->
  console.log(values);  
  <!-- NEEDED: In order to trigger each checkErrorFields callback for each field  -->
  if(isValidForm()){
  <!--  since each of our checkErrorFields is returning true isValidForm() will return true    -->
  console.log("our form has some errors")
  }
  },
  onError:(state,errors)=>{
  <!-- MOCK: This is an example in destructuring our response coming from our request  -->
  const {message} = errors?.[0]?.response?.data;
   let fieldsWithErrors = {}
  if(message.includes('field1')) fieldWithErrors = {...fieldWithErrors, field1: 'SERVER_ERROR_MSG1'}
  if(message.includes('field2'))fieldWithErrors = {...fieldWithErrors, field2: 'SERVER_ERROR_MSG2'}
  return fieldsWithErrors
  }
});

return(
  <form onSubmit={handleSubmit}>
    <Input type="text" onChange={handlers.field1} value={state.field1} error={state.field1.error} errorMessage={state.field1.errorMessage}/>
    <Input type="text" onChange={handlers.field2} value={state.field2} error={state.field2.error} errorMessage={state.field2.errorMessage}/>
    <button type="submit">Submit</button>
  </form>
);
```
Then you can just simply, invoke your `handleError` helper in `catch`:
```js
fetch('https://api.github.com/orgs/axios')
  .then(response => response.json())    // one extra step
  .then(data => {
    console.log(data) 
  })
  .catch(handleErrors);
```

## Debounce Support.

Summary: Debounce is used on `Text` inputs, where we dont want to  apply certain logic to each time the user interacts with the keyboard ( state- changing), so we only care about the user **FINAL**  input, so we can later on  apply that logic into a  **SINGLE** input instead of each **EACH** of the user input:
You can read more here: https://lodash.com/docs/4.17.15#debounce

- Disadvatanges:
1. You can't use the `value` prop on inputs, this is because since it will take the latest input after the user has timeout - debounce, a dumb example can be:
<br> 
User types: H-E-L-L-O => If we use `debounce` & `value` prop we will only see the **O** on our input, since that was the latest input from user. Logic will be applied only to the **O** as well.

2. If we dont care about each of the user interaction with the keyboard but only the **FINAL** and complete input of the user the best is to dismiss the `value` prop and use `debounce`.

- Advantages:
1. Since we can't use `value` prop let's put the following example without using `debounce`:
User Types: H-E-L-L-O => If we use `debounce` we only will apply the logic to the final user input which is *HELLO*, so after timeout we will be getting our complete value in our  *state*.
2. Since we only changed the state once, the re-renderings get to saved big-time as well callbacks being run on every keyboard interaction, in few words we increase performance in our user text - inputs.

## How to use Debounce on useForm.

```js
<!-- Logic gets applied after timeout -->
const handleField2Change = (valueofField2)=>{
<!-- JUST A SIMPLE LOGIC  -->
  return valueOfField2.trim();
}
const {state,handlers,handleSubmit} = useForm({
  fields:{
    field1:{value:'Initial value for field1'}
    <!-- Tells we can't use value prop in our text-input, to use debounce feature -->
    field2: {value: '', onChange: handleField2Change, withoutInputValue: true }
  }
  onSubmit:(values)=>{
    console.log(values)
  <!-- You should still be seeing the state values for field1 and field2-->
  }
});

return(
  <form onSubmit={handleSubmit}>
    <Input type="text" onChange={handlers.field1} value={state.field1}/>
    <!-- SINCE WE ARE USING: withouInputValue prop in our field2 we cant have value prop in our field2 -->
    <Input type="text" onChange={handlers.field2}/>
    <button type="submit">Submit</button>
  </form>
)
```

1. `withoutInputValue`: Boolean flags that tells our `useForm` hook to use a `debounce` handler instead, default is `false`.
2. If `withoutInputValue` is true keep in mind that you wont be able to use `value` prop in text inputs.

## Questions ?

1- Submitting a PR: Please add tests to your code in a separate branch.
2- Issues? Feel free to submit any issue on the issue section :https://github.com/Ferm0494/ferm-forms/issues



