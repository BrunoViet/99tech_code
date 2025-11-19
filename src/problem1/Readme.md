// Method: Gauss mathematical formula, directly calculates sum from 1 to n.
// Complexity: O(1) time, O(1) space.
function sum_to_n(n) {
  return (n * (n + 1)) / 2;
}

// Method: linear iteration with accumulator variable.
// Complexity: O(n) time, O(1) space.
function sum_to_n(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

// Method: creates array 1..n then uses reduce to sum.
// Complexity: O(n) time, O(n) space due to temporary array.
function sum_to_n(n) {
  return Array.from({ length: n }, (_, i) => i + 1)
    .reduce((acc, cur) => acc + cur, 0);
}