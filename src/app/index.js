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

  onClickRestart = () => {
    this.setState({ isFinished: false, isProcessing: false });
  }

  renderDropzone = (
    <Dropzone
      className='container table border-blue'
      onDrop={this.onDrop}
      onDragEnter={this.onDragEnter}
      onDragLeave={this.onDragLeave}>
      <div className='table-cells'>
        <p className='emoji'>{'📋'}</p>
        <p className='Dropzone-text'>{'Drop CSV file'}</p>
      </div>
    </Dropzone>
  )

  renderProcessing = (
    <div className='container table'>
      <div className='table-cells'>
        <p className='emoji'>{'🤔'}</p>
        <p className='text'>{'Processing CSV File'}</p>
      </div>
    </div>
  )

  renderFinished = (
    <div className='container table'>
      <div className='table-cells'>
        <p className='emoji'>{'🙌'}</p>
        <p className='text'>{'Finished!'}</p>
        <div
          className='button'
          onClick={this.onClickRestart}>
          {'Add another CSV'}
        </div>
      </div>
    </div>
  )

  render() {
    const { isProcessing, isFinished } = this.state;

    let component = this.renderDropzone;
    if (isProcessing) {
      component = this.renderProcessing;
    } else if (isFinished) {
      component = this.renderFinished;
    }

    return (
      <div className='App'>
        { component }
      </div>
    );
  }
}

export default App;

