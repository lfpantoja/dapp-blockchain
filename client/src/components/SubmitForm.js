import React, {Component} from 'react'
import {Form, FormControl, Button, Alert, Row, Col} from 'react-bootstrap';

var Loader = require('react-loader');

class SubmitForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadingPrice: false,
      fullName: '',
      title: '',
      text: '',
      price: ''
    };
  }

  componentDidMount() {
    if (this.props.match.params.id) {
      this.loadSubmission(this.props.match.params.id);
    }
  }

  UNSAFE_componentWillMount() {
    this.loadPrice();
  }

  loadSubmission(hashId) {
    return new Promise((resolve, reject) => {
      
      let submission = {};
      this.props.hashStoreContractInstance.getPaperByID(hashId).then((values) => {
        submission.sender = values[0];
        submission.hashContent = values[1];
        submission.timestamp = values[2].toNumber();
        submission.hashId = hashId;
        if (submission.timestamp === 0) {
          this.props.addNotification("Paper inexsistente", "error");
          return reject("NO se encuentra paper")
        }
        this.setState({submission: submission});
        resolve(submission);
      }).catch((err) => {
        
        return reject(err);
      });
    });
  }

  loadPrice() {
    console.log(this.props);
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

  saveText() {
    let {fullName, title, text} = this.state;
    let data = {fullName, title, text};
    let {buffer} = this.state;

    this.setState({savingText: true});

    this.props.ipfs.add(buffer, (err, fileHash) => {
      if (err) {
        this.setState({savingText: false});
        return this.props.addNotification(err.message, "error");
      }
      data.file=fileHash;
      console.log("IPFS hash:", fileHash);

      this.props.ipfs.addJSON(data, (err, hash) => {
        if (err) {
          this.setState({savingText: false});
          return this.props.addNotification(err.message, "error");
        }

        console.log("Se guardo IPFS", data);
        console.log("IPFS hash:", hash);
        console.log("Direccion eth:", this.props.web3.eth.defaultAccount);
        console.log("Direccion eth:", this.props.hashStoreContractInstance);

        this.props.hashStoreContractInstance.saveNewPaper(hash, {from: this.props.web3.eth.defaultAccount, value: this.state.price, gas: 200000}).then((result) => {

          this.setState({savingText: false});
          console.log('Paper guardado, Tx:', result.tx);
          let log = result.logs[0];
          let hashId = log.args._hashId.toNumber();
          this.props.addNotification(`Paper guardado ! Paper ID: ${hashId}`, "success");

        }).catch((err) => {
          this.setState({savingText: false});
          this.props.addNotification(err.message, "error");
        });
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
        <Loader loaded={!this.state.loadingVersion}>
          {this.props.match.params.id && !this.state.submission ? (
            <Alert variant="danger">
            ERROR: Paper ID {this.props.match.params.id} no encontrado.
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
          <Loader loaded={!this.state.savingText}>
          <Button
            type="submit" className="mt-3 pure-button pure-input-1-2 button-success"
            disabled={!this.validForm() || this.state.savingText} 
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
