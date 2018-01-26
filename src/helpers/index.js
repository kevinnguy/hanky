import Papa from 'papaparse';
import FileSaver from 'file-saver';
import JSZip from 'jszip';
import isEqual from 'lodash/isEqual';

import courseIDs from '../constants/courseIDs';

const courseCategories = {
  english: {
    codes: courseIDs.english,
    creditsTotal: 40,
    value: 'English',
  },
  history: {
    codes: courseIDs.history,
    creditsTotal: 30,
    value: 'History/Social Sciences',
  },
  math: {
    codes: courseIDs.math,
    creditsTotal: 30,
    value: 'Mathematics',
  },
  science: {
    codes: courseIDs.science,
    creditsTotal: 20,
    value: 'Science',
  },
  language: {
    codes: courseIDs.language,
    creditsTotal: 20,
    value: 'World Language',
  },
  visual: {
    codes: courseIDs.visual,
    creditsTotal: 10,
    value: 'Visual and Performing Arts',
  },
  pe: {
    codes: courseIDs.pe,
    creditsTotal: 20,
    value: 'Physical Education',
  },
  electives: {
    codes: courseIDs.electives,
    creditsTotal: 50,
    value: 'Electives',
  },
  collegeCareer: {
    codes: courseIDs.collegeCareer,
    creditsTotal: 5,
    value: 'College Career',
  },
  health: {
    codes: courseIDs.health,
    creditsTotal: 5,
    value: 'Health Education',
  },
  notCategorized: {
    codes: [],
    creditsTotal: 0,
    value: 'Not Categorized',
  }
};

const csvFromData = data => Papa.parse(
  data,
  { dynamicTyping: true, header: true },
);

const findCourseCategory = courseID => {
  const keys = Object.keys(courseCategories);

  let categoryType = 'notCategorized';
  keys.forEach(key => {
    const codes = courseCategories[key].codes;
    if (codes.find(code => code === courseID)) {
      categoryType = key;
      return false;
    }
  });

  return categoryType;
}

const studentsFromCSV = csv => (
  csv.data.reduce((acc, value, currentIndex) => {
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

    const studentName = value['Name'];
    const student = acc.filter(
      selectedStudent => selectedStudent.name === studentName
    )[0];
    const course = {
      id: value['CourseID'],
      title: value['CourseTitle'],
      category: findCourseCategory(value['CourseID']),
    };

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

const graduationRequirementsFromStudents = students => {
  const categoriesKeys = Object.keys(courseCategories);
  const sortCourses = courses => {
    courses.sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      return titleA > titleB ? 1 : -1;
    });

    courses.forEach(course => {
      course.grades.sort((a, b) => (
        b.year - a.year
      )).sort((a, b) => b.month - a.month);
    });
  }

  return students.map(student => {
    const { name, courses } = student;
    sortCourses(courses);

    // write file
    let file = `${name}\n\n`;
    let extraElectiveCredits = [];

    categoriesKeys.forEach(key => {
      const category = courseCategories[key];
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
      file = `${file}${title}\n${'='.repeat(title.length)}`;

      filteredCourses.forEach(course => {
        file = `${file}\n  ${course.title}`;

        course.grades.forEach(grade => {
          file = `${file}\n    ${grade.value}  ${grade.creditCompleted}/${grade.creditAttempted}  ${grade.month < 10 ? `0${grade.month}` : grade.month}/${grade.year}`;
        })
      });

      if (key === 'electives' && extraElectiveCredits.length) {
        file = `${file}\n  Extra Credits`;
        extraElectiveCredits.forEach(object => {
          file = `${file}\n    ${object.category.value}  ${object.value}`;
        })
      }

      file = `${file}\n\n\n`;
    });

    return {
      courses,
      file,
      name,
    };
  });
}

export {
  courseCategories,
  csvFromData,
  graduationRequirementsFromStudents,
  studentsFromCSV,
}