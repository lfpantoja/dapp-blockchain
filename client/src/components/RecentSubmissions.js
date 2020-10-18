import React, {Component} from 'react'
import IntroJumbo from './Jumbotron';

var Loader = require('react-loader');

class RecentSubmissions extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      loadingRecentSubmissions:false,
      recentSubmissions: []
    };
  }

  //Funcion que se ejecutarpa en el lado del servidor y cliente
  UNSAFE_componentWillMount() {
    this.loadRecentSubmissions();
  }

  //Carga de los 10 papers recientes
  async loadRecentSubmissions() {
    this.setState({loadingRecentSubmissions: true, recentSubmissions: []});
    try {
      let recentSubmissions = [];
      let lastHashId = await this.props.hashStoreContractInstance.lastPaperId();
      lastHashId = lastHashId.toNumber();
      const startHashId = Math.max(1, lastHashId - 10);
      for (let i = lastHashId; i >= startHashId; i--) {
        let submission = await this.loadSubmission(i);
        recentSubmissions.push(submission);
      }
      this.setState({loadingRecentSubmissions: false, recentSubmissions: recentSubmissions});
    }
    catch (err) {
      this.setState({loadingRecentSubmissions: false});
      this.props.addNotification(err.message, "error");
    }
  }

  //Carga de paper en especifico por id
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

  //formato para impresión de paper
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

  //cuando termine de cargar los papers estos serán impresos en la página principal
  render() {
    return (
      <div>
        <IntroJumbo/>
        <div className="mt-2 latest-preprints">
          <center>
          <h3>Últimos Papers</h3>
          </center>
          <div className="submissions">
          <Loader loaded={!this.state.loadingRecentSubmissions}>
            {this.state.recentSubmissions.map((submission) => this.renderSubmission(submission))}
          </Loader>
          </div>
          </div>
      </div>
    );
  }
}

export default RecentSubmissions;
