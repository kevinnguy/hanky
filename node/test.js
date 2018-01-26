const Papa = require('papaparse');
const fs = require('fs');

const file = fs.readFileSync('./all.csv', 'utf8');
const { data, errors } = Papa.parse(
  file,
  { dynamicTyping: true, header: true },
);

const writeCoursesFile = data => {
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

writeCoursesFile(data);