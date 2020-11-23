import React, {Component} from 'react'
import {Form, FormControl, Button, Row, Col} from 'react-bootstrap';

var Loader = require('react-loader');

class SearchForm extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      loadingSearchAll:false,
      loadingSearchSubmissions:false,
      searchSubmissions: [],
      loadSearch:false,
      parametro: ''
    };
    this.loadPaper = this.loadPaper.bind(this);
  }

  //Función para cargar los papers segun el autor ingresado por el usuario
  async loadSearchSubmissions(Autor) {
    console.log("parametro: ", Autor);
    this.setState({loadingSearchSubmissions: true, searchSubmissions: []});
    try {      
      let searchSubmissions = [];
      let lastHashId = await this.props.hashStoreContractInstance.lastPaperId();
      lastHashId = lastHashId.toNumber();
      for (let i = 1; i <= lastHashId; i++) {
        let submission = await this.loadSubmission(i);
        console.log("m: ",submission.fullName.search(Autor));
        if(submission.fullName.search(Autor) >= 0){
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

  //Función para cargar los papers segun el título ingresado por el usuario
  async loadSearchSubmissionsTitle(Titulo) {
    console.log("parametro T: ", Titulo);
    this.setState({loadingSearchSubmissions: true, searchSubmissions: []});
    try {      
      let searchSubmissions = [];
      let lastHashId = await this.props.hashStoreContractInstance.lastPaperId();
      lastHashId = lastHashId.toNumber();
      for (let i = 1; i <= lastHashId; i++) {
        let submission = await this.loadSubmission(i);
        console.log("m: ",submission.title.search(Titulo));
        if(submission.title.search(Titulo) >= 0){
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
    this.setState({loadSearchAll: true});
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
          this.setState({loadSearchAll: false});
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
    return this.state.parametro;
  }

  //Carga de paper
  loadPaper(Autor) {
    this.setState({loadSearch: true});
    //this.setState({loadSearchAll: true});
    this.loadSearchSubmissions(Autor);
    this.setState({loadSearch: false});
    //this.setState({loadSearchAll: false});
  }

  loadPaperTitulo(Titulo) {
    this.setState({loadSearch: true});
    //this.setState({loadSearchAll: true});
    this.loadSearchSubmissionsTitle(Titulo);
    this.setState({loadSearch: false});
    //this.setState({loadSearchAll: false});
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
            <h3>Búsqueda de Artículos</h3>
            <Form.Group controlId="formGroupAuthors" className="mt-4">
            <FormControl required type = "text" onChange = {e => this.updateInputValue(e, 'parametro')} 
                placeholder = "Autores o Título" value={this.state.parametro}/>
            </Form.Group>
            <Button 
            className="mt-3 pure-button pure-input-1-2 button-success"
            disabled={!this.validForm()} 
            onClick={
                () => this.loadPaper(this.state.parametro)
            }
            >Buscar por Autor
            </Button>
            
            <Button 
            className="mt-3 pure-button pure-input-1-2 button-success"
            disabled={!this.validForm()} 
            onClick={
                () => this.loadPaperTitulo(this.state.parametro)
            }
            >Buscar por Título
            </Button>
            <div className="submissions">
            <Loader loaded={!this.state.loadingSearchSubmissions && !this.state.loadingSearchAll}>
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
