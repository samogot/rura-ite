function defaultShouldUpdate(curArgs, prevArgs) {
  return !curArgs.every((value, index) => value === prevArgs[index])
}


export default function conditionalMemoize(func, shouldUpdate = defaultShouldUpdate) {
  let lastArgs = null;
  let lastResult = null;
  return (...args) => {
    if (lastArgs === null ||
        lastArgs.length !== args.length ||
        shouldUpdate(args, lastArgs)) {
      lastResult = func(...args);
    }
    lastArgs = args;
    return lastResult;
  };
}