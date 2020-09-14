# Dapp Blockchain (Ubuntu LTS 20.04.1)

Este proyecto es una aplicación descentralizada (dapp) funcionando en una red Blockchain de Ethereum.

El proyecto permite:
- Usar la tecnología InterPlanetary File System (IPFS) para guardar texto.
- Guardar papers.

El contrato tiene un gasto de gas de 0.001 ETH

## Versiones de las herramientas usadas

-	Truffle 5.1.43
-	Solidity 0.5.16
-	React js 16.13.1
-	Ganache 2.4.0
-	NodeJS 10.22.0
-	Metamask for Firefox 8.0.9
-	IPFS 0.6.0

## Funcionamiento Local

### Instalación de Dependencias

1.	Instalar NodeJS

`curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -`

`sudo apt-get install -y nodejs`

También instalar

`apt-get install -y build-essential`

El paquete proporcionado por NodeSource's de NodeJS contiene Node y NPM, así que no se debe instalar NPM por separado.

2.	Descargar e ejecutar Ganache GUI de ([Web Oficial](https://github.com/trufflesuite/ganache/releases)), asegurarse de descargar la última versión de Ganache AppImage.

	(Para este proyecto se descargó  **ganache-2.4.0-linux-x86_64.AppImage**)

3.	Instalar Truffle Framework con

`npm install -g truffle`

4. Instalar la extensión de Metamask para el navegador Firefox ([Firefox ADD-ONS](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask))

5.	Instalar IPFS

`npm install ipfs`

### Desarrollo del Proyecto

1.	Crear el directorio para el proyecto, luego ir al directorio creado

`mkdir dapp-blockchain`

`cd dapp-blockchain`

2.	Para crear las carpetas predeterminadas

`truffle init`

3.	Configurar truffle-config.js para conectarse con ganache (Ver truffle-config.js).

4.	Codificar el contrato. (Ver dapp-blockchain/contracts/Publications.sol)

5.	Crear el directorio client para el lado del cliente y dentro del directorio, crear package.json este archivo ayudará a instalar las dependencias necesarias. (Ver dapp-blockchain/client/package.json)

6.	Codificar el lado del cliente con React. (Ver /dapp-blockchain/client)

7.	Después de codificar el lado del cliente, ir al directorio raíz	(dapp-blockchain) y ejecutar

`truffle compile`

`truffle migrate --network development`

8.	Luego, ir al directorio client (NPM tardará en instalar), y ejecutar 

`npm install`

`npm run start`

9.	En el navegador, seleccionar la red ganache usada en la extensión de Metamask y finalmente ir a la dirección `http://localhost:3000/`




















