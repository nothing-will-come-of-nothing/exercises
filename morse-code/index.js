"use strict"
// 1. dot duration is the baseline timing measurement
const dot = 1;
// 2. dashes are timed as 3 dots
const dash = 3;
// 3. time between letters are 3 dots
const letters = 3;
// 4. time between words are 7 dots
const words = 7;

const getTranslated = (codes, message) => {

  return message.split().reduce(something, '');

};

const transmitter = (props, cb) => {

  const codes = props.codes;
  const message = props.message;
  const toggle = props.toggle;
  const timeouter = props.timeouter;

  const translated = getTranslated(codes, message);

  const transmit = (all) => {

    // Toggle on every iteration
    toggle();

    // Get head rest. Could be `const [ head, ...rest ] = all;` in later nodes
    const head = all[0]
    const rest = all.slice(1);
    const isDone = !all.length;
    // Either we're done and can call user provided cb, or we have to transmit via the timeouter
    const newCb = isDone ? cb : () => transmit(rest);

    return isDone ? newCb() : timeouter(newCb, head);

  }

  return transmit(translated);

};

module.exports = transmitter;
