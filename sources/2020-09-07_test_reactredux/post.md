---
url: "unit-testing-react-redux-components"
id: unittestingreactredux
type: post
title: "Unit testing ReactRedux components"
date: 2020-09-07
tags: [react, redux]
author: david
excerpt: A convenient approach for testing React components connected via ReactRedux
---

### Premise

This article explores how to test a React component that is connected to Redux via `ReactRedux`.

In doing that we will also establish some patterns for making good tests in general.

### Test subject

Here's the (semi-)imaginary component that we want to test:

```javascript
export const CurrentLegoSetImage = () => {
  const set = useSelector(selectCurrentSet);
  const dispatch = useDispatch();
  const zoomHandler = () => dispatch(zoomToImage(set.imgUrl));
  return (
    <div className="legoImg">
      <img onClick={zoomHandler} src={set.imgUrl} data-testid="setimg" />
    </div>
  );
};
```

Looking at the code, there seems to be two pieces of functionality we could cover with unit tests:

1. it renders the current set image
1. it dispatches correct action when image is clicked

Let's begin with the first one!

### Arranging - how not to do it

So - how do we test that the component renders the current set image?

A naïve approach would be to notice this line...

```javascript
const set = useSelector(selectCurrentSet);
```

...and decide to simply mock `selectCurrentSet` to return a fixture set.

```javascript
jest.mock("../selectors", () => ({
  ...jest.requireActual("../selectors"),
  selectCurrentSet: jest.fn().mockReturnValue(fixtureSet),
}));
```

But this has big downside; we have now made assumptions about the component implementation in our test. If we change the component to use a different selector, the test will stop working.

Mocking `useSelector` isn't better. We're still in implementation detail land, as we then assume we're dealing with a hook component and not a class component using the ReactRedux `.connect` method.

### Arranging - another way of how not to do it

We don't want our test to mess with how the component connects to the store. Instead we want to ensure our store gets the state we need, and then let the component do its thing.

So we could hand-craft the app state we need:

```javascript
const testAppState = {
  ...defaultAppState,
  sets: {
    ...defaultAppState.sets,
    data: {
      [fixtureSet.id]: fixtureSet, // injecting the fixture set into the data
    },
  },
  ui: {
    ...defaultAppState.ui,
    currentSetId: fixtureSet.id, // setting our fixture set as the "current" set
  },
};
```

And then use that state to seed a new store instance:

```javascript
const store = createStore(rootReducer, testAppState);
```

Now we can use that store in our test, and things should be dandy.

But, this still isn't ideal!

- We're depending on knowing the shape of the state (granted, not a biggie if we're using TS, but still inelegant)
- We run the risk of testing a scenario that isn't achievable in actual app usage, which could mean the test is pointless

### Arranging, yet another way of not doing it.

Instead, we want to get our fixture set into place the same way it normally would get there - by firing actions!

So, what if we do this?

```javascript
// injecting the fixture set into the data
store.dispatch({
  type: LOAD_SETS_SUCCESS,
  payload: {
    [fixtureSet.id]: fixtureSet,
  },
});
// setting our fixture set as the "current" set
store.dispatch({
  type: SET_CURRENT_SET,
  payload: {
    id: fixtureSet.id,
  },
});
```

Now our state will contain the correct state!

This still isn't ideal though - we have hand-crafted actions, which should only ever be done in action creators.

### Arranging, how to actually do it

Therefore we refactor our previous failing into this:

```javascript
store.dispatch(loadSetsSuccess({ [fixtureSet.id]: fixtureSet }));
store.dispatch(setCurrentSet(fixtureSet.id));
```

Now we're truly using the same API versus the Redux layer as a user using the app!

It also makes the test setup very readable, if you've named your action creators appropriately.

### Acting - rendering strategies

Now our test wants to render our component within the context of that store. How do we do that?

As a reminder, this is what a `testing-library` React component unit test usually looks like:

```javascript
import { render } from "@testing-library/react";

// ...and inside a single test:

const testLibAPI = render(<CurrentLegoSetImage />);

// ...and now we use stuff from testLibAPI to assert things
```

The simplest way to use the store with our test state would be to wrap the JSX given to the test library `render` function with the ReactRedux store provider:

```javascript
const testLibAPI = render(
  <Provider store={store}>
    <CurrentLegoSetImage />
  </Provider>
);
```

But having to do this for every single test render would grow old pretty fast!

### Helpers, part 1 - testRender

Let's make a helper function that does the provider wrapping for you:

```javascript
import { render } from "@testing-library/react";
import { Provider } from "react-redux";

export function testRender(jsx, { store, ...otherOpts }) {
  return render(<Provider store={store}>{jsx}</Provider>, otherOpts);
}
```

Now our test becomes this instead:

```javascript
const testLibAPI = testRender(<MyComponent some={props}>, { store });
```

We still have to pass in our `store` among the other options for every render, but I prefer that to some magical `beforeEach` dance (which could mean leaking state between tests).

### Asserting render

With what we've talked about so far, we have enough to write a full test for ensuring that `CurrentLegoSetImage` renders the correct image:

```javascript
describe("The CurrentLegoSetImage component", () => {
  it("shows the correct image", () => {
    // Arrange
    const store = makeStore(); // same func we use in the actual app, gives us a normal Redux store
    store.dispatch(loadSetsSuccess({ [fixtureSet.id]: fixtureSet }));
    store.dispatch(setCurrentSet(fixtureSet.id));

    // Act
    const { getByTestId } = testRender(<LegoSetImage />, { store });

    // Assert
    const img = getByTestId("setimg");
    expect(img).toHaveAttribute("src", fixtureSet.imgUrl);
  });
});
```

Readable, no assumptions about implementation detail, no mocking or other magic.

### Acting behaviour

But, that was just the first half of the testing done. As we said initially we also need to test the zooming functionality!

Here's the code in the component that we want to test:

```javascript
const zoomHandler = () => dispatch(zoomToImage(set.imgUrl));
```

In other words, we want to ensure that when the image is clicked, a zoom happens.

Doing the click in our test is easy enough. We get hold of the `fireEvent` helper from the testing library...

```javascript
import { fireEvent } from "@testing-library/react";
```

...and then simply use that to fire the click on the rendered `img` element in our unit test:

```javascript
const { getByTestId } = testRender(<LegoSetImage />, { store });
const img = getByTestId("setimg");
fireEvent.click(img);
```

But, then what? What should we actually test for now?

### Asserting behaviour, how not to do it

One option could be to check the store state after the event:

```javascript
expect(store.getState().ui.zoomedImage).toBe(fixtureSet.imgUrl);
```

This isn't ideal though - now we're testing the behaviour of the `zoomToImage` action, not the component. Likely the code we just wrote is identical to a unit test for `zoomToImage` elsewhere, which isn't very DRY.

### Asserting behaviour, how still not to do it

Instead, we just want to assert that the correct action was fired to the store! If `store.dispatch` was wrapped in a spy, we could do something like this:

```javascript
const zoomAction = {
  type: ZOOM_TO_IMAGE_URL,
  payload: {
    url: fixtureSet.imgUrl,
  },
};
expect(store.dispatch).toHaveBeenCalledWith(zoomAction);
```

Now we're not testing the consequence of the zoom, we're just ensuring that the zoom happened. Which is exactly what we wanted!

But, of course, we re-committed our earlier sin of handcrafting action objects.

### Asserting behaviour, how to do it

Here's the final version where we use the action creator in the assertion:

```javascript
const zoomAction = zoomToImage(fixtureSet.imgUrl);
expect(store.dispatch).toHaveBeenCalledWith(zoomAction);
```

Much like when we rephrased the acting part we find that through using action creators we get very readable tests! And, as we've already established, it also has the added benefit of actually testing the correct API surface.

### Helpers, part 2 - testStore

But now we've just been imagining that `store.dispatch` is wrapped in a spy. How do we accomplish that?

Remember how we made a thin `testRender` wrapper around `render` from the testing library? In the same vein we can make a `makeTestStore` wrapper around `makeStore` from our app!

```javascript
const makeTestStore = (store) => {
  const store = makeStore();
  const origDispatch = store.dispatch;
  store.dispatch = jest.fn(origDispatch);
  return store;
};
```

Again, `makeStore` here is just the main store constructor function that I use in my app. It likely looks something like this:

```javascript
import { createStore } from "redux";

const makeStore = () => {
  // ...code here to create enhancers and the other stuff...
  return createStore(rootReducer, initialAppState, compose(...enhancers));
};
```

### The full unit test

If we piece everything together, here's the full test for our component:

```javascript
describe("The CurrentLegoSetImage component", () => {
  it("shows the correct image and zooms on click", () => {
    // Arrange
    const store = makeTestStore();
    store.dispatch(loadSetsSuccess({ [fixtureSet.id]: fixtureSet }));
    store.dispatch(setCurrentSet(fixtureSet.id));

    // Act
    const { getByTestId } = testRender(<LegoSetImage />, { store });

    // Assert
    const img = getByTestId("setimg");
    expect(img).toHaveAttribute("src", fixtureSet.imgUrl);

    // Act
    fireEvent.click(getByTestId("setimg"));

    // Assert
    expect(store.dispatch).toHaveBeenCalledWith(zoomImage(setImageUrl));
  });
});
```

Purists might argue that this test should be split in two, but, you get the idea!

### Wrapping up

To bring things home; the main point of this article is to try to test the API surface of the Redux layer, however we connect our React tree to it.

We strive to avoid testing implementation detail, which I feel we achieved. Our final test version is almost completely independent of `ReactRedux` - if we were to change it out for another bridging solution, the only change we'd need to make is to swap out `Provider` in `testRender`!

And, perhaps most importantly; testing your component with this strategy also means you end up with very readable and robust tests!

### PS

One could absolutely discuss whether the functionality in this rather trivial component is worth testing. I argue it is, but at the same time I can understand taking a more pragmatic approach and choosing one's battles more strategically.

But that's a topic for another article!
