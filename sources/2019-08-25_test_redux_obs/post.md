---
url: "unit-testing-redux-observable-epics"
id: reduxobservabletesting
type: post
title: "Unit testing Redux-observable epics"
date: 2019-08-26
tags: [redux, redux-observable, testing, jest, typescript]
author: david
excerpt: Demonstrating a convenient helper method and pattern for unit testing Redux observable epics
---

### Premise

There are many different libraries for dealing with side effects in Redux. Right now my favourite is [`redux-observable`](https://redux-observable.js.org/) - the price of admission can be high since you need to buy into [RxJS](https://rxjs.dev/) and reactive programming, but once you're in the sailing is really smooth!

However, I initially had some troubles writing unit tests that I felt at ease with. The official docs didn't help me much, and marble testing just felt like another layer without any real benefits.

After trying some different approaches I ended up with a rather simple helper, which will be introduced in this post!

### Crash test dummy

First we invent an imaginary epic to test! Say we have a Redux-controlled form where the user has rated something. A big button at the bottom will dispatch a `submitRating` action. Our epic now needs to...

1. act on those actions
1. get the movieId from state (because the rating component doesn't know it)
1. make a request to a service
1. dispatch a success/fail action

Such an epic could look something like this:

```typescript
const submitRatingEpic: AppEpic = (action$, state$, deps) =>
  action$.pipe(
    filter(isSubmitRatingStartAction),
    withLatestFrom(state$),
    switchMap(([action, state]) =>
      from(
        deps
          .submitRating(state.ui.currentMovieId, action.rating)
          .then(res => [null, res])
          .catch(err => [err, null])
      )
    ),
    map(([err, res]) =>
      err ? submitRatingError(err) : submitRatingFinish(res)
    )
  );
```

For TypeScript users; my `AppEpic` type is a simple helper type looking something like this:

```typescript
import { Epic } from "redux-observable";
import {
  AppAction, // a union of all action types
  AppState, // typings for the full
  EpicDeps // the dependency object given to all epics
} from "../types";

export type AppEpic = Epic<AppAction, AppAction, AppState, EpicDeps>;
```

The contents of the `AppAction` union are all extensions of a basic `Action` type:

```typescript
type Action<T extends string, P> = {
  type: T;
  payload: P;
};
```

### Using the helper

To write tests we need to be able to do the following:

- emit on `action$`
- emit on `state$`
- provide dependencies
- see what the epic emits at any point in time

The helper does exactly this with a very simple API - you simply call a `testEpic` function, typically once per unit test:

```typescript
const {
  emitAction, // will emit to action$
  emitState, // will emit to state$
  epicEmissions // a mutating array of emissions from the epic
} = testEpic(submitRatingEpic, fakeDeps);
```

A test would then typically look something like this:

```typescript
// act
emitState(someFakeState);
emitAction(someFakeAction);

// assert
expect(epicEmissions).toHaveLength(1);
expect(isSomeAction(epicEmissions[0])).toBe(true);
expect(epicEmissions[0].payload).toEqual(expectedPayload);
```

### Applying the helper

Let's examing what this would look like when testing `submitRatingEpic`!

#### _Arranging_ the test

First we do some setup! We need...

1. a fake service:

   ```typescript
   const fakeReply = { fake: "reply" };
   const fakeService = jest.fn(() => Promise.resolve(fakeReply));
   const fakeDeps: Partial<EpicDeps> = {
     submitRating: fakeService
   };
   ```

1. some fake data:

   ```typescript
   const fakeMovieId = "FAKE_MOVIE_ID";
   const fakeRating = 666;
   const defaultAppState = getDefaultAppState();
   const fakeAppState = {
     ...defaultAppState,
     ui: {
       ...defaultAppState.ui,
       currentMovieId: fakeMovieId
     }
   };
   ```

1. an epic instance to test! This is where our helper method comes into play:

   ```typescript
   const { epicEmissions, emitState, emitAction } = testEpic(
     submitRatingEpic,
     fakeDeps
   );
   ```

#### _Acting_ out the test

Now to finally make stuff happen! We need to...

1. emit our fake state with the fakeMovieId:

   ```typescript
   emitState(fakeAppState);
   ```

1. emit the action that we want to see the epic react to:

   ```typescript
   emitAction(submitRatingStart(fakeRating));
   ```

   Here `submitRatingStart` is a simple action creator. We could of course also inline an object literal, but using the action creators that we already have makes the test more readable!

Note that the order here matters - since the epic will fetch the current movie id from the current state, that state needs to already be there when the action triggers the epic.

#### _Asserting_ things went ok

The final piece of the puzzle is to make assertions against `epicEmissions`, to test that the epic has emitted the correct action:

```typescript
expect(epicEmissions).toHaveLength(1);
const action = epicEmissions[0];
expect(isSubmitRatingFinish(action)).toBe(true);
expect(action.payload).toEqual({
  movieId: fakeMovieId,
  rating: fakeRating
});
```

No need for cumbersome subscriptions to throwaway observables, or any such shenanigans. Simply inspect the contents of `epicEmissions`!

For more complex tests we might do more state and/or action emissions, and test the contents of `epicEmissions` at several points during that.

### Helper source code

There isn't much to the source of the helper! It mainly consists of instantiating fake `ActionsObservable` and `StateObservable` that `redux-observable` will use to create `action$` and `state$` for the individual epics.

```typescript
import { Subject } from "rxjs";
import { ActionsObservable, StateObservable, Epic } from "redux-observable";

export const testEpic = <A extends Action<string, any>, S, D>(
  epic: Epic<A, A, S, D>, // A, S, D will be inferred from here
  deps: Partial<D> = ({} as unknown) as D
) => {
  const actionSubject = new Subject<A>();
  const action$ = new ActionsObservable(actionSubject);
  const emitAction = actionSubject.next.bind(actionSubject);

  const stateSubject = new Subject<S>();
  const state$ = new StateObservable(stateSubject, (null as unknown) as S);
  const emitState = stateSubject.next.bind(stateSubject);

  const epicEmissions: A[] = [];
  epic(action$, state$, deps as D).subscribe(e => epicEmissions.push(e));

  return { emitAction, emitState, epicEmissions };
};
```

The regular JS versions for the non-enlightened:

```javascript
import { Subject } from "rxjs";
import { ActionsObservable, StateObservable } from "redux-observable";

export const testEpic = (epic, deps = {}) => {
  const actionSubject = new Subject();
  const action$ = new ActionsObservable(actionSubject);
  const emitAction = actionSubject.next.bind(actionSubject);

  const stateSubject = new Subject();
  const state$ = new StateObservable(stateSubject, null);
  const emitState = stateSubject.next.bind(stateSubject);

  const epicEmissions = [];
  epic(action$, state$, deps).subscribe(e => epicEmissions.push(e));

  return { emitAction, emitState, epicEmissions };
};
```

### Wrapping up

For me, exchanging marble testing and my other convoluted attempts for this helper made my epic tests aeons easier to read, write and maintain. My hope is that you will have the same experience!
