import Web3 from 'web3'

let getWeb3 = new Promise(function (resolve, reject) {
  // Espera de carga en inyeccion Web3
  window.addEventListener('load', function () {
    let web3 = window.web3;

    // Comprobacion si Web3 fue inyectado (Mist/MetaMask)
    // Seteo de red Metamas
    if (typeof web3 !== 'undefined') {
      let provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(provider);
      console.log('Usando web3 local.');
    }
    else {
      return reject(new Error('Web3 no inyectado.'));
    }

    web3.eth.getAccounts((err, accounts) => {
      if (err) {
        return reject(err);
      }

      web3.eth.defaultAccount = accounts[0];
      console.log('Usando cuenta: ', web3.eth.defaultAccount);
      resolve({web3: web3});
    });
  });
});

export default getWeb3