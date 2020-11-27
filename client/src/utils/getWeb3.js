import Web3 from 'web3'

let getWeb3 = new Promise(function (resolve, reject) {
  // Espera de carga en inyeccion Web3
  window.addEventListener('load', function () {
    getAccount();
  });

  //Conexión al ganache y se escoge la cuenta que este seleccionada en el metamask
  async function getAccount() {
    let web3 = window.web3;
    if (typeof web3 !== 'undefined') {
      let provider = new Web3.providers.HttpProvider('http://192.168.1.10:7545');
      web3 = new Web3(provider);
      console.log('Usando web3 local.');
    }
    else {
      return reject(new Error('Web3 no inyectado.'));
    }
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    console.log("ac: ",account);

    web3.eth.defaultAccount = account;
    console.log('Usando cuenta principal: ', web3.eth.defaultAccount);
    
    resolve({web3: web3});
  }
  
  //SI hay un cambio de cuenta, se actualizará con la seleccionada
  window.ethereum.on('accountsChanged', function (accounts) {
    getAccount();
    window.location.reload(10000);
  });

});

export default getWeb3