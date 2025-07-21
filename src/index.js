var Scrambo = require('scrambo');

var threebythree = new Scrambo(); 

function getNewScramble() {
    return threebythree.get(1)[0];
}

let scramble = getNewScramble()

document.getElementById("scramble").innerHTML = scramble

let timer = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;
let stopped = false;

let holdTime = 0.5
let down = false;
let primed = false;
let primeTimeout = null;

let stage = 0;

let timerDisplay = document.getElementById("timerDisplay")
let memoInput = document.getElementById("memoInput")
let memoDisplay = document.getElementById("memoDisplay")

window.setup = function(){
    createCanvas(400, 400);
    maincube = new cube();
    maincube.executeAlg(scramble);
}

function startTimer() {
    if(!isRunning){
    startTime = Date.now() - elapsedTime;
    timer = setInterval(update, 10);
    isRunning = true;
    }
}

function stopTimer() {
    if(isRunning){
    clearInterval(timer);
    elapsedTime = Date.now() - startTime;
    isRunning = false;
    if(stage == 0){
      stage = 1;
      memoInput.style.display = "block";
      memoDisplay.style.display = "block";
      
    }else if(stage == 1){
    //get new scramble and reload dom element
    scramble = getNewScramble();
    document.getElementById("scramble").innerHTML = scramble;
    //reload cube and p5 display
    window.maincube = new cube();
    window.maincube.executeAlg(scramble);
    stage = 0;
    }
    }
}

function reset() {
    clearInterval(timer);
    startTime = 0;
    elapsedTime = 0;
    isRunning = false;
    timerDisplay.textContent = "0.00"
}

function update() {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
     
    let hours = Math.floor(elapsedTime / (1000*60*60));
    let minutes = Math.floor(elapsedTime / (1000*60) % 60);
    let seconds = Math.floor(elapsedTime / 1000 % 60);
    let milliseconds = Math.floor(elapsedTime % 1000 / 10);

    let timeString = "";

    if (hours > 0) {
        timeString += hours + ":";
        timeString += minutes.toString().padStart(2, '0') + ":";
    } else if (minutes > 0) {
        timeString += minutes + ":";
    }
    timeString += seconds.toString() + ".";
    timeString += milliseconds.toString().padStart(2, '0');

    timerDisplay.textContent = timeString;
}

document.addEventListener("keyup", event => {

        if (event.code !== "Space" || document.activeElement.tagName === "INPUT") {
            return;
        }

        if(!stopped&&primed){
        startTimer()
        }else{
        stopped = false
        }
        down = false;
        primed = false;
        if(primeTimeout) {
            clearTimeout(primeTimeout);
            primeTimeout = null;
        }
        timerDisplay.style.color = "black"
})

document.addEventListener("keydown", event => {


    if (event.code !== "Space" || document.activeElement.tagName === "INPUT") {
        return;
    }

    if(stage==1){
      memoInput.style.display = "none";
      memoDisplay.style.display = "none";
      memoInput.value = "";
      memoDisplay.textContent = "";
    }

        
    if(!isRunning){
        if(!primed){
           timerDisplay.style.color = "red" 
           reset()
           primeTimeout = setTimeout(() => {
            if(!isRunning){
            timerDisplay.style.color = "green"
            primed=true
            }
           },holdTime*1000)
        }
    }else if(isRunning){
            stopped = true
        }
        stopTimer()

})

memoInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const memoString = memoInput.value.toUpperCase();
        memoDisplay.textContent = memoString;
        let[edgeMemo,cornerMemo] = memoString.split(" ")
        edgeMemo = edgeMemo.split("")
        cornerMemo = cornerMemo.split("")
        let testcube = new cube();
        testcube.executeAlg(scramble)
        testcube.swapEdgeMemo(edgeMemo);
        testcube.swapCornerMemo(cornerMemo);
        if(testcube.areEdgesSolved() && testcube.areCornersSolved()){
          memoDisplay.style = "color: green"
        }else{
          memoDisplay.style = "color: red"
        }
        
        console.log("edgeMemo = " + edgeMemo + " cornerMemo = " + cornerMemo)
        memoDisplay.style.display = "block";
      }
});


// cube logic //

function convertNotation(scrambleString) {
    // Split by spaces to get individual moves
    const moves = scrambleString.split(' ');
    const result = [];
    
    for (let move of moves) {
        move = move.trim();
        if (move === '') continue;
        
        const face = move[0].toLowerCase();
    
        if (move.includes("'")) {
            result.push(face.toUpperCase());
        } else if (move.includes("2")) {
            result.push(face, face);
        } else {
            result.push(face);
        }
    }
    
    return result;
}


 class cube{
    constructor(){
      this.faces = {
        Uface: this.createface('W'),  
        Dface: this.createface('Y'),
        Lface: this.createface('O'),
        Fface: this.createface('G'),
        Rface: this.createface('R'),
        Bface: this.createface('B'),
      }
      
      this.faceColor = {
        'W': 'Uface',
        'Y': 'Dface', 
        'O': 'Lface',
        'G': 'Fface',
        'R': 'Rface',
        'B': 'Bface'
      };
      
      this.colours = {
        'W': [255, 255, 255], // White
        'Y': [255, 255, 0],   // Yellow
        'O': [255, 165, 0],   // Orange
        'G': [0, 255, 0],     // Green
        'R': [255, 0, 0],     // Red
        'B': [0, 0, 255]      // Blue
      };
      
      this.adjSides = {
      'Uface': [
        [0,0], [0,1], [0,2],  // Fface top row 
        [0,0], [0,1], [0,2],  // Rface top row  
        [0,0], [0,1], [0,2],  // Bface top row
        [0,0], [0,1], [0,2]   // Lface top row
      ],
      'Dface': [
        [2,0], [2,1], [2,2],  // Fface bottom row
        [2,0], [2,1], [2,2],  // Rface bottom row
        [2,0], [2,1], [2,2],  // Bface bottom row
        [2,0], [2,1], [2,2]   // Lface bottom row
      ],
      'Fface': [
        [0,0], [0,1], [0,2],  // Bface top row
        [2,0], [1,0], [0,0],  // Rface left column
        [2,2], [2,1], [2,0],  // Uface top row
        [0,2], [1,2], [2,2]   // Lface right column
      ],

      'Bface': [
        [2,2], [2,1], [2,0],  // Dface bottom row
        [2,0], [1,0], [0,0],  // Lface left column
        [0,0], [0,1], [0,2],  // Uface bottom row 
        [0,2], [1,2], [2,2]   // Rface right column 
      ],
      'Rface': [
        [0,2], [1,2], [2,2],  // Dface right column
        [2,0], [1,0], [0,0],   // Bface left column
        [0,2], [1,2], [2,2],  // Uface right column
        [0,2], [1,2], [2,2]  // Fface right column
        
      ],
      'Lface': [
        [2,0], [1,0], [0,0],  // Dface left column
        [2,0], [1,0], [0,0],   // Fface left column
        [2,0], [1,0], [0,0],  // Uface left column 
        [0,2], [1,2], [2,2]  // Bface right column
      ]
        
    }
      
    this.adjFaces = {
      'Uface': ['Fface', 'Rface', 'Bface', 'Lface'],
      'Dface': ['Bface', 'Rface', 'Fface', 'Lface'],
      'Fface': ['Dface', 'Rface', 'Uface', 'Lface'],
      'Bface': ['Dface', 'Lface', 'Uface', 'Rface'],
      'Rface': ['Dface', 'Bface', 'Uface', 'Fface'],
      'Lface': ['Dface', 'Fface', 'Uface', 'Bface']
    };
      
    this.corners = {
      AER: [['Uface', 0, 0],['Lface', 0, 0],['Bface', 0, 2]],
      BQN: [['Uface', 0, 2],['Bface', 0, 0],['Rface', 0, 2]],
      CMJ: [['Uface', 2, 2],['Rface', 0, 0],['Fface', 0, 2]],
      DIF: [['Uface', 2, 0],['Fface', 0, 0],['Lface', 0, 2]],
      UGL: [['Dface', 0, 0],['Lface', 2, 2],['Fface', 2, 0]],
      VKP: [['Dface', 0, 2],['Fface', 2, 2],['Rface', 2, 0]],
      WOT: [['Dface', 2, 2],['Rface', 2, 2],['Bface', 2, 0]],
      XSH: [['Dface', 2, 0],['Bface', 2, 2],['Lface', 2, 0]]
    }
      
    this.letters = {
      'Uface':[['A','A','B'],
               ['D',null,'B'],
               ['D','C','C']
               ],
      'Lface':[['E','E','F'],
               ['H',null,'F'],
               ['H','G','G']
               ],
      'Fface':[['I','I','J'],
               ['L',null,'J'],
               ['L','K','K']
               ],
      'Rface':[['M','M','N'],
               ['P',null,'N'],
               ['P','O','O']
               ],
      'Bface':[['Q','Q','R'],
               ['T',null,'R'],
               ['T','S','S']
               ],
      'Dface':[['U','U','V'],
               ['X',null,'V'],
               ['X','W','W']
               ],

    }
    
      this.edgeBuffer = ['Uface', 1, 2]
      
      this.cornerBuffer = ['Lface', 0, 0]
  }
    
    
  createface(colour){
    return[
    [colour,colour,colour],
    [colour,colour,colour],
    [colour,colour,colour]
  ]
  }
    
    turnFace(face,direction){
      let topface = [
        face[0][0], face[0][1], face[0][2],
        face[1][2], face[2][2],
        face[2][1], face[2][0],
        face[1][0]
      ]
    
      let shifted = []
      
      if (direction === 'cw') {
        shifted = shiftArray(topface, -2);
      } else if (direction === 'acw') {
        shifted = shiftArray(topface, 2);
      }
      
      face[0][0] = shifted[0]
      face[0][1] = shifted[1]
      face[0][2] = shifted[2]
      face[1][2] = shifted[3]
      face[2][2] = shifted[4]
      face[2][1] = shifted[5]
      face[2][0] = shifted[6]
      face[1][0] = shifted[7]
    }
    
  turnAdj(face, direction){
    let positions = this.adjSides[face];
    let faceNames = this.adjFaces[face];
    
    let sidePieces = [];
    for (let i = 0; i < positions.length; i++) {
      let pos = positions[i];
      let faceIndex = Math.floor(i / 3);
      let targetFace = this.faces[faceNames[faceIndex]];
      sidePieces.push(targetFace[pos[0]][pos[1]]);
    }
    
    let shifted = [];
    
    if (direction === 'cw') {
      shifted = shiftArray(sidePieces, 3);
    } else if (direction === 'acw') {
      shifted = shiftArray(sidePieces, -3);
    }

    for (let i = 0; i < positions.length; i++) {
      let pos = positions[i];
      let faceIndex = Math.floor(i / 3);
      let targetFace = this.faces[faceNames[faceIndex]];
      targetFace[pos[0]][pos[1]] = shifted[i];
    }
  }
    
  turn(faceName, direction){
    this.turnFace(this.faces[faceName], direction);
    this.turnAdj(faceName, direction);
  }
  
    drawFace(face, x, y, size){
      for(let row = 0; row < face.length; row++){
        for(let col = 0; col < face[row].length; col++){
          let square = this.colours[face[row][col]];
          fill(square);
          let squareX = x + (col * size);
          let squareY = y + (row * size);
          rect(squareX,squareY,size)
        }
      }
    }
    
    makeTurn(n){
        if(n=='u') {
        this.turn('Uface', 'cw')
        }
        if(n=='U') {
        this.turn('Uface', 'acw')
        }
        if(n=='d') {
        this.turn('Dface', 'cw')
        }
        if(n=='D') {
        this.turn('Dface', 'acw')
        }
        if(n=='l') {
        this.turn('Lface', 'cw')
        }
        if(n=='L') {
        this.turn('Lface', 'acw')
        }
        if(n=='f') {
        this.turn('Fface', 'cw')
        }
        if(n=='F') {
        this.turn('Fface', 'acw')
        }
        if(n=='r') {
        this.turn('Rface', 'cw')
        }
        if(n=='R') {
        this.turn('Rface', 'acw')
        }
        if(n=='b') {
        this.turn('Bface', 'cw')
        }
        if(n=='B') {
        this.turn('Bface', 'acw')
        }
  
    }
    
    executeAlg(alg){

        if(typeof alg == "string"){
            alg = convertNotation(alg)
        }
      for(let j=0;j<alg.length;j++){
        this.makeTurn(alg[j])
      }
    }
    
    drawNet(x,y,size){
        this.drawFace(this.faces.Uface,x+size*3,y,size)
        this.drawFace(this.faces.Lface,x -5,y+size*3+5,size)
        this.drawFace(this.faces.Fface,x+size*3,y+size*3+5,size)
        this.drawFace(this.faces.Rface,x+size*6 + 5,y+size*3+5,size)
        this.drawFace(this.faces.Bface,x+size*9 + 10,y+size*3+5,size)
        this.drawFace(this.faces.Dface,x+size*3,y+size*6+10,size)
    }
    
    findAdjEdge(face,row,col){
      
      let mainFace = this.faces[face][row][col]
      let index = null
      
      if(row == 2 && col == 1){
        index = 0
      }
      if(row == 1 && col == 2){
        index = 1
      }
      if(row == 0 && col == 1){
        index = 2
      }
      if(row == 1 && col == 0){
        index = 3
      }
      
      let adjFace = this.adjFaces[face][index]
      let adjSideIndex = index * 3 + 1; // +1 to get the middle piece of the edge
      let adjCoords = this.adjSides[face][adjSideIndex];
  
    return {
      face: adjFace,
      row: adjCoords[0],
      col: adjCoords[1]
    }; 
  }
    
    findAdjCorners(face,row,col){
      
      let cornerInfo = this.findArray(this.corners,[face, row, col])
      let corner1 = this.corners[cornerInfo.key][(cornerInfo.index + 1) % this.corners[cornerInfo.key].length]
      let corner2 = this.corners[cornerInfo.key][(cornerInfo.index + 2) % this.corners[cornerInfo.key].length]
 
  
      return{
        face1: corner1[0],
        row1: corner1[1],
        col1: corner1[2],
        
        face2: corner2[0],
        row2: corner2[1],
        col2: corner2[2]
      }
    }
    
   findArray(obj, target) {
  for (const key in obj) {
    const arrays = obj[key];
    for (let i = 0; i < arrays.length; i++) {
      const subArray = arrays[i];
      // Check if arrays are equal
      if (
        subArray.length === target.length &&
        subArray.every((val, idx) => val === target[idx])
      ) {
        return { key, index: i };
      }
    }
  }
  return null; 
}
      
    
    
    findDestEdge(face,row,col) {
      let mainEdge = this.faces[face][row][col]
      let adjEdgeinfo = this.findAdjEdge(face,row,col)
      let adjEdge = this.faces[adjEdgeinfo.face][adjEdgeinfo.row][adjEdgeinfo.col]
      
      let destFace = this.faceColor[mainEdge]
      let adjFace = this.faceColor[adjEdge]
      
      let index = this.adjFaces[adjFace].indexOf(destFace)
       
      index = index*3 + 1
      
      let destCoords = this.adjSides[adjFace][index]
      
      return {
        face: destFace,
        row: destCoords[0],
        col: destCoords[1]
      }
    }
    
    searchObj(obj, target) {
      let matches = [];

      for (const key in obj) {
        const row = obj[key];
        for (let i = 0; i < row.length; i++) {
          const col = row[i];
          for (let j = 0; j < col.length; j++) {
            if (col[j] === target) {
              matches.push({ key, row: i, col: j });
            }
          }
        }
      }

      return matches; 
    }


    
    isEdgePosition(row, col) {
      return (
      (row === 0 && col === 1) ||
      (row === 1 && col === 0) ||
      (row === 1 && col === 2) ||
      (row === 2 && col === 1)
      );
    }
    
    swapPieces(face1,row1,col1,face2,row2,col2){
      let main1 = this.faces[face1][row1][col1]
      let main2 = this.faces[face2][row2][col2]
      
      this.faces[face1][row1][col1] = main2
      this.faces[face2][row2][col2] = main1
      
      if(this.isEdgePosition(row1,col1) && this.isEdgePosition(row2,col2)){
      let adjCoord1 = this.findAdjEdge(face1, row1, col1)
      let adjCoord2 = this.findAdjEdge(face2, row2, col2)
      let adj1 = this.faces[adjCoord1.face][adjCoord1.row][adjCoord1.col]
      let adj2 = this.faces[adjCoord2.face][adjCoord2.row][adjCoord2.col]
      


      this.faces[adjCoord1.face][adjCoord1.row][adjCoord1.col] = adj2
      this.faces[adjCoord2.face][adjCoord2.row][adjCoord2.col] = adj1   
      
      }else if(!this.isEdgePosition(row1,col1) && !this.isEdgePosition(row2,col2)){
        
      let corner1 = this.findAdjCorners(face1, row1, col1)
      let corner2 = this.findAdjCorners(face2, row2, col2)

      let corner1_adj1 = this.faces[corner1.face1][corner1.row1][corner1.col1]
      let corner1_adj2 = this.faces[corner1.face2][corner1.row2][corner1.col2]
      let corner2_adj1 = this.faces[corner2.face1][corner2.row1][corner2.col1]
      let corner2_adj2 = this.faces[corner2.face2][corner2.row2][corner2.col2]

      this.faces[corner1.face1][corner1.row1][corner1.col1] = corner2_adj1
      this.faces[corner1.face2][corner1.row2][corner1.col2] = corner2_adj2
      this.faces[corner2.face1][corner2.row1][corner2.col1] = corner1_adj1
      this.faces[corner2.face2][corner2.row2][corner2.col2] = corner1_adj2
    }
    }
    
    swapEdgeMemo(memo) {
      for (let i = 0; i < memo.length; i++) {
        let matches = this.searchObj(this.letters, memo[i]);
        let mainFace = matches.find(pos => this.isEdgePosition(pos.row, pos.col));

        if (mainFace) {
          this.swapPieces(mainFace.key,mainFace.row,mainFace.col,
                     this.edgeBuffer[0],this.edgeBuffer[1],this.edgeBuffer[2])
        }

      }
    }
    
    swapCornerMemo(memo){
      for (let i=0; i< memo.length; i++){
        let matches = this.searchObj(this.letters, memo[i]);
        let mainFace = matches.find(pos => !this.isEdgePosition(pos.row, pos.col));

        if (mainFace) {
          this.swapPieces(mainFace.key,mainFace.row,mainFace.col,
                     this.cornerBuffer[0],this.cornerBuffer[1],this.cornerBuffer[2])
        }    
      }
    }

    isPieceSolved(face,row,col){
      let mainface = this.faces[face][row][col]
      if(face != this.faceColor[mainface]){
        return false;
      }
      if(this.isEdgePosition(row,col)){
        let adjCoord = this.findAdjEdge(face,row,col);
        let adjColor = this.faces[adjCoord.face][adjCoord.row][adjCoord.col]
        if(adjCoord.face != this.faceColor[adjColor]){
          return false;
        }
      }else{
        let corners = this.findAdjCorners(face,row,col)
        let corner1 = this.faces[corners.face1][corners.row1][corners.col1]
        let corner2 = this.faces[corners.face2][corners.row2][corners.col2]
        if(corners.face1 != this.faceColor[corner1]){
          return false;
        }
        if(corners.face2 != this.faceColor[corner2]){
          return false;
        } 
      }
      return true;
    }
    
    areEdgesSolved(){
      if(
      this.isPieceSolved('Uface',0,1)&&
      this.isPieceSolved('Uface',1,2)&&
      this.isPieceSolved('Uface',2,1)&&
      this.isPieceSolved('Uface',1,0)&&
      this.isPieceSolved('Dface',0,1)&&
      this.isPieceSolved('Dface',1,2)&&
      this.isPieceSolved('Dface',2,1)&&
      this.isPieceSolved('Dface',1,0)&&
      this.isPieceSolved('Fface',1,0)&&
      this.isPieceSolved('Fface',1,2)&&
      this.isPieceSolved('Bface',1,0)&&
      this.isPieceSolved('Bface',1,2)){
        return true;
      }else{
        return false;
      }
    }
    areCornersSolved(){
      if(
      this.isPieceSolved('Uface',0,0)&&
      this.isPieceSolved('Uface',0,2)&&
      this.isPieceSolved('Uface',2,0)&&
      this.isPieceSolved('Uface',2,2)&&
      this.isPieceSolved('Dface',0,0)&&
      this.isPieceSolved('Dface',0,2)&&
      this.isPieceSolved('Dface',2,0)&&
      this.isPieceSolved('Dface',2,2)){
        return true;
      }else{
        return false;
      }
    }
}

function shiftArray(arr, n) {
  const len = arr.length;
  const shift = ((n % len) + len) % len;
  return arr.slice(shift).concat(arr.slice(0, shift));
}

window.draw = function(){
    maincube.drawNet(10,10,30);
}



