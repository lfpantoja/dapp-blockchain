import React, {Component} from 'react'
import {Form, FormControl, Button, Alert, Row, Col} from 'react-bootstrap';


var Loader = require('react-loader');
let ax = [];  //variable para cargar papers ingresados y evitar duplicidad

class SubmitForm extends Component {
  constructor(props) {
    super(props);
    this.getPaperS = this.getPaperS.bind(this);
    this.state = {
      loadingAll: false,
      loadingPrice: false,
      fullName: '',
      title: '',
      text: '',
      price: ''
    };
  }

  //Función que se ejecuta en parte del cliente y servidor
  UNSAFE_componentWillMount() {
    this.loadPrice();
  }

  //Carga de papers para comparar
  async getPaperS() {
    let submissionAux = {};
    let numA = 0;
    this.setState({loadingAll: true});
    await this.props.hashStoreContractInstance.getLastPaperId().then((values) => {
      for(let i = 1;i<=values.words[0];i++){
        numA = values.words[0];
        this.props.hashStoreContractInstance.getPaperByID(i).then(async (values) => {
          submissionAux.hashContent = values[1];
          await this.props.ipfs.catJSON(submissionAux.hashContent, async (err, dataAux) => {
            ax.push(dataAux.title);
            console.log(ax.length);
            if(i===numA){
              this.props.addNotification("Carga Completa", "success");
              this.setState({loadingAll: false});
            }
          });
        });
      }
    });
    this.setState({loadingAll: false});
  }

  //carga de precio
  loadPrice() {
    ax = [];
    console.log(this.props);
    this.getPaperS();
    this.props.hashStoreContractInstance.price().then((result) => { 
      this.setState({price: result.toString()});
      }
    );
  }

  //Se carga archivo desde el navegador
  captureFile =(event) => {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => this.convertToBuffer(reader)
  };

  //Convertir archivo a buffer para guardar con IPFS
  convertToBuffer = async(reader) => {
    const buffer = await Buffer.from(reader.result);
    //Buffer usando sintaxis es6 
    this.setState({buffer});
  };

  //Funcion para guardar paper
  saveText() {
    let {fullName, title, text} = this.state;
    let data = {fullName, title, text};
    let {buffer} = this.state;
    let submissionAux = {};
    let auxRep = 0;
    
    this.setState({savingText: true});

    this.props.ipfs.add(buffer, (err, fileHash) => {
      if (err) {
        this.setState({savingText: false});
        return this.props.addNotification(err.message, "error");
      }
      data.file=fileHash;
      console.log("IPFS hash:", fileHash);
      //Se crea JSON par guardarlo con ipfs
      this.props.ipfs.addJSON(data, (err, hash) => {
        if (err) {
          this.setState({savingText: false});
          return this.props.addNotification(err.message, "error");
        }

        console.log("Se guardo IPFS", data);
        console.log("IPFS hash:", hash);
        console.log("Direccion eth:", this.props.web3.eth.defaultAccount);
        console.log("Direccion eth:", this.props.hashStoreContractInstance);
        
        //se guarde paper de inmediato cuando sea vacio
        if(ax.length === 0){
          this.props.hashStoreContractInstance.saveNewPaper(this.state.title, this.state.fullName, this.state.text, fileHash, hash, {from: this.props.web3.eth.defaultAccount, value: this.state.price, gas: 200000}).then((result) => {
            this.setState({savingText: false});
            console.log('Paper guardado, Tx:', result.tx);
            let log = result.logs[0];
            let hashId = log.args._hashId.toNumber();
            this.props.addNotification(`Artículo guardado! Paper ID: ${hashId}`, "success");
            
            window.location.reload(10000);
          }).catch((err) => {
            this.setState({savingText: false});
            this.props.addNotification(err.message, "error");
          });
        }else{
        //compara lo ingresado con cada paper cargado y lo guardara si no hay repetidos
        for(let aa=1;aa<=ax.length;aa++){
        //Comprobacion de Paper duplicado
        this.props.hashStoreContractInstance.getPaperByID(aa).then(async (values) => {
          submissionAux.hashContent = values[1];
          await this.props.ipfs.catJSON(submissionAux.hashContent, async (err, dataAux) => {
          if(ax.length === 0){
            
          }else{
            submissionAux.title = dataAux.title;
            if (submissionAux.title === data.title){
              auxRep = auxRep + 1;
              console.log("PAPER REPETIDO");
              this.setState({savingText: false});
              this.props.addNotification("Artículo Repetido","error");
            }else{
              //cuando se acabe el for y no haya repetidos se guardara
              if(auxRep<1 && aa===ax.length){
                console.log("Start");
                //Si no hay duplicados se ingresa paper
                await this.props.hashStoreContractInstance.saveNewPaper(this.state.title, this.state.fullName, this.state.text, fileHash, hash, {from: this.props.web3.eth.defaultAccount, value: this.state.price, gas: 200000}).then((result) => {
                  this.setState({savingText: false});
                  console.log('Paper guardado, Tx:', result.tx);
                  let log = result.logs[0];
                  let hashId = log.args._hashId.toNumber();
                  this.props.addNotification(`Artículo guardado ! Paper ID: ${hashId}`, "success");
                  
                }).catch((err) => {
                  this.setState({savingText: false});
                  this.props.addNotification(err.message, "error");
                });
                window.location.reload(10000);
              }else{
                console.log("PAPER REPETIDO x");
                this.setState({savingText: false});
              }
            }
          }
          });
        });
      }}
      });
    });
  }

  updateInputValue(e, field) {
    this.setState({[field]: e.target.value});
  }

  validForm() {
    if (!this.props.hashStoreContractInstance) {
      return false;
    }
    return this.state.fullName && this.state.title && this.state.text && this.state.buffer;
  }

  render() {
    return (
      <div className="SubmitForm">
      <center>
        <Loader loaded={!this.state.savingText}>
          {this.props.match.params.id && !this.state.submission ? (
            <Alert variant="danger">
            ERROR: Paper ID {this.props.match.params.id} no encontrado
            Este es un formulario de ingreso más no de búsqueda.
          </Alert>
          ) : ( 
          <div>
            
        <Row>
          <Col xs={10}>
        <Form className="mt-3">
        <Form.Group controlId="formGroupTitle" className="mt-3">
        <FormControl required type = "text" onChange = {e => this.updateInputValue(e, 'title')} 
              placeholder = "Titulo" value={this.state.title}/>
        </Form.Group>
        <Form.Group controlId="formGroupAuthors" className="mt-4">
        <FormControl required type = "text" onChange = {e => this.updateInputValue(e, 'fullName')} 
              placeholder = "Autores" value={this.state.fullName}/>
        </Form.Group>
        <Form.Group controlId="formGroupAbstract" className="mt-4">
        <FormControl required as = "textarea" onChange = {e => this.updateInputValue(e, 'text')} 
              placeholder = "Resumen" value={this.state.text} rows="10"/>
        </Form.Group>
        <Form.Group controlId="formGroupFile" className="my-4">
          <FormControl required           
            type = "file"
            onChange = {this.captureFile}
          />
          </Form.Group>
          
          <div><small>Precio por Paper: {this.props.web3.utils.fromWei(this.state.price, 'ether')} ETH</small></div>
          <Loader loaded={!this.state.savingText }>
          <Button
            type="submit" className="mt-3 pure-button pure-input-1-2 button-success"
            disabled={!this.validForm() || this.state.savingText || this.state.loadingAll} 
            onClick={() => this.saveText()}>
              Subir         
          </Button>
          </Loader>
      
        </Form>
        </Col>
        </Row>
        </div>
          )
       }
        </Loader>
        </center>  
      </div>
    );
  }
}

export default SubmitForm;
