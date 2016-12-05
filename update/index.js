// We're going to need to check if the commandSet key is also on the toUpdate obj
// though this will be useful elsewhere. Whole ugly parens or false bit is so we get a boolean
// back rather than undefined
const isKeyOf = (key, obj) => (obj && obj.hasOwnProperty && obj.hasOwnProperty(key)) || false;

// We'll also need to check if commandSet key is one of the accepted commands
const isCommand = (key) => {

  const commands = [ '$set', '$unshift', '$splice', '$merge', '$push', 'hasOwnProperty' ];

  return commands.indexOf(key) > -1;

};

const recursiveReduceCommandSet = (toUpdate, commandSet) => {

  // First step is going to be reducing the toUpdate object immutably
  const toUpdateKeys = Object.keys(toUpdate);

  return toUpdateKeys.reduce(
    (acc, key) => {

      const isKeyResult = isKeyOf(key, commandSet);
      const value = toUpdate[key];

      // This will be a recursive call if commandSet key is a key of the updating object
      if (isKeyResult) {

        const newValue = recursiveReduceCommandSet(value, commandSet[key]);

        // This could basically be acc[key] = recursiveReduce..., but I prefer reducers to avoid
        // mutation even at a slight cost to legibility
        return Object.assign({}, acc, { [key]: newValue });

      }

      // We need to update the value at this point if commandSet has a command key
      if (isCommand(key)) {

        // Hand wavy do some stuff here
        // return Object.assign({}, acc, { [key]: someFunc(newValue) });

      }

      // Key is to be ignored and thus simply set to the original value
      return Object.assign({}, acc, { [key]: value });

    },
    {}
  );

};

const update = (toUpdate, commandSet) => {

  // Do some things if necessary before calling recursive function

};

exports.default = update;
