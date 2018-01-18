const Papa = require('papaparse');
const fs = require('fs');

const file = fs.readFileSync('./seniors.csv', 'utf8');

const { data, errors } = Papa.parse(
  file,
  { dynamicTyping: true, header: true },
);

const students = data.reduce((acc, value, currentIndex) => {
  const studentName = value['Name'];
  const currentStudent = acc.filter(student => student.name === studentName)[0];
  const course = {
    id: value['CourseID'],
    title: value['CourseTitle'],
    mark: value['Mark'],
    creditAttempted: value['CreditAttempted'],
    creditCompleted: value['CreditCompleted'],
    studentGrade: value['Grade'],
    month: value['Calendar Month'],
    year: value['Calendar Year'],
  };

  if (!currentStudent) {
    acc.push({
      name: studentName,
      courses: [course],
    });

    return acc;
  }

  // TODO: remove rows with no grade because class is in progress
  // TODO: remove rows with zero credit attempted

  currentStudent.courses.push(course);
  return acc;
}, []);

if (!fs.existsSync(`${__dirname}/students/`)){
    fs.mkdirSync(`${__dirname}/students/`);
}

students.forEach(student => {
  const { name, courses } = student;

  let fileString = `${name}\n\n`;
  // const ninthGradeRows = rows.filter(row => row['Grade'] === 9);
  courses.forEach(course => {
    fileString = `${fileString}\n${course.title}${course.mark.padStart(20 - course.title.length)}  ${course.creditCompleted}/${course.creditAttempted}`
  });

  const fileName = `${name.replace(/ /g,'_').replace(/[.,]/g,'')}.txt`;
  fs.writeFileSync(`${__dirname}/students/${fileName}`, fileString);
});
