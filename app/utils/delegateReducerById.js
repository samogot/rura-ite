export default function (childReduced) {
  return (state, {id, ...data}, fullState) => ({
    ...state,
    [id]: childReduced(state[id], data, fullState),
  });
};