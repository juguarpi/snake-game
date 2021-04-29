'use strict'
const startBtn = document.querySelector(".btn-start");
const stopBtn = document.querySelector(".btn-stop");
const pauseBtn = document.querySelector(".btn-pause");
const clearBtn = document.querySelector('.btn-clear-history')
const scoreDisplay = document.querySelector(".score");
const timeDisplay = document.querySelector(".time");
const difficultyLevelDisplay =document.querySelector(".difficulty-level")
const totalPlayedDisplay = document.querySelector(".total-played-number");
const bestscoreDisplay = document.querySelector(".highest_score");
const gameFrame = document.querySelector(".game-frame");

////////////Setting Parameters//////////////////////
const rectOfFrame = gameFrame.getBoundingClientRect();
const frameHeight = rectOfFrame.height;  //in px 
const frameWidth = rectOfFrame.width;  //in px

const numberOfRow = 25 ; ///adjustable
const numberOFColumn= 25 ; ///adjustable

const elementHeight = (rectOfFrame.height*0.99) / numberOfRow;  // in px
const elementWidth = (rectOfFrame.width*0.99) / numberOFColumn; // in px

var currentGame ={
    score : 0,
    time: 0,
    difficultyLevel:"medium"
}

var histRecord = {
    gamePlayed : 0,
    bestScore: 0
}

const snakeInitialLength = 4; ////adjustable
var gameDifficulties = {
    slow: 500,
    medium: 250,
    fast: 100
}

let gamePaused = false;
var controlTimer; 
var durationTimer;
var apple;
var snake;
var snakeInitialHead

///////////Module/////////////////////////////////////////////////////// 

class Element {
    constructor(x, y){
        this.x=x;
        this.y=y;
    }
}


class Snake {
    constructor(length, head){
        this.length = length,
        this.head = head,
        this.body = this.makeOfSnakeBody()
        this.direction = "S",
        this.running = false
    }

    makeOfSnakeBody(){
        const bodyArray= [this.head];
        for (let index = 1; index < this.length; index++) {
            const element = new Element(this.head.x+index, this.head.y);
            bodyArray.push(element);
        }
        return bodyArray;
    }

    move(){
        let newhead; 
        switch(this.direction){
            case "E" :
                newhead = new Element(this.head.x+1, this.head.y);
                break;
            case "S" :
                newhead = new Element(this.head.x, this.head.y+1);
                break;
            case "W" :
                newhead = new Element(this.head.x-1, this.head.y);
                break;
            case "N" :
                    newhead = new Element(this.head.x, this.head.y-1);
        }

        this.head = newhead;
        this.body.unshift(newhead);
        this.removedTail = this.body.pop();
        this.checkApple();
        this.checkWallCollision();
        this.checkBodyCollision(); 
 
    }

    checkApple(){
        if (this.head.x===apple.x && this.head.y ===apple.y){
            this.length++;
            this.body.push(this.removedTail);
            currentGame.score++;
            renderScore();
            apple=creatRamdonElement();
        }
    }

    checkWallCollision(){
        if (this.head.x < 0 || this.head.x >=numberOFColumn ||this.head.y< 0 || this.head.y>= numberOfRow){
            this.running = false;
        }
    }

    checkBodyCollision(){
        for (let index = 1;  index < this.length; index++) {    
            if (this.head.x === this.body[index].x && this.head.y===this.body[index].y){
                this.running = false;
            }
        }
    }

    changeDirection(direction){
        if(snake.running){
        if (direction == "W" && this.direction =="E") return; 
        if (direction == "E" && this.direction =="W") return;
        if (direction == "N" && this.direction =="S") return; 
        if (direction == "S" && this.direction =="N") return;  
        else this.direction = direction; 
        }
    }
}

function creatRamdonElement (){
    let matched = true; 
    let elementX;
    let elementY; 
    while(matched){
    elementX = Math.floor(Math.random() * numberOFColumn);
    elementY = Math.floor(Math.random() * numberOfRow);
    if (snake.body.every((element)=>(element.x!= elementX || element.y!=elementY))) matched = false;
    }
    return new Element(elementX, elementY);
}

///////////UI View//////////////////////////////////////////// 
function elementMarkUp (x, y){
    return `<div class="element" id="${x}--${y}"></div>`
}

function renderBackground(){
    gameFrame.innerHTML="";
    for (let r = 0; r < numberOfRow; r++) {
        for (let c = 0; c < numberOFColumn; c++) {
            const element=elementMarkUp(c,r);
            gameFrame.insertAdjacentHTML("beforeend", element)
        }
    }
    const backgroundElements = document.querySelectorAll(".element");
    backgroundElements.forEach(element => {
        element.style.height = `${elementHeight}px`;
        element.style.width = `${elementWidth}px`;
    })
}

function removeBackground(){
    gameFrame.innerHTML="";
    gameFrame.innerHTML=`<div class="stop-message">
           
    <p>
        -------------------------------
</p>
<p>
        Game is Stopped.
</p>
<p>
Please click "START" to start a new game.
</p>
<p>
You may use Keyboard "← ↑ → ↓" or "W,A,S,D" Keys or the Control keys on the right to change snake moving direction.  
</p>
<p>
You may also use Keyboard "Space" key to pause the game.  
    </p>
<p>
    -------------------------------
</p>`;
}

function renderApple(apple){
    const id = `${apple.x}--${apple.y}`;
    document.getElementById(id).classList.add("apple");
}


function removeApple(apple){
    const id = `${apple.x}--${apple.y}`;
    document.getElementById(id).classList.remove("apple");
}

function renderHead(head){
    const id = `${head.x}--${head.y}`;
    document.getElementById(id).classList.add("snake--head");
}


function removeHead(head){
    const id = `${head.x}--${head.y}`;
    document.getElementById(id).classList.remove("snake--head");
}


function renderSnake(snake){
    snake.body.forEach(element =>{
        const id = `${element.x}--${element.y}`;
        document.getElementById(id).classList.add("snake");
    })
}


function removeSnake(snake){
    snake.body.forEach(element =>{
        const id = `${element.x}--${element.y}`;
        document.getElementById(id).classList.remove("snake");
    })
}

function renderScore(){
    scoreDisplay.textContent = `${currentGame.score}`; 
    scoreDisplay.classList.remove('score--animation');
    void scoreDisplay.offsetWidth;
    scoreDisplay.classList.add('score--animation');
}

function renderTime() {
    
    const time = currentGame.time;
    const hr = Math.floor(time/3600);
    const min = Math.floor((time-3600*hr)/60); 
    const sec = time-3600*hr-60*min; 
    const hh = hr.toString().padStart(2, '0');
    const mm = min.toString().padStart(2, '0'); 
    const ss = sec.toString().padStart(2, '0'); 
    timeDisplay.textContent = hh +" : " + mm +" : " +ss; 
}


function renderDifficultyLevel(){
    difficultyLevelDisplay.textContent = `${currentGame.difficultyLevel}`; 
}

function renderHistory(){
    totalPlayedDisplay.textContent = `${histRecord.gamePlayed}`; 
    bestscoreDisplay.textContent = `${histRecord.bestScore}`; 
}


function removeComponents(){
    removeApple(apple);
    removeSnake(snake);
    removeHead(snake.head)
}

function displayComponents(){
    renderApple(apple);
    renderSnake(snake);
    renderHead(snake.head);
}

function renderStartingUI() {
    renderBackground();
    displayComponents();
}

function renderStopUI() {
    removeBackground();
}

function displayGameResumed(){
    pauseBtn.textContent="Pause"
    pauseBtn.classList.remove("btn-paused");
    document.querySelector('.pause-message').classList.remove('pause-message--shown');
}

function displayGamePaused(){
    pauseBtn.textContent="Resume"
    pauseBtn.classList.add("btn-paused");
    document.querySelector('.pause-message').classList.add('pause-message--shown');
}

function renderGameButtons(){
    if (snake.running) {
        stopBtn.classList.add('btn-shown');
        pauseBtn.classList.add('btn-shown');
        startBtn.classList.remove('btn-shown');
    }
    else {
        stopBtn.classList.remove('btn-shown');
        pauseBtn.classList.remove('btn-shown');
        startBtn.classList.add('btn-shown');
    }
}


///////////Control//////////////////// 

function startGame(){

        if(snake.running || gamePaused) return;        
        snake.running = true; 
        renderStartingUI()
        renderGameButtons()
        console.log("start");
        // setUpKeyEvent();
        clearInterval(controlTimer);
        setUpRealTimeMonitorControl()
        clearInterval(durationTimer)
        startGameDuration();
}

function setUpRealTimeMonitorControl(){

    controlTimer= setInterval(() => {
            removeComponents();
            snake.move();
            if (!snake.running) {
                stopGame();
                return;
            }; 
            displayComponents();
        
    }, gameDifficulties[currentGame.difficultyLevel]);
}

function stopGame(){
    if(gamePaused) pauseOrResumeGame();
    clearInterval(controlTimer);
    stopGameDuration();
    renderStopUI();
    histRecord.gamePlayed++;
    updateSaveHistoryToStorage();
    renderHistory();
    currentGame.score = 0 ;
    apple = creatRamdonElement ();
    snake = new Snake(snakeInitialLength, snakeInitialHead)
    renderGameButtons()
}


function pauseOrResumeGame(){
    if(!snake.running) return; 
    gamePaused=!gamePaused;
    console.log(gamePaused);
    if (gamePaused) {
        displayGamePaused();
        pauseGameDuration()
        clearInterval(controlTimer); 
    } 
    else {
        displayGameResumed();
        startGameDuration()
        setUpRealTimeMonitorControl(); 
    }
}

function startGameDuration(){
    renderTime(); 
    durationTimer=setInterval(() => {    
        currentGame.time++;
        renderTime();        
    }, 1000);
}

function stopGameDuration (){
    clearInterval(durationTimer);
    currentGame.time=0;
}

function pauseGameDuration(){
    clearInterval(durationTimer);
}

function updateSaveHistoryToStorage (){
    if (currentGame.score > histRecord.bestScore) {
        histRecord.bestScore = currentGame.score;
        localStorage.setItem('bestScore', histRecord.bestScore); 
    }
    localStorage.setItem('gamePlayed', histRecord.gamePlayed);
}

function clearHistory(){
    localStorage.removeItem('bestScore');
    localStorage.removeItem('gamePlayed');
    readHistory();
    renderHistory();
}

function readHistory(){ 
histRecord.bestScore = parseInt(localStorage.getItem('bestScore') ?? 0 );
histRecord.gamePlayed = parseInt(localStorage.getItem('gamePlayed') ?? 0);

}

function changeDifficultyLevel(id){
    currentGame.difficultyLevel=id; 
    renderDifficultyLevel();
    if (snake.running){
        clearInterval(controlTimer);
        setUpRealTimeMonitorControl();
    }
    
}


function setUpKeyEvent(){
 
    document.addEventListener("keydown", (e)=>{    
        console.log(e.code);
        let direction;
        if (e.code === 'Space') {
            console.log("space clicked")
            pauseOrResumeGame();
            return;
        }
        else if (e.key === 'ArrowLeft' || e.key === 'a')  direction = "W";
        else if (e.key === 'ArrowUp' || e.key === 'w' )  direction = "N";
        else if (e.key === 'ArrowDown' || e.key === 's' ) direction = "S";
        else if (e.key === 'ArrowRight' || e.key === 'd' ) direction = "E";
        else return; 
        snake.changeDirection(direction);        
    })

    document.querySelector('.direction-buttons').addEventListener("click", e=>{
        let direction;
        if(e.target.classList.contains('direction-button')){
            direction = e.target.getAttribute('direction')
            snake.changeDirection(direction); 
        }
        else return; 
    })
}

function setUpButtonEvent(){
    startBtn.addEventListener('click', startGame);
    stopBtn.addEventListener('click', stopGame);
    pauseBtn.addEventListener('click', pauseOrResumeGame);
    clearBtn.addEventListener('click', clearHistory);
    document.getElementsByName("difficulty").forEach(element => {
        element.addEventListener("change", (e) => {
            changeDifficultyLevel(e.target.id);
        })
    })
}

function init(){
    setUpButtonEvent();
    snakeInitialHead= new Element(4,4);
    snake = new Snake(snakeInitialLength, snakeInitialHead)
    apple = creatRamdonElement();
    readHistory();
    renderHistory();
    renderGameButtons();
    setUpKeyEvent();
}

init(); 


