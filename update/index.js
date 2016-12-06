"use strict";

// In case you're confused by a lot of the order of function signatures, I'm a big fan of lodash/fp
// or Ramda's argument order so that if these functions were curried you'd be able to:
// flow(isKeyOf('test'), doSomethingWithResult)({ test: true })

// We're going to need to check if the commandSet key is also on the toUpdate obj
// though this will be useful elsewhere. Whole ugly parens or false bit is so we get a boolean
// back rather than undefined
const isKeyOf = (key, obj) => (obj && obj.hasOwnProperty && obj.hasOwnProperty(key)) || false;
// Abstracted Object.assign pattern for easy immutable updates
const immutableAssign = (toAssign, obj) => Object.assign({}, obj, toAssign);
// Immutably set key on obj to value via immutableAssign
const immutableSet = (key, value, obj) => immutableAssign({ [key]: value }, obj);

// This is better than an array for membership checks, because we can access the function directly
const commandFunctions = {
  $set: (value) => value,
  // If we had a bit more modern node [ ...command.value, ...toUpdate ]
  $unshift: (value, toUpdate) => value.concat(toUpdate),
  // Same comment as above, but [ ...toUpdate, ...command.value ]
  // I'm sure both could be Array.prototype.<method>.apply, but I find that kind of ugly when
  // not necessary
  $push: (value, toUpdate) => toUpdate.concat(value),
  // Call splice with each set of args
  $splice: (value, toUpdate) => {

    // Avoid global mutation while performing some evil local mutation via forEach and splice
    var updating = toUpdate.concat();

    value.forEach((args) => Array.prototype.splice.apply(updating, args));

    return updating;

  },
  // I can use my immutable assign directly to perform merge
  $merge: immutableAssign,
  // Call the provided function with the value to update
  $apply: (value, toUpdate) => value(toUpdate),
};

// We actually need to reduce the commandSet to see if it has any command keys we're looking for.
// If it does, we'll return an object with everything necessary to perform the command
// I don't know what facebook does, but I assume providing multiple update keys will be problematic
// and I'll just select one of them and warn the user
const getCommand = (commandSet) => {

  const keys = Object.keys(commandSet);
  const hasMultiple = keys.length > 1;
  const key = keys[0];
  // Oh, tricky, I guess I do have to check isKeyOf b/c someone might want to update a key
  // called hasOwnProperties
  const func = isKeyOf(key, commandFunctions) && commandFunctions[key];

  return { key, keys, value: commandSet[key], hasMultiple, func };

};

const update = (toUpdate, commandSet) => {

  // If a command exists directly on the commandSet, we can go ahead and perform it here
  // rather than initiating the toUpdate reducer
  const command = getCommand(commandSet);

  if (command.func) {

    if (command.hasMultiple) {

      console.warn(
        'You should only provide one command to the update function.'
        + ' We will just choose one for now and let you go with this warning'
      );

    }

    // Perform the command if it returned successfully and has a value
    return command.value ? command.func(command.value, toUpdate) : toUpdate;

  }

  // Come at this from the other direction. Command is source of reduce/recursion b/c keys present
  // in the command but not in 'toUpdate' should be created
  const reducedCommand = command.keys
    ? command.keys.reduce(
      (acc, key) => {

        // Basically a 'get prop or return an empty object' in case toUpdate doesn't exist or
        // doesn't have the key at this point
        const toUpdateValue = (toUpdate && toUpdate[key]) || {};

        return immutableSet(key, update(toUpdateValue, commandSet[key]), acc);

      },
      {}
    )
    : {};

  // Now we have to add back in any missing props from the original update object
  return immutableAssign(reducedCommand, toUpdate);

};

// Default export, at least pre `export default update` world
module.exports = update;
