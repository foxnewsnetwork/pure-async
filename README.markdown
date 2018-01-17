# Pure Async

WIP library for handling erlang-elixir like supervisors and retrying async functions

**TODOs**
- [ ] setup rollup to build file
- [ ] setup travis
- [ ] publish to npm
- [ ] fix readme so it's accurate
- [ ] setup a docs page
- [ ] write tests for using supervisor trees with `runAsync`

## The Problem

Q: How do you handle errors in `async` functions?
A: You either swallow everything or you don't

Consider the following code:

```javascript
async function foo() {
  return window.fetch('/api/my-endpoint');
}
```

The `foo` function uses a `fetch` which is an IO function which may fail depending upon our external endpoints. We typically would like to handle these external errors gracefully.

The javascript solution today is something like the following:

```javascript
try {
  const response = await foot();
  doStuff(response);
} catch(error) {
  doStuff(defaultResponse);
}
```

Now, suppose some dev wants to add some function into the `foo` function, but he makes an incredibly dumb runtime typo:

```javascript
async function foo() {
  let nothing;
  await nothing.fjalsdjf();

  return window.fetch('/api/my-endpoint');
}
```

Notice that our previous `try`-`catch` loop, which we originally intended to rescue us from an endpoint error, is now swallowing a `TypeError` that the programmer should have fixed during development.

This is clearly a massive problem and makes `async` functions dangerous to use in IO

### The Erlang Solution
Ideally, we'd like javascript to just have better error handling like any non-joke language, but this is javascript, so a better system of try-catch probably won't come until the cows come home

Ideally, something like the following would be great:

```javascript
try {
  @maxAttempts(10)
  @timeoutAfter(600)
  await foo()
  ...
} catch (error as Fetch404Error) {
  ... // handle
} catch (error as SomeOtherError) {
  ... // handle
} default (error) {
  // this is the default case of broken code
  throw error;
}
```
One of these days, I'll probably write up a proposal for the above, but for now, we can achieve a similar effect using the `runAsync` imported from this library

```javascript
import { runAsync } from 'pure-async';

async () => {
  const { code, error, result } = await runAsync(foo, [], {
    maxAttempts: 10,
    timeoutAfter: 600
  })
  
  if (code === 'ok') {
    ...
  } else if (code === 'error') {
    ...
  }
}
```

## Async Groups

Also known as task groups, the async group is a bunch of `runAsync`s that are linked together. Consider the following example:

```javascript
async function morningRoutine() {
  await runAsync(getUp, []);
  await runAsync(getDressed, []);
  await runAsync(brushTeeth, []);
}

const getUp = async () => fetch('get-up');
async function getDressed() {
  if (Math.random() > 0.5) {
    throw new Error('no clothes');
  } else {
    return fetch('get-dressed');
  }
}
```

In Erlang / Elixir, [3 strategies](https://hexdocs.pm/elixir/master/Supervisor.html#module-strategies) are supproted for how a group of `async` functions should be run:

- `one-for-one` : whatever fails should get re-tried
- `one-for-all` : if any fail, everything gets re-tried
- `rest-for-one` : if something fails, that thing and the rest gets re-tried

In the context of `async` functions, only `one-for-all` and `rest-for-one` strategies make sense. The correspond to the following examples:

- `one-for-all`: if our `getDressed` function fails, we start all over from the top and try again
- `rest-for-one`: if `getDressed` fails, we retry `getDressed` until it succeeds before moving on

We can implement both strategies with an async generator:

```javascript
import { strategies: { oneForOne, oneForAll, restForOne }, runAsync } from 'pure-async';
async function * morningRoute() {
  yield await runAsync(getUp, [])
  yield await runAsync(getDressed, [])
  yield await runAsync(brushTeeth, [])
}

const brushTeeth = async () => {
  if (Math.rand() > 0.7) {
    throw new Error('gingivitis');
  } else {
    return 'ok';
  }
}

runAsync(morningRoute, [], { strategy: restForOne })
```

A strategy is a transform that wraps the promise from `runAsync` which