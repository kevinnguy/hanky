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

  // sort student's courses by name
  courses.sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();

    if (titleA < titleB) {
      return -1;
    }

    if (titleA > titleB) {
      return 1;
    }

    return 0;
  });

  // sort course's grades chronologically
  courses.forEach(course => {
    course.grades.sort((a, b) => (
      b.year - a.year
    )).sort((a, b) => b.month - a.month);
  });

  // write file
  let fileString = `${name}\n\n`;
  courses.forEach(course => {
    fileString = `${fileString}\n\n${course.title}`;

    course.grades.forEach(grade => {
      fileString = `${fileString}\n  ${grade.value}  ${grade.creditCompleted}/${grade.creditAttempted}  ${grade.month < 10 ? `0${grade.month}` : grade.month}/${grade.year}`;
    })
  });

  const fileName = `${name.replace(/ /g,'_').replace(/[.,]/g,'')}.txt`;
  fs.writeFileSync(`${__dirname}/students/${fileName}`, fileString);
});
