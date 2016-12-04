export default function (childReduced) {
  return (state, {id, ...data}) => ({
    ...state,
    [id]: childReduced(state[id], data),
  });
};