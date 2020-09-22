import React, {Component} from 'react'
import {Button, Row, Col} from 'react-bootstrap';

var Loader = require('react-loader');

class FetchForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadingSubmission: false,
      submission: {
        
      }
    };
  }

  componentDidMount() {
    this.loadSubmissionById(this.props.match.params.id);
  }

  UNSAFE_componentWillMount() {
  }

  async loadSubmissionById(hashId) {
    this.setState({loadingSubmission: true, submission: {}});
    try {
      let submission = await this.loadSubmission(hashId);
      this.setState({loadingSubmission: false, submission: submission});
    }
    catch (err) {
      this.setState({loadingSubmission: false});
      this.props.addNotification(err.message, "error");
    }
  }

  loadSubmission(hashId) {
    return new Promise(async (resolve, reject) => {
      let submission = {};
      this.props.hashStoreContractInstance.getPaperByID(hashId).then( async (values) => {
        if (values[0] === "0x0000000000000000000000000000000000000000") {
          return reject(new Error("Paper no encontrado"));
        }

        submission.sender = values[0];
        submission.hashContent = values[1];
        submission.timestamp = values[2].toNumber();
        submission.hashId = hashId;
        this.props.ipfs.catJSON(submission.hashContent, async (err, data) => {
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

  renderSubmission(submission) {
    return (
      <div key={submission.hashId}>
        <Row>
        <Col>
        <h1>{submission.title}</h1>
        
        <div className="submission-authors">{submission.fullName}</div> 
        <div className="submission-date"><small className="text-muted">
            Publicado: {new Date(submission.timestamp*1000).toLocaleDateString('es-ES', 
            { year: 'numeric', month: 'long', day: 'numeric' })}</small></div>

        <p className="mt-3 submission-abstract">{submission.text}</p>

        <div className="submission-sender">
          <small className="text-muted">
          Enviado desde la Billetera: {submission.sender} <br/>
          Paper hash: {submission.hashContent} <br/>
          Archivo hash: <a className="submission-hash-content" target="_blank" rel="noopener noreferrer"
            href={`https://ipfs.infura.io:5001/api/v0/cat/${submission.file}`}>{submission.file}</a> <br/>
          </small>
        </div>
        </Col>
        <Col xs={3}>
          <div className="my-3">
          <Button href={"https://ipfs.infura.io:5001/api/v0/cat/"+submission.file} 
          className="mt-3 btn-side btn-read" variant="primary" size="dark">Visualizar</Button>
          </div>
        </Col>
        </Row>
      </div>
    );
  }

  updateHashId(e) {
    this.setState({'hashId': e.target.value});
  }

  render() {
    return (
      <div className="show-submission">
          <Loader loaded={!this.state.loadingSubmission}>
            {this.state.submission ? this.renderSubmission(this.state.submission) : null}
          </Loader>
      </div>
    );
  }
}

export default FetchForm;
