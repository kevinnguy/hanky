const removeDuplicates = array => (
  array.filter((elem, pos, arr) => arr.indexOf(elem) == pos)
);

module.exports = {
  removeDuplicates,
};