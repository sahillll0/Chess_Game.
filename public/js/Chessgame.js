 const socket = io();
 const chess = new Chess(); 
 const boardElement = document.querySelector(".chessboard");

 let draggdPiece = null;
 let sourceSquare = null;
 let playerRole = null;

 const renderBoead = ()=>{
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row , rowindex) =>{
        row.forEach((square , squareindex)=>{
            const squareElement = document.createElement('div');
            squareElement.classList.add("square",
            (rowindex + squareindex) % 2 === 0 ? "light" : "dark");

            squareElement.dataset.row= rowindex;
            squareElement.dataset.col = squareindex;

            if(square){
               const pieceElement = document.createElement('div');
               pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
               pieceElement.innerText = getPiceUnicode(square);
               pieceElement.draggable = playerRole === square.color;
               pieceElement.draggable = true;

               pieceElement.addEventListener("dragstart", (e)=>{
                if(pieceElement.draggable){
                    draggdPiece = pieceElement;
                    sourceSquare ={row: rowindex , col: squareindex};
                    e.dataTransfer.setData("text/plain" , "");
                }
               })

               pieceElement.addEventListener('dragend', (e)=>{
                draggdPiece = null;
                sourceSquare = null;
               })

               squareElement.appendChild(pieceElement);
            }
            
            squareElement.addEventListener("dragover",(e)=>{
              e.preventDefault();
            })

             squareElement.addEventListener("drop",(e)=>{
              e.preventDefault();
              if(draggdPiece){
                const targetSource = {
                    row: parseInt(squareElement.dataset.row),
                    col: parseInt(squareElement.dataset.col),
                }

                handelMove(sourceSquare , targetSource)
              };
            })
            boardElement.appendChild(squareElement);
        })

    })

    if(playerRole === "b"){
        boardElement.classList.add("flipped");
    } else {
        boardElement.classList.remove("flipped");
    }
    
 };

 const handelMove = (source , target)=>{
    const move ={
        from : `${String.fromCharCode(97+source.col)}${8- source.row}` ,
        to : `${String.fromCharCode(97+target.col)}${8- target.row}` ,
        promotion: 'q'
    }

    socket.emit("move", move)

 };

 const getPiceUnicode = (piece)=>{
    const unicodePieces ={
         K: "♔",  // King
        Q: "♕",  // Queen
        R: "♖",  // Rook
        B: "♗",  // Bishop
        N: "♘",  // Knight
        P: "♙",  // Pawn
        k: "♚",  // King
        q: "♛",  // Queen
        r: "♜",  // Rook
        b: "♝",  // Bishop
        n: "♞",  // Knight
        p: "♟"   // Pawn
    };
    return unicodePieces [piece.type] || "";
 };

 socket.on("playerRole", (role)=>{
     console.log('Received player role:', role);
  playerRole = role;
  renderBoead();
 });

 socket.on("spectatorRole", ()=>{
  playerRole = null;
  renderBoead();
 })

 socket.on("boardState", (fen)=>{
  chess.load(fen)
  renderBoead();
 })

 socket.on("move", (move)=>{
  chess.move(move)
  renderBoead();
 })

 renderBoead()