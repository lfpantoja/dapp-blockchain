import React, { Component } from 'react';
import { LinkContainer } from 'react-router-bootstrap'
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

class Header extends Component{
    render() {
        return (
            <header>
                <Navbar bg="primary" variant="dark" expand="lg">
                
                <Navbar.Collapse id="basic-navbar-nav">
                    
                    <Nav className="mx-auto">
                    <LinkContainer to="/">
                    <Nav.Link to="/">Inicio</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/submit">
                    <Nav.Link to="/submit">Registrar</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/search">
                    <Nav.Link to="/search">Buscar</Nav.Link>
                    </LinkContainer>
                    </Nav>
                    
                </Navbar.Collapse>
                </Navbar>        
            </header>
        )
    }
}

export default Header;