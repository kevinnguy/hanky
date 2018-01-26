const Papa = require('papaparse');
const fs = require('fs');

const file = fs.readFileSync('./all.csv', 'utf8');
const { data, errors } = Papa.parse(
  file,
  { dynamicTyping: true, header: true },
);

const collegeCareer = [
  'COCA150',
  'COCA160',
  'COCA550',
  'COCA650',
  'COCA800A',
];

const electives = [
  'AIDE150',
  'AUTO950',
  'AUTO951',
  'CMCC650',
  'CMSC350',
  'CSPR350',
];

const english = [
  'AMLT150',
  'AMLT500',
  'CXWR150',
  'CXWR160',
  'ELDR101',
  'ELDR102',
  'ELDS101',
  'ELDS102',
  'ELDS103',
  'ENGL101',
  'ENGL151',
  'ENGL152',
  'ENGL161',
  'ENGL162',
  'ENGL163',
  'ENGL202',
  'ENGL350',
  'ENGL351',
  'ENGL501',
  'ENGL502',
  'EURO150',
  'EURO160',
  'EURO550',
];

const health = [
  'HLTH150',
  'HLTH160',
  'HLTH650',
  'HLTH800A',
];

const history = [
  'ADEM150',
  'ADEM160',
  'ADEM250',
  'ADEM550',
  'ECON150',
  'ECON160',
  'ECON351',
  'ECON550',
  'USHI150',
  'USHI160',
  'USHI350',
  'USHI550',
  'WHST150',
  'WHST160',
  'WHST250',
  'WHST550',
];

const ignore = [
  'ADVI150',
  'HMRM000',
  'HMRM050',
];

const language = [
  'CHIN151',
  'CHIN152',
  'CHIN153',
  'CHIN253',
  'CHIN350',
  'FREN151',
  'FREN152',
  'FREN253',
  'JAPN050',
  'JAPN151',
  'JAPN152',
  'JAPN253',
  'JAPN350',
  'SPAN050',
  'SPAN052',
  'SPAN151',
  'SPAN152',
  'SPAN153',
  'SPAN157',
  'SPAN253',
  'SPAN350',
  'SPAN551',
];

const math = [
  'ALGB151',
  'ALGC151',
  'ALGC152',
  'ALGC161',
  'ALGC162',
  'ALGC181',
  'ALGC551',
  'ALGC552',
  'ALGE162',
  'ALGE252',
  'ALGE551',
  'CALC350',
  'CALC351',
  'GEOC150',
  'GEOC160',
  'GEOC550',
  'GEOG150',
  'GEOM550',
  'PCAL150',
  'PCAL250',
  'STAT150',
  'STAT350',
];

const pe = [
  'BSKT150',
  'FTNS150',
  'JRDR150',
  'JRTC151',
  'JRTC152',
  'JRTC153',
  'JRTC154',
  'PEPE151',
  'PEPE152',
  'PEPE153',
  'PEPE155',
  'PEPE156',
  'WGHT150',
];

const science = [
  'ASTR150',
  'BIOL150',
  'BIOL160',
  'BIOL350',
  'BIOL551',
  'CHEM150',
  'CHEM160',
  'CHEM250',
  'CHEM350',
  'CHEM550',
  'ENSC350',
  'ENVS150',
  'ENVS160',
  'ENVS550',
  'MBIO150',
  'PHYC150',
  'PHYS150',
  'PHYS160',
  'PHYS354',
  'PHYS550',
];

const visual = [
  'ARTT150',
  'ARTT450',
  'BAND152',
  'BAND153',
  'CART151',
  'CART152',
  'CERA150',
  'CERA450',
  'DANC151',
  'DANC152',
  'DANC153',
  'DRAM152',
  'DRMA150',
  'MUSP150',
  'ORCH152',
  'ORCH153',
  'SING152',
  'SING153',
  'TECH151',
  'TECH152',
  'TECH153',
  'VIDO150',
];

const allCodes = [
  ...collegeCareer,
  ...electives,
  ...english,
  ...health,
  ...history,
  ...ignore,
  ...language,
  ...math,
  ...pe,
  ...science,
  ...visual,
];

const writeCoursesFile = data => {
  if (!data || !fs) {
    console.log('Cannot write courses file');
    return;
  }

  const courses = new Set();
  data.forEach(row => {
    const courseID = row['CourseID'];
    if (!allCodes.filter(code => code === courseID).length) {
      courses.add(courseID);
    }
  })

  fs.writeFileSync(`${__dirname}/sample.txt`, [...courses].sort().join('\n'));
}

writeCoursesFile(data);