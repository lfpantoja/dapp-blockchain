pragma solidity >=0.4.22 <0.8.0;

contract Publications {

    //Eventos
    event NewPaperStored(address indexed _hashSender, uint _hashId, string _hashContent, uint timestamp);

    //Estructura
    struct Paper {
        // Direccion del remitente
        address sender;
        // Hash del Texto
        string content;
        // Creacion de variable de tiempo
        uint timestamp;
        // other versions
        uint[] versions;
    }

    // Mapeo de Papers
    mapping(uint => Paper) public papers;
    // Dueno de Contrato
    address public owner;
    // Ultimo HashId de Paper guardado
    uint public lastPaperId;
    // Precio del servicio en Wei
    uint public price;

    //Modificadores
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    //Funciones publicas
    /**
    * @dev Constructor de Contrato
    * @param _price Service precio
    */
    constructor(uint _price) public {
        // verificar si el precio es valido
        require(_price > 0);

        // Asignacion de dueno
        owner = msg.sender;
        // Asignacion de precio
        price = _price;
        // inicializacion de id de ultimo paper
        lastPaperId = 0;
    }

    /**
    * @dev savePaper - Guardar paper
    * @param _hashContent Contenido Hash
    */
    function savePaper(string memory _hashContent) private returns (uint _paperId) {
        // crear Hash
        uint paperId = ++lastPaperId;
        papers[paperId].sender = msg.sender;
        papers[paperId].content = _hashContent;
        papers[paperId].timestamp = block.timestamp;
        papers[paperId].versions.push(paperId);

        return(paperId);
    }

    /**
    * @dev saveNewPaper - guardar Nuevo Paper
    * @param _hashContent Hash Contenido
    */
    function saveNewPaper(string memory _hashContent) payable public {
        // Solo se guarda si se pagó el servicio
        require(msg.value >= price);
        
        // crear Hash
        uint paperId = savePaper(_hashContent);
        // Log
        emit NewPaperStored(papers[paperId].sender, paperId, papers[paperId].content, papers[paperId].timestamp);
    }

    /**
    * @dev Encontrar paper por Id
    * @param _id Hash Id
    */
    function getPaperByID(uint _id) view public returns (address hashSender, string memory hashContent, uint hashTimestamp, uint hashNumVersions) {   
        return (papers[_id].sender,papers[_id].content, papers[_id].timestamp,papers[_id].versions.length); 
    }

    /**
    * @dev Obtener el ultimo paper
    */
    function getLastPaperId() public view returns (uint _lastPaperId) {
        return lastPaperId;
    }

}
