"use strict"

// Maybe we don't need some of these props, let me think on it
const getTranslated = (props) => {

  // Do stuff

};

const transmitter = (props, cb) => {

  // We don't have object destructure just yet
  const codes = props.codes;
  const message = props.message;
  const timeouter = props.timeouter;
  const toggle = props.toggle;

  const translated = getTranslated(props);

  const transmit = (all) => {

    // Toggle on every iteration
    toggle();

    // Get head rest. Could be `const [ head, ...rest ] = all;` in later nodes
    const [ head, rest ] = [ all[0], all.slice(1) ];
    const isDone = !rest.length;
    // Either we're done and can call user provided cb, or we have to transmit via the timeouter
    const newCb = isDone ? cb : () => transmit(rest);

    return isDone ? newCb() : timeouter(newCb, head);

  };

  // Transmit the translated message, will be recursive
  return transmit(translated);

};


module.exports = transmitter;
