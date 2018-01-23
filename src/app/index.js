import React, { Component } from 'react';
import Dropzone from 'react-dropzone'
import FileSaver from 'file-saver';
import JSZip from 'jszip';

import {
  csvFromData,
  graduationRequirementsFromStudents,
  readCategoryFile,
  studentsFromCSV,
} from '../helpers';

import logo from './logo.svg';
import './style.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isProcessing: false,
      isFinished: false,
      isActive: false,
    };
  }

  onDrop = ([ file ]) => {
    const reader = new FileReader();
    reader.readAsText(file);
  	reader.onload = event => {
      const data = event.target.result;
      const csv = csvFromData(data);
      this.saveGraduationRequirements(csv);
  	};

    this.setState({ isProcessing: true });
  }

  saveGraduationRequirements = csv => {
    const students = studentsFromCSV(csv);
    const graduationRequirements = graduationRequirementsFromStudents(students);
    const zip = new JSZip();

    graduationRequirements.forEach(student => (
      zip.file(
        `${student.name.replace(/ /g,'_').replace(/[.,]/g,'')}.txt`,
        student.file,
      )
    ));

    zip.generateAsync({ type:"blob" }).then(archive => {
      FileSaver.saveAs(archive, 'hanky.zip');
      this.setState({
        isFinished: true,
        isProcessing: false,
      });
    });
  }

  onDragEnter = () => {
    this.setState({ isActive: true });
  }

  onDragLeave = () => {
    this.setState({ isActive: false });
  }

  renderDropzone = (
    <div className='Dropzone-container'>
      <Dropzone
        className='Dropzone'
        onDrop={this.onDrop}
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave} />
    </div>
  )

  renderProcessing = (
    <p className="App-intro">
      {'Proccessing right now!'}
    </p>
  )

  render() {
    const { isProcessing, isFinished } = this.state;

    return (
      <div className="App">
        { isProcessing && !isFinished ? this.renderProcessing : this.renderDropzone }
        { isFinished && (
          <p className="App-intro">
            {'You GUCCI'}
          </p>
        )}
      </div>
    );
  }
}

export default App;

