const Papa = require('papaparse');
const fs = require('fs');
const { removeDuplicates } = require('./helpers');

const file = fs.readFileSync('./seniors.csv', 'utf8');

const { data, errors } = Papa.parse(
  file,
  { dynamicTyping: true, header: true },
);

const students = data.reduce((
  acc,
  value,
  currentIndex,
  // array
) => {
  if (currentIndex === 1) { // currentIndex starts at 1 without initialValue
    return [{
      name: acc['Name'],
      rows: [acc],
    }];
  }

  const lastStudent = acc[acc.length - 1];

  if (lastStudent.name !== value['Name']) {
    acc.push({
      name: value['Name'],
      rows: [value],
    });

    return acc;
  }

  // TODO: remove rows with no grade because class is in progress
  // TODO: check for duplicate rows

  lastStudent.rows.push(value);
  return acc;
});

if (!fs.existsSync(`${__dirname}/students/`)){
    fs.mkdirSync(`${__dirname}/students/`);
}

students.forEach(student => {
  const { name } = student;
  const rows = removeDuplicates(student.rows);

  let fileString = `${name}\n\n9th Grade`;
  // const ninthGradeRows = rows.filter(row => row['Grade'] === 9);
  rows.forEach(row => {
    fileString = `${fileString}\n${row['Course Title']} - Grade: ${row['Mark']} Credit: ${row['GenericField1']}/${row['GenericField2']}`
  });

  fs.writeFileSync(`${__dirname}/students/${name}txt`, fileString);
})

