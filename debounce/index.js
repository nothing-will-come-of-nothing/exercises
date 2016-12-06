"use strict";

const debounce = (func, time) => {

  // We'll save a reference to whether or not the function is executing, starting with false
  // b/c we haven't executed yet.
  let executing = false;

  // This has to use the function keyword rather than an arrow so that we can access this and
  // use arguments object
  return function () {

    // If the function is currently executing, return null
    if (executing)
      return null;

    // Toggle executing. We're getting started now
    executing = true;

    // Is there a good reason to clear timeouts? I'm pretty sure there's not. Anyhow, setting
    // timeout to the consumer provided time and calling func after that
    setTimeout(
      () => {

        // Toggle executing. We're done for now
        executing = false;
        // I don't need to save a reference to the 'this' context or do a funky arguments copy
        // b/c the timeout function here is an arrow and thus doesn't disrupt 'this' or the
        // arguments object. Though I'd still want newer node versions' (...args) =>
        return func.apply(this, arguments);

      },
      time
    );

  };

};

module.exports = debounce;
