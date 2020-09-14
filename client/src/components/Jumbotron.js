import React, {Component} from 'react'
import {Jumbotron} from 'react-bootstrap';
import '../App.css'
import '../css/bootstrap.css';

class IntroJumbo extends Component {
  render() {
    return (
      <Jumbotron>
        <center>
        <h3>Publicaciones Científicas</h3>
        </center>
        <p className="lead"> Propuesta para un modelo de sistematización en la gestión de 
        derechos de autor aplicando Smart Contracts sobre una plataforma Blockchain, para 
        publicaciones científicas. </p>
      </Jumbotron>
    );
  }
}

export default IntroJumbo
