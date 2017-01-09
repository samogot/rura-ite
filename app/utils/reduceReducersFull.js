export default function reduceReducersFull(...reducers) {
  return (previous, current, full) =>
    reducers.reduce(
      (p, r) => r(p, current, full),
      previous
    );
}