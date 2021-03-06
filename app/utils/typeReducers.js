export default function typeReducers(actionTypes, defaultState, reducers) {
  const inverseActionTypes =
    new Map(Object.entries(actionTypes).map(([x, y]) => [y, x]));

  return (state = defaultState, action, fullState) => {
    const reducer = reducers[inverseActionTypes.get(action.type)];
    return reducer ? reducer(state, action, fullState) : state;
  };
}
