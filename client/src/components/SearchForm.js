import React, {Component} from 'react'
import {Form, FormControl, Button, Alert, Row, Col} from 'react-bootstrap';

var Loader = require('react-loader');

class SearchForm extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      loadingSearchSubmissions:false,
      searchSubmissions: [],
      loadSearch:false,
      autor: ''
    };
    this.loadPaper = this.loadPaper.bind(this);
  }

  //Función para cargar los papers segun el autor ingresado por el usuario
  async loadSearchSubmissions(Autor) {
    let {autor} = this.state;
    console.log("parametro: ", Autor);
    
    this.setState({loadingSearchSubmissions: true, searchSubmissions: []});
    try {
      let searchSubmissions = [];
      let lastHashId = await this.props.hashStoreContractInstance.lastPaperId();
      lastHashId = lastHashId.toNumber();
      for (let i = 1; i <= lastHashId; i++) {
        let submission = await this.loadSubmission(i);
        if(Autor === submission.fullName){
            searchSubmissions.push(submission);
        }
      }
      this.setState({loadingSearchSubmissions: false, searchSubmissions: searchSubmissions});
      this.props.addNotification("Búsqueda completa", "success");
    }
    catch (err) {
      this.setState({loadingSearchSubmissions: false});
      this.props.addNotification(err.message, "error");
    }
  }

  //carga de paper
  loadSubmission(hashId) {
    return new Promise((resolve, reject) => {
      let submission = {};
      this.props.hashStoreContractInstance.getPaperByID(hashId).then((values) => {
        submission.sender = values[0];
        submission.hashContent = values[1];
        submission.timestamp = values[2].toNumber();
        submission.hashId = hashId;
        this.props.ipfs.catJSON(submission.hashContent, (err, data) => {
          if (err) {
            console.log(err);
            return resolve(submission);
          }

          submission.title = data.title;
          submission.text = data.text;
          submission.fullName = data.fullName;
          submission.file = data.file;
          resolve(submission);
        });
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  //Funcion para actualizar lo que esta en una caja de texto
  updateInputValue(e, field) {
    this.setState({[field]: e.target.value});
  }

  //Función para esperar a que se llene una caja de texto
  validForm() {
    if (!this.props.hashStoreContractInstance) {
      return false;
    }
    return this.state.autor;
  }

  //Carga de paper
  loadPaper(Autor) {
    this.setState({loadSearch: true});
    this.loadSearchSubmissions(Autor);
    this.setState({loadSearch: false});
  }

  //Formato de impresión de paper
  renderSubmission(submission) {
    return (
      <div className="submission" key={submission.hashId}>
          <h3><a href={"/show/"+submission.hashId} className="submission-id">{submission.title}</a></h3>
          <div className="submission-authors">{submission.fullName}</div> 
          <div className="submission-date"><small className="text-muted">
            Publicado: {new Date(submission.timestamp*1000).toLocaleDateString('es-ES', 
            { year: 'numeric', month: 'long', day: 'numeric' })}</small></div>
      </div>);
  }

  //interfaz de busqueda
  //se imprime título, cuadro de busqueda y botón para buscar
  //se imprime los papers
  render() {
    return (
      <div>
        <div>
            <Row>
            <Col xs={10}>
            <Form className="mt-3">
            <center>
            <h3>Búsqueda de Papers</h3>
            <Form.Group controlId="formGroupAuthors" className="mt-4">
            <FormControl required type = "text" onChange = {e => this.updateInputValue(e, 'autor')} 
                placeholder = "Autores" value={this.state.autor}/>
            </Form.Group>
            <Button 
            className="mt-3 pure-button pure-input-1-2 button-success"
            disabled={!this.validForm()} 
            onClick={
                () => this.loadPaper(this.state.autor)
            }
            >Buscar
            </Button>
            <div className="submissions">
            <Loader loaded={!this.state.loadingSearchSubmissions}>
                {this.state.searchSubmissions.map((submission) => this.renderSubmission(submission))}
            </Loader>
            </div>
            </center>
            </Form>
            
            </Col>
            </Row>
        </div>
        
        
      </div>
    );
  }
}

export default SearchForm;
