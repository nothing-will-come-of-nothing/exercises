"use strict"

// 1. dot duration is the baseline timing measurement
const dot = 1;
// 2. dashes are timed as 3 dots
const dash = 3;
// 3. time between letters are 3 dots
const letterSpacing = 3;
// 4. time between words are 7 dots
const wordSpacing = 7;

const isSpace = (char) => char === ' ';
const isDot = (char) => char === '.';
// Reduce string via split chars and include end notifier (the length is only one less than index)
const reduceStringWithEndNotifier = (reducer, seed, stringToReduce) => {

  const chars = stringToReduce.split('');
  const len = stringToReduce.length;

  return chars.reduce((acc, char, index) => reducer(acc, char, index, index === len - 1), seed);

};

const parseCode = (codes, messageChar, needsLetterSpacing) => {

  // Get the codes for this char
  const code = codes[messageChar];

  return reduceStringWithEndNotifier(
    (acc, char, index, isEnd) => {

      // No matter what, we're going to add a dot or dash b/c we do have a valid codeChar
      const first = isDot(char) ? dot : dash;
      // As long as we aren't at end of letter, we can add dot spacing (same as dot itself)
      if (!isEnd)
        return acc.concat([ first, dot ]);

      if (needsLetterSpacing)
        return acc.concat([ first, letterSpacing ]);

      // We're done with either the word or the message as a whole
      return acc.concat([ first ]);

    },
    [],
    code
  );

};

const getTranslated = (codes, message) => {

  // Reduce message by each character
  return reduceStringWithEndNotifier(
    (acc, char, index, isEnd) => {

      // If the char is a space, we should should add the space between words
      if (isSpace(char))
        return acc.concat([ wordSpacing ]);

      // As long as we aren't at end of word or at end of message, we should add letter spacing
      const nextChar = message[index + 1];
      // These took a second, if it is not the last char of the message, then we may need to add
      // letter spacing, if not last of word, then letter spacing, and if not last code of letter,
      // then dot spacing
      const isNotLastOfWord = !isSpace(nextChar);
      const needsLetterSpacing = isNotLastOfWord && !isEnd;
      const newlyTranslatedChar = parseCode(codes, char, needsLetterSpacing);

      // Return the new things via concatenation
      return acc.concat(newlyTranslatedChar);

    },
    [],
    message
  );

};

const transmitter = (props, cb) => {

  // We don't have object destructure just yet
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
