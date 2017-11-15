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
Ideally, we'd like javascript to just have better error handling like any non-joke language, but this is javascript, so a better system of try-catch probably won't come until at least es2020.

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
import runAsync from 'run-async';

const { code, error, result } = await runAsync(foo, [], {
  maxAttemps: 10,
  timeoutAfter: 600
})

if (code === 'ok') {
  ...
} else if (code === 'error') {
  ...
}
```
