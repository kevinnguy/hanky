const Papa = require('papaparse');
const fs = require('fs');
const isEqual = require('lodash/isEqual');

// make students directory
if (!fs.existsSync(`${__dirname}/students/`)){
    fs.mkdirSync(`${__dirname}/students/`);
}

// read and write file and directory
const file = fs.readFileSync('./seniors.csv', 'utf8');
const ignoreCategoryCodes = fs.readFileSync('./codes/ignore.txt', 'utf8').split('\n');

const courseCategories = {
  english: {
    codes: fs.readFileSync('./codes/english.txt', 'utf8').split('\n'),
    creditsTotal: 40,
    value: 'English',
  },
  history: {
    codes: fs.readFileSync('./codes/history_ss.txt', 'utf8').split('\n'),
    creditsTotal: 30,
    value: 'History/Social Sciences',
  },
  math: {
    codes: fs.readFileSync('./codes/math.txt', 'utf8').split('\n'),
    creditsTotal: 30,
    value: 'Mathematics',
  },
  science: {
    codes: fs.readFileSync('./codes/science.txt', 'utf8').split('\n'),
    creditsTotal: 20,
    value: 'Science',
  },
  language: {
    codes: fs.readFileSync('./codes/language.txt', 'utf8').split('\n'),
    creditsTotal: 20,
    value: 'World Language',
  },
  visual: {
    codes: fs.readFileSync('./codes/visual_pa.txt', 'utf8').split('\n'),
    creditsTotal: 10,
    value: 'Visual and Performing Arts',
  },
  pe: {
    codes: fs.readFileSync('./codes/pe.txt', 'utf8').split('\n'),
    creditsTotal: 20,
    value: 'Physical Education',
  },
  electives: {
    codes: fs.readFileSync('./codes/electives.txt', 'utf8').split('\n'),
    creditsTotal: 50,
    value: 'Electives',
  },
  collegeCareer: {
    codes: fs.readFileSync('./codes/college_career.txt', 'utf8').split('\n'),
    creditsTotal: 5,
    value: 'College Career',
  },
  health: {
    codes: fs.readFileSync('./codes/health.txt', 'utf8').split('\n'),
    creditsTotal: 5,
    value: 'Health Education',
  },
};
const courseCategoriesKeys = Object.keys(courseCategories);

// read csv
const { data, errors } = Papa.parse(
  file,
  { dynamicTyping: true, header: true },
);

const findCourseCategory = id => {
  let category = 'N/A';
  courseCategoriesKeys.forEach(selectedCategory => {
    const codes = courseCategories[selectedCategory].codes;
    if (codes.find(code => code === id)) {
      category = selectedCategory;
      return false;
    }
  });

  return category;
}

// create students array
const students = data.reduce((acc, value, currentIndex) => {
  const studentName = value['Name'];
  const student = acc.filter(
    selectedStudent => selectedStudent.name === studentName
  )[0];
  const course = {
    id: value['CourseID'],
    title: value['CourseTitle'],
    category: findCourseCategory(value['CourseID']),
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

  // sort student's courses by name and category
  courses.sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();
    return titleA > titleB ? 1 : -1;
  })
  // .sort((a, b) => {
  //   const indexA = courseCategoriesKeys.indexOf(a.category);
  //   const indexB = courseCategoriesKeys.indexOf(b.category);
  //   return indexA > indexB ? 1 : -1;
  // });

  // sort course's grades chronologically
  courses.forEach(course => {
    course.grades.sort((a, b) => (
      b.year - a.year
    )).sort((a, b) => b.month - a.month);
  });

  // write file
  let fileString = `${name}\n\n`;

  courseCategoriesKeys.forEach(key => {
    const category = courseCategories[key];
    const filteredCourses = courses.filter(course => course.category === key);
    const creditsCompleted = filteredCourses.reduce((acc, course) => {
      course.grades.forEach(grade => { acc = acc + grade.creditCompleted; });
      return acc;
    }, 0);

    const title = `${category.value}: ${creditsCompleted}/${category.creditsTotal}`;
    fileString = `${fileString}${title}\n${'='.repeat(title.length)}`;

    filteredCourses.forEach(course => {
      fileString = `${fileString}\n  ${course.title}`;

      course.grades.forEach(grade => {
        fileString = `${fileString}\n    ${grade.value}  ${grade.creditCompleted}/${grade.creditAttempted}  ${grade.month < 10 ? `0${grade.month}` : grade.month}/${grade.year}`;
      })
    });

    fileString = `${fileString}\n\n\n`
  });

  const fileName = `${name.replace(/ /g,'_').replace(/[.,]/g,'')}.txt`;
  fs.writeFileSync(`${__dirname}/students/${fileName}`, fileString);
});
