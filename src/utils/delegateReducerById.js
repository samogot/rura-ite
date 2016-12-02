import compact from './compact';
export default function (childReduced) {
  return (state, {id, ...data}) => ({
    ...state,
    [id]: compact(childReduced(state[id], data)),
  });
};