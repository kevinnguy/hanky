const removeDuplicates = array => (
  array.filter((elem, pos, arr) => arr.indexOf(elem) == pos)
);

const writeCoursesFile = ({ data, fs }) => {
  if (!data || !fs) {
    console.log('Cannot write courses file');
    return;
  }

  const courses = new Set();
  data.forEach(row => {
    const courseID = row['CourseID'];
    courses.add(courseID);
  })

  fs.writeFileSync(`${__dirname}/sample.txt`, [...courses].sort().join('\n'));
}

module.exports = {
  removeDuplicates,
  writeCoursesFile,
};