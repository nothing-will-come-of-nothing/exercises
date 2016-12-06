// We're going to need to check if the commandSet key is also on the toUpdate obj
// though this will be useful elsewhere. Whole ugly parens or false bit is so we get a boolean
// back rather than undefined
const isKeyOf = (key, obj) => (obj && obj.hasOwnProperty && obj.hasOwnProperty(key)) || false;
// Abstracted Object.assign pattern for easy immutable updates
const immutableAssign = (toAssign, obj) => Object.assign({}, obj, toAssign);
// Immutably set key on obj to value via immutableAssign
const immutableSet = (key, value, obj) => immutableAssign({ [key]: value }, obj);

// Just for testing purposes...
const id = (x) => { console.log('called func with', x); return x };

// This is better than an array for membership checks, because we can access the function directly
const commandFunctions = {
  $set: (command, toUpdate) => command.value || toUpdate,
  // If we had a bit more modern node [ ...command.value, ...toUpdate ]
  $unshift: (command, toUpdate) => command.value ? command.value.concat(toUpdate) : toUpdate,
  // Same comment as above, but [ ...toUpdate, ...command.value ]
  // I'm sure both could be Array.prototype.<method>.apply, but I find that kind of ugly when
  // not necessary
  $push: (command, toUpdate) => command.value ? toUpdate.concat(command.value) : toUpdate,
  $splice: (command, toUpdate) => {

    if (!command.value)
      return toUpdate;

    // Avoid global mutation while performing some evil local mutation via forEach and splice
    var updating = toUpdate.concat();

    command.value.forEach((args) => Array.prototype.splice.apply(updating, args));

    return updating;

  },
  $merge: (command, toUpdate) => command.value
    ? immutableAssign(command.value, toUpdate)
    : toUpdate,
  $apply: (command, toUpdate) => command.value
    ? command.value(toUpdate)
    : toUpdate,
  // Not sure what this does really... looking at fb docs
  hasOwnProperty: id,
};

// We actually need to reduce the commandSet to see if it has any command keys we're looking for.
// If it does, we'll return an object with everything necessary to perform the command
// I don't know what facebook does, but I assume providing multiple update keys will be problematic
// and I'll just select one of them and warn the user
const getCommand = (commandSet) => {

  return Object.keys(commandSet).reduce(
    (acc, key) => {

      // Get the command function from the above object via prop lookup (I made the object, so
      // no need for hasOwnProperty dance)
      const func = commandFunctions[key];

      if (!func)
        return acc;

      const hasMultiple = acc.key && true;

      return { key, value: commandSet[key], hasMultiple, func };

    },
    {}
  );

};

const update = (toUpdate, commandSet) => {

  // If a command exists directly on the commandSet, we can go ahead and perform it here
  // rather than initiating the toUpdate reducer
  const command = getCommand(commandSet);

  if (typeof toUpdate !== 'object' || command.key) {

    if (command.hasMultiple) {

      console.warn(
        'You should only provide one command to the update function.'
        + ' We will just choose one for now and let you go with this warning'
      );

    }

    // Perform the command if it returned successfully
    if (command.key)
      return command.func(command, toUpdate);

    // Otherwise, just return the object itself
    return toUpdate;

  }

  // Reduce the toUpdate object immutably
  const toUpdateKeys = Object.keys(toUpdate);

  return toUpdateKeys.reduce(
    (acc, key) => {

      const isKeyResult = isKeyOf(key, commandSet);
      const value = toUpdate[key];
      // This will be a recursive call if commandSet key is a key of the updating object, otherwise
      // just set the original value
      const newValue = isKeyResult ? update(value, commandSet[key]) : value;

      // This could basically be acc[key] = recursiveReduce..., but I prefer reducers to avoid
      // mutation
      return immutableSet(key, newValue, acc);

    },
    {}
  );

};

// Default export, at least pre `export default update` world
module.exports = update;
