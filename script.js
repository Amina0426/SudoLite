let solBoard=[];
window.addEventListener("load",init);
function init(){
    drawBoard();
    openMenu();
    submit();
    mode();
    closeOverlay();
}
function openMenu(){
    let menuBtn=document.querySelector(".menu");
    let menu=document.querySelector(".menu-bar");
    let overlay=document.querySelector(".menu-overlay");

    menuBtn.addEventListener("click",(e)=>{
        e.stopPropagation();
        overlay.classList.add("active");
        menu.classList.add("open");
    })
    document.addEventListener("click",()=>{
        if(menu.classList.contains("open")){
            menu.classList.remove("open");
            overlay.classList.remove("active");
        }
    });
    menu.addEventListener("click",(e)=>{
        e.stopPropagation();
    });
}
function openOverlay(order){
    let btn1=document.getElementById("ans");
    let btn2=document.getElementById("play");
    let overlay=document.querySelector(".overlay");
    if(order===ans){
        overlay.style.display='flex';
        overlay.classList.remove("play");
        overlay.classList.add("ans");
    }else if(order===play){
        overlay.style.display='flex';
        generate();
        overlay.classList.add("play");
        overlay.classList.remove("ans");
    }
}
function closeOverlay(){
    let overlay=document.querySelector(".overlay");
    let backBtn=document.querySelector(".back");
    backBtn.addEventListener("click",()=>{
        overlay.style.display="none";
    })
}
function submit(){
    let btn=document.getElementById("cta1");
    let overlay=document.querySelector(".overlay");
    btn.addEventListener("click",()=>{
        if(overlay.classList.contains("ans")){
            solve();
        }else if(overlay.classList.contains("play")){
            checkUserSol();
        }
    });
}
function solve(){
    const sudoku=getSudokuValue();

    const hasInput=sudoku.some(row=>row.some(val=>val!==0));
    if(!hasInput){
        alert("Grid is empty!");
        return;
    }
    if(!isValidBoard(sudoku)){
        alert("invalid puzzle!");
        return;
    }
    const solved=solveSudoku(sudoku);
    if(solved){
        updateGrid(sudoku);
    }else{
        alert("no solution exists!");
    }
}
function generate(){
    const grid=Array.from({length: 9},()=>Array(9).fill(0));

    let filled=0;
    while(filled<11){
        const row=Math.floor(Math.random()*9);
        const col=Math.floor(Math.random()*9);
        const num=Math.floor(Math.random()*9)+1;
        if(grid[row][col]===0&&isSafe(grid,row,col,num)){
            grid[row][col]=num;
            filled++;
        }
    }

    const success=solveSudoku(grid);
    if(!success){
        generate();
        return;
    }

    const puzzle=grid.map(row=>row.slice()); //cloning the grid
    solBoard=grid.map(row=>row.slice());

    let removals=4;
    while(removals>0){
        const row=Math.floor(Math.random()*9);
        const col=Math.floor(Math.random()*9);
        if(puzzle[row][col]!==0){
            puzzle[row][col]=0;
            removals--;
        }
    }

    const cells=document.querySelectorAll(".cell");
    cells.forEach(cell=>{
        const row=parseInt(cell.dataset.row);
        const col=parseInt(cell.dataset.col);
        const val=puzzle[row][col];
        cell.value=val===0?"":val;
        cell.disabled = val!==0;
    });
}
function mode(){
    let modeBtn=document.querySelector(".mode");
    let body=document.querySelector("body");
    modeBtn.addEventListener("click",()=>{
        body.classList.toggle("dark");
    });
}
function drawBoard(){
    let board=document.querySelector(".board");
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            let cell=document.createElement("input");
            cell.maxLength='1';
            cell.type='number';
            cell.min='1';
            cell.max='9';
            cell.classList.add("cell");
            cell.dataset.row=i;
            cell.dataset.col=j;
            board.appendChild(cell);
        }
    }
}
function isValidBoard(board){
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            let num=board[i][j];
            if(num!==0){
                board[i][j]=0;
                if(!isSafe(board,i,j,num)){
                    board[i][j]=num;
                    return false;
                }
                board[i][j]=num;
            }
        }
    }
    return true;
}
function getSudokuValue(){
    const cells=document.querySelectorAll(".cell");
    const sudoku=Array.from({length:9},()=>
        Array(9).fill(0)
    );

    cells.forEach(cell=>{
        const row=parseInt(cell.dataset.row);
        const col=parseInt(cell.dataset.col);
        const value=parseInt(cell.value);
        if(!isNaN(value)){
            sudoku[row][col]=value;
            cell.classList.add("user-input");
        }else{
            sudoku[row][col]=0;
            cell.classList.remove("user-input");
        }
    });

    return sudoku;
}
function solveSudoku(board){
    for(let r=0;r<9;r++){
        for(let c=0;c<9;c++){
            if(board[r][c]===0){
                for(let num=1;num<=9;num++){
                    if(isSafe(board,r,c,num)){
                        board[r][c]=num;
                        if(solveSudoku(board)){
                            return true;
                        }
                        board[r][c]=0;
                    }
                }
                return false; //no valid num found
            }
        }
    }
    return true; //solved
}
function isSafe(board,row,col,num){
    for(let x=0;x<9;x++){
        if(board[row][x]===num||board[x][col]===num){
            return false;
        }
    }
    const startRow = row - row%3, startCol = col - col%3;
    for(let i=0;i<3;i++){
        for(let j=0;j<3;j++){
            if(board[i+startRow][j+startCol]===num){
                return false;
            }
        }
    }
    return true;
}
function updateGrid(sudoku){
    const cells=document.querySelectorAll(".cell");
    cells.forEach(cell=>{
        const row=parseInt(cell.dataset.row);
        const col=parseInt(cell.dataset.col);
        if(!cell.classList.contains("user-input")){
            cell.value=sudoku[row][col];
        }
    })
}
function checkUserSol(){
    const cells=document.querySelectorAll(".cell");
    const errors=[];
    for(const cell of cells){
        const row=parseInt(cell.dataset.row);
        const col=parseInt(cell.dataset.col);
        const userVal=parseInt(cell.value);
        if(isNaN(userVal)||userVal!==solBoard[row][col]){
            errors.push(cell);
            console.log(`User:${userVal}, SolBoard: ${solBoard[row][col]}`);
        }
    }
    console.log(errors);
    errors.forEach(e=>{
        e.style.backgroundColor="red";
    })

    if(errors.length>0){
        alert("incorrect");
        return;
    }
    alert("correct!well done!");
}

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("s-w.js")
      .then(() => console.log("Service Worker Registered"))
      .catch(err => console.error("Service Worker Error", err));
  }