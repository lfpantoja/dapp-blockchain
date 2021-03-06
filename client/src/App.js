import React, {Component} from 'react'
import HashStoreContract from './contracts/Publications.json'
import getWeb3 from './utils/getWeb3'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import {Container} from 'react-bootstrap';
import SubmitForm from './components/SubmitForm';
import RecentSubmissions from './components/RecentSubmissions';
import FetchForm from './components/FetchForm';
import SearchForm from './components/SearchForm';
import Header from './components/Header';
import './css/bootstrap.css';
import './App.css'

const contract = require('truffle-contract')

var NotificationSystem = require('react-notification-system');
var Loader = require('react-loader');

const IPFS = require('ipfs-mini');

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      submitFormDisplayed: false,
      fetchFormDisplayed: false,
      recentSubmissionsDisplayed: false,
      searchFormDisplayed: false,
    }
  }

  //definición del sistema de notificaciones en react
  addNotification(message, level) {
    this._notificationSystem.addNotification({
      message: message,
      level: level,
      position: "br"
    });
  }

  //funcion que se ejecuta al cargar pagina en el lado del cliente
  UNSAFE_componentWillMount() {
  }

  //funcion que se ejecuta al cargar pagina en el lado del servidor y el cliente
  componentDidMount() {
    this.setupWeb3((err) => {
      if (err) {
        return console.log(err);
      }
      this.instantiateContract();
    });
    this.setupIpfs();
    this._notificationSystem = this.refs.notificationSystem;
    this.addNotification("Bienvenido !", "success")
  }

  //Nos conectamos al metamask
  setupWeb3(cb) {
    this.setState({loadingWeb3: true,loadingContract:true,});
    getWeb3.then(results => {
      let web3 = results.web3;
      
      if (!web3) {
        return this.setState({
          loadingWeb3: false,
          loadingContract: false,
          network: "Unknown",
          web3: null
        });
      }
      
      let networkName;
      web3.eth.net.getNetworkType((err, networkId) => {
        switch (networkId) {
          case "main":
            networkName = "Main";
            break;
          case "morden":
            networkName = "Morden";
            break;
          case "ropsten":
            networkName = "Ropsten";
            break;
          case "rinkeby":
            networkName = "Rinkeby";
            break;
          case "kovan":
            networkName = "Kovan";
            break;
          default:
            networkName = "Unknown";
        }
        
        this.setState({
          loadingWeb3: false,
          web3: web3,
          networkName: networkName
        });
        cb();//es una funcion de node para retornar algun error
        console.log("Red: ",this.state.networkName);
      });
    }).catch((err) => {
      this.setState({loadingWeb3: false, loadingContract: false,});
      console.log('No se encuentra web3.', err.message);
    });
  }

  //definimos el protocolo ipfs
  setupIpfs() {
    const ipfs = new IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
    this.setState({ipfs: ipfs});
  }

  //instanciamos/cargamos contrato
  instantiateContract() {
    this.setState({loadingContract: true,});
    console.log("Cargando Contrato")
    const hashStoreContract = contract(HashStoreContract);
    hashStoreContract.setProvider(this.state.web3.currentProvider);
    
    hashStoreContract.deployed().then((hashStoreContractInstance) => {
      this.setState({hashStoreContractInstance});
      this.setState({loadingContract: false,});
    }).catch((err) => {
      this.setState({loadingContract: false,});
      this.addNotification(err.message, "error");
    });
  }

  //mensaje de error si no hay conexion de matamask con una red y cuando hay conexion
  //carga la página
  render() {
    let noNetworkError = (this.state.web3 ?
      <h3 className="no-network">Aplicacion de Prueba</h3> :
      <h3 className="no-network">Conectar con red Ethereum localhost:7545 - Metamask</h3>);

    return (
      <div className="App h-100">
        <Router>
        <NotificationSystem ref="notificationSystem"/>

        <Header web3={this.state.web3} loadingWeb3={this.state.loadingWeb3}/>
        
        <main className="flex-fill flex-shrink-0">
            <Container>
              <div className="content">
              <Loader loaded={!this.state.loadingWeb3 && !this.state.loadingContract}>
              {this.state.web3 && ["Unknown","Rinkeby"].includes(this.state.networkName) ?
              
                <Switch>
                <Route exact path={'/'} component={ (props) => <RecentSubmissions web3={this.state.web3} ipfs={this.state.ipfs}
                                    hashStoreContractInstance={this.state.hashStoreContractInstance}
                                    addNotification={this.addNotification.bind(this)} {...props}/>} />
                <Route path={'/submit/:id?'} component={ (props) => <SubmitForm web3={this.state.web3} ipfs={this.state.ipfs}
                                    hashStoreContractInstance={this.state.hashStoreContractInstance}
                                    addNotification={this.addNotification.bind(this)} {...props}/>} />
                <Route path={'/show/:id'} component={ (props) => <FetchForm web3={this.state.web3} ipfs={this.state.ipfs}
                                    hashStoreContractInstance={this.state.hashStoreContractInstance}
                                    addNotification={this.addNotification.bind(this)} {...props}/>} />
                <Route path={'/search'} component={ (props) => <SearchForm web3={this.state.web3} ipfs={this.state.ipfs}
                                    hashStoreContractInstance={this.state.hashStoreContractInstance}
                                    addNotification={this.addNotification.bind(this)} {...props}/>} />
                </Switch>
              :
              noNetworkError
            }
              </Loader>
              </div>
              </Container>
              </main>
          
        </Router>
      </div>
    );
  }
}

export default App
