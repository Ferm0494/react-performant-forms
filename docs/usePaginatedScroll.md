# usePaginatedScroll hook

```import {usePaginatedScroll} from 'react-performant-forms' ```js

## Keep pagination, data and application states within a hook.

### How to use it?
```js
/* This is mocked Data */
const TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipiscin
  g elit. Suspendisse ut laoreet ligula. Aenean ipsum ma
  uris, vehicula et posuere vitae, molestie sed turpis. Integer
  ultrices hendrerit enim, eget feugiat lectus accumsan non. Nulla null
  a lorem, feugiat eget fini\lementum vulputate leo, sed auctor risus commodo vitae. In erat sapien, v
  ulputate at venenatis vel, molestie in nunc. Pellen\Morbi eget t
  s felis sodales ac.Duis enim mi, vastas ornare. Morbi a ante ma
  uris. Nunc rhoncus eget ex nec dignissim. In luctus purus ante, eu pe
  llentesque ex ullamcorper sed. Aliquam lobortis eros eget lacus sodales, et imper
  diet massa semper. Sed fermentum risus eu nunc dapibus porttitor. Nulla imperdiet lacus
  justo, sit amet fringilla nunc rhoncus eu. Nulla fringilla cursus purus. Pellentesque habitant mor
  bi tristique senectus et netus et malesuada fames ac turpis egestas. Viv
  amus vestibulum quam ut fringilla auctor. Curabitur semper molestie arcu, vel sol
  licitudin magna tempus id,liquet, ornare tellus a";

/* This is a Mocking promise that resolves TEXT constant
  Arguments:
  - page: is the current page counter, it starts at 1.
  If succcessful promise resolve it increments, else it remains the same.

*/

const getData = async (page) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 3000, [TEXT]);
  });
};

const scrollContainer = ()=>{
const {
    onScroll,
    scrollReference,
    data,
    loading,
    counter
  } = usePaginatedScroll({
    getData,
    initialData: [TEXT]
  });
  
  return (
    <div
      onScroll={onScroll}
      ref={scrollReference}
      style={{
        overflow: "auto",
        height: "10em",
        backgroundColor: "yellow",
        maxHeight: "10em"
      }}
    >
      <p>{data} </p>
      {loading && <p>Loading...</p>}

}
```
### Arguments :
1. `getData` (Mandatory): `getData()` is a Promise that resolves an **Array** of new Data to be appended into our existing data.
2. `initialCounter`: Initial value of where does your pagination starts.**Default value is 1**.
3. `initialData`: Initial Data as an Array. **Default Value is an empty array**.
4. `offSet`: This argument applies when `getData` was rejected useful for errors to scroll up and dismiss the loading state. Defines how much the scroll should go up
in order for the user to scroll to bottom again, **Default Value is 0.1**

### Outputs:
1. `loading`: Describe the state of `getData`.
2. `counter`: Keep tracks of the bottom-scroll ends, useful to keep pagination implicitly.
3. `data`: Combination of `initialData` and returning resolved results of `getData()`.
4. `onScroll`: Callback that gets appended to the scrollable div.
5. `error`: Wether if we got an rejection from our `getData` callback.
6. `scrollReference`: Reference to be applied to the scrollable div within `ref` prop.




