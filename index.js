const Papa = require('papaparse');
const fs = require('fs');
const isEqual = require('lodash/isEqual');

// read and write file and directory
const file = fs.readFileSync('./seniors.csv', 'utf8');
if (!fs.existsSync(`${__dirname}/students/`)){
    fs.mkdirSync(`${__dirname}/students/`);
}

// read csv
const { data, errors } = Papa.parse(
  file,
  { dynamicTyping: true, header: true },
);

// create students array
const students = data.reduce((acc, value, currentIndex) => {
  const studentName = value['Name'];
  const student = acc.filter(
    selectedStudent => selectedStudent.name === studentName
  )[0];
  const course = {
    id: value['CourseID'],
    title: value['CourseTitle'],
  };
  const grade = {
    value: value['Mark'],
    creditAttempted: value['CreditAttempted'],
    creditCompleted: value['CreditCompleted'],
    studentGrade: value['Grade'],
    month: value['Calendar Month'],
    year: value['Calendar Year'],
  }

  if (
    !grade.value || // no grade because class is in progress
    grade.creditAttempted === 0 // zero credit is not needed
  ) {
    return acc;
  }

  if (!student) {
    // create student object and store it
    course.grades = [grade];
    acc.push({
      name: studentName,
      courses: [course],
    });

    return acc;
  }

  let duplicateCourse = false;
  student.courses.forEach(selectedCourse => {
    if (selectedCourse.id === course.id) {
      duplicateCourse = true;

      let duplicateGrade = false;
      selectedCourse.grades.forEach(selectedGrade => {
        if (isEqual(selectedGrade, grade)) {
          duplicateGrade = true;
          return false;
        }
      });

      if (!duplicateGrade) {
        selectedCourse.grades.push(grade);
      }
    }
  });

  if (!duplicateCourse) {
    course.grades = [grade];
    student.courses.push(course);
  }

  return acc;
}, []);

// create student txt files
students.forEach(student => {
  const { name, courses } = student;

  // sort student's courses



  // write file
  let fileString = `${name}\n\n`;
  courses.forEach(course => {
    // fileString = `${fileString}${course.title}${course.mark.padStart(20 - course.title.length)}  ${course.creditCompleted}/${course.creditAttempted}`
    fileString = `${fileString}\n\n${JSON.stringify(course, undefined, 2)}`;
  });

  const fileName = `${name.replace(/ /g,'_').replace(/[.,]/g,'')}.txt`;
  fs.writeFileSync(`${__dirname}/students/${fileName}`, fileString);
});
