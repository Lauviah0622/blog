const flatten = (arr) => (Array.isArray(arr) ? arr.flatMap(flatten) : [arr]);

const css = (...classNameList) =>
  flatten(classNameList)
    .filter((className) => !!className)
    .join(' ');

export default css;
