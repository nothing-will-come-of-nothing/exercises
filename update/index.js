// We're going to need to check if the commandSet key is also on the toUpdate obj
// though this will be useful elsewhere. Whole ugly parens or false bit is so we get a boolean
// back rather than undefined
const isKeyOf = (key, obj) => (obj && obj.hasOwnProperty && obj.hasOwnProperty(key)) || false;

// Just for testing purposes...
const id = (x) => { console.log('called func with', x); return x };

// This is better than an array for membership checks, because we can access the function directly
const commandFunctions = {
  $set: (command, toUpdate) => command.value || toUpdate,
  // If we had a bit more modern node [ ...command.value, ...toUpdate ]
  $unshift: (command, toUpdate) => command.value ? command.value.concat(toUpdate) : toUpdate,
  $splice: id,
  $merge: id,
  $push: id,
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
  console.log(command)

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

      // This will be a recursive call if commandSet key is a key of the updating object
      if (isKeyResult) {

        const newValue = update(value, commandSet[key]);

        // This could basically be acc[key] = recursiveReduce..., but I prefer reducers to avoid
        // mutation even at a slight cost to legibility
        return Object.assign({}, acc, { [key]: newValue });

      }

      // Key is to be ignored and thus simply set to the original value
      console.log('Key is to be ignored and thus simply set to the original value');
      return Object.assign({}, acc, { [key]: value });

    },
    {}
  );

};

// Default export, at least pre `export default update` world
module.exports = update;
