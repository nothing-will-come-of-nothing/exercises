"use strict"
// Forgot that node 4 doesn't like let without strict mode

const throttlePromises = (limit, originalPromises) => {

  // Wish I could solve this with recursion, but my brain is slow right now. Index it is.
  // Maybe I'll come back to this
  let index = 0;
  let results = [];
  // Assign to results, located here to keep mutation as near as possible to instantiation point
  const assignResult = (nextIndex) => (result) => {

    results[nextIndex] = result;

  };
  const originalPromisesLength = originalPromises.length;
  // Keep the promises executing as long as there is another one in the list
  const execute = () => {

    if (index === originalPromisesLength)
      return;

    // If we didn't do this and just did results.push(result) instead, we could lose ordering
    const nextIndex = index++;

    return originalPromises[nextIndex]()
      .then(assignResult(nextIndex))
      .then(execute);

  };

  // Get first promises to execute and pass them to executor
  const toExecuteInAll = Array(limit).fill().map(execute)

  return Promise.all(toExecuteInAll)
    // Return results after all promises have executed (index equals the original length)
    .then(() => results);

}

module.exports = throttlePromises;
