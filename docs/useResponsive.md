# useResponsive
## Keep track of your screen width within `.js` and a `hook`.
 1. Keep track of your screen-width resolutions with attached-event-listener.
 2. Ability to **remove** resizing listener for one time resolution.
 3. Set your own breaking-points.
 
 ## How to use it?
 - **NOTE:** By Default we have a listener triggered when screen-width gets resized
```js
import { useResponsive } from 'react-performant-forms';

const MyCustomComponent = ()=>{
  const {xs,sm,md,lg,xl} = useResponsive();
  return(
    <p>
    Hello world!
    </p>
  )
}

```
- **TO TURN OFF THE LISTENER:** To get the first-time render screen width, disregarding if the screen gets resized on runtime.
```js
import { useResponsive } from 'react-performant-forms';

const MyCustomComponent = ()=>{
  const {xs,sm,md,lg,xl} = useResponsive(false);
  return(
    <p>
    Hello world!
    </p>
  )
}

```

### Setting your own breaking-points:
- Default Breaking Points are being taken from [Bootstrap](https://getbootstrap.com/docs/5.0/layout/breakpoints/)
- **NOTE:** This is not recommended, but you can have more full control of your own breaking-dimensions points, by initializing the hook like this:
```js
import { useResponsive } from 'react-performant-forms';

const MyCustomComponent = ()=>{
  const {xs,sm,md,lg,xl} = useResponsive(,{
    xs: 200,
    sm: 400,
    md: 600,
    lg: 600,
    xl: 800
  });
  return(
    <p>
    Hello world!
    </p>
  )
}

```
- Keep in mind you will have to remain consistent, on every `useResponsive` hook call.





