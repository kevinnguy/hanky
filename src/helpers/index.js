import Papa from 'papaparse';
import fs from 'fs';
import isEqual from 'lodash/isEqual';

// make students directory
const makeFileDirectory = directoryName => {
  const path = `${__dirname}/${directoryName}/`;
  if (!fs.existsSync(path)){
      fs.mkdirSync(path);
  }
}

const readFile = path => readFile(path, 'utf8')

// read and write file and directory
// const file = readFile('./seniors.csv');
// const ignoreCategoryCodes = readFile('./codes/ignore.txt').split('\n');

// const courseCategories = {
//   english: {
//     codes: readFile('./codes/english.txt').split('\n'),
//     creditsTotal: 40,
//     value: 'English',
//   },
//   history: {
//     codes: readFile('./codes/history_ss.txt').split('\n'),
//     creditsTotal: 30,
//     value: 'History/Social Sciences',
//   },
//   math: {
//     codes: readFile('./codes/math.txt').split('\n'),
//     creditsTotal: 30,
//     value: 'Mathematics',
//   },
//   science: {
//     codes: readFile('./codes/science.txt').split('\n'),
//     creditsTotal: 20,
//     value: 'Science',
//   },
//   language: {
//     codes: readFile('./codes/language.txt').split('\n'),
//     creditsTotal: 20,
//     value: 'World Language',
//   },
//   visual: {
//     codes: readFile('./codes/visual_pa.txt').split('\n'),
//     creditsTotal: 10,
//     value: 'Visual and Performing Arts',
//   },
//   pe: {
//     codes: readFile('./codes/pe.txt').split('\n'),
//     creditsTotal: 20,
//     value: 'Physical Education',
//   },
//   electives: {
//     codes: readFile('./codes/electives.txt').split('\n'),
//     creditsTotal: 50,
//     value: 'Electives',
//   },
//   collegeCareer: {
//     codes: readFile('./codes/college_career.txt').split('\n'),
//     creditsTotal: 5,
//     value: 'College Career',
//   },
//   health: {
//     codes: readFile('./codes/health.txt').split('\n'),
//     creditsTotal: 5,
//     value: 'Health Education',
//   },
//   notCategorized: {
//     codes: [],
//     creditsTotal: 0,
//     value: 'Not Categorized',
//   }
// };
// const courseCategoriesKeys = Object.keys(courseCategories);

// read csv
const csvFromFilePath = path => {
  const file = readFile(path);
  return Papa.parse(file, { dynamicTyping: true, header: true });
};

const findCourseCategory = ({ courseID, categories }) => {
  const keys = Object.keys(categories);

  let categoryType = 'notCategorized';
  keys.forEach(key => {
    const codes = categories[key].codes;
    if (codes.find(code => code === courseID)) {
      categoryType = key;
      return false;
    }
  });

  return categoryType;
}

const studentsFromCSV = csv => (
  csv.data.reduce((acc, value, currentIndex) => {
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

    // create student object and store it
    if (!student) {
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
  }, [])
);

const writeStudentsFile = ({
  students,
  destinationPath,
  categories,
}) => {
  const categoriesKeys = Object.keys(categories);

  students.forEach(student => {
    const { name, courses } = student;

    // sort student's courses by name and category
    courses.sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      return titleA > titleB ? 1 : -1;
    })

    // sort course's grades chronologically
    courses.forEach(course => {
      course.grades.sort((a, b) => (
        b.year - a.year
      )).sort((a, b) => b.month - a.month);
    });

    // write file
    let fileString = `${name}\n\n`;

    let extraElectiveCredits = [];

    categoriesKeys.forEach(key => {
      const category = categories[key];
      const filteredCourses = courses.filter(course => course.category === key);
      let creditsCompleted = filteredCourses.reduce((acc, course) => {
        course.grades.forEach(grade => { acc = acc + grade.creditCompleted; });
        return acc;
      }, 0);

      if (key === 'electives' && extraElectiveCredits.length) {
        creditsCompleted = creditsCompleted + extraElectiveCredits.reduce((acc, object) => {
          return acc + object.value;
        }, 0);
      }

      if (creditsCompleted > category.creditsTotal) {
        extraElectiveCredits.push({
          category,
          value: creditsCompleted - category.creditsTotal,
        });
      }

      const title = `${category.value}: ${creditsCompleted}/${category.creditsTotal}`;
      fileString = `${fileString}${title}\n${'='.repeat(title.length)}`;

      filteredCourses.forEach(course => {
        fileString = `${fileString}\n  ${course.title}`;

        course.grades.forEach(grade => {
          fileString = `${fileString}\n    ${grade.value}  ${grade.creditCompleted}/${grade.creditAttempted}  ${grade.month < 10 ? `0${grade.month}` : grade.month}/${grade.year}`;
        })
      });

      if (key === 'electives' && extraElectiveCredits.length) {
        fileString = `${fileString}\n  Extra Credits`;
        extraElectiveCredits.forEach(object => {
          fileString = `${fileString}\n    ${object.category.value}  ${object.value}`;
        })
      }

      fileString = `${fileString}\n\n\n`
    });

    const fileName = `${name.replace(/ /g,'_').replace(/[.,]/g,'')}.txt`;
    fs.writeFileSync(`${destinationPath}/${fileName}`, fileString);
  });
}

const writeCoursesFile = ({ csv, destinationPath }) => {
  const { data } = csv;
  if (!data) {
    console.log('Cannot write courses file');
    return;
  }

  const courses = new Set();
  data.forEach(row => {
    const courseID = row['CourseID'];
    courses.add(courseID);
  })

  fs.writeFileSync(`${destinationPath}/courses.txt`, [...courses].sort().join('\n'));
}

export {
  csvFromFilePath,
  studentsFromCSV,
  writeStudentsFile,
}