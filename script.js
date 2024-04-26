const app = document.getElementById("app")
let board;
let context;
let bullets = [];
let enemies = [];
let bulletState = true;
let bulletTime = 1000;
const boardHeight = 720;
const boardWidth = 1080;
let mainInterval;
let enemyInterval;
let levelInterval;
let currentLevel = 0;

let levels = [
    {
        spawnRate: 3000,
        gapers: 100,
        fatty: 0,
    },
    {
        spawnRate: 3000,
        gapers: 80,
        fatty: 20,
    },
    {
        spawnRate: 5000,
        gapers: 10,
        fatty: 90,
    },
    {
        spawnRate: 800,
        gapers: 100,
        fatty: 0,
    }
]

let trueEnemyPosX;
let trueEnemyPosY;
let truePlayerPosX;
let truePlayerPosY;

let playerImage = new Image();
playerImage.src = "isaac.png"
let bulletImage = new Image();
bulletImage.src = "bullet.webp"
let fatty = new Image();
fatty.src = "fatty.png"
let gaper = new Image();
gaper.src = "gaper.webp"
let bakrunn = new Image();
bakrunn.src = "bakrunn.webp";

let player = {
    posX: 400,
    posY: 400,
    size: 50,
    velocityX: 0,
    velocityY: 0,
    fireRate: 1000,
    fireRateLevel: 0,
    damage: 1,
    damageLevel: 0,
}
const levelupStats = {
    damage: [1,2,3,4,5],
    fireRate: [1000,800,600,400,200],
}
let hp = {
    total: 100,
    posX: 40,
    posY: 640,
    width: 250,
    height: 50,
    color: "lime",
}
let xp = {
    total: 0,
    posX: 800,
    posY: 640,
    width: 250,
    height: 50,
    color: "gray",
}


const enemyTypes = [
    {   name: gaper,
        velocityX: 5,
        velocityY: 5,
        width: 40,
        height: 40,
        hp: 3,
        xpDrop: 15,
        canMove: true,
        speed: 1.5,
        minusSpeed: -1.5,},
    {   name: fatty,
        velocityX: 3,
        velocityY: 3,
        width: 120,
        height: 100,
        hp: 8,
        xpDrop: 25,
        canMove: true,
        speed: 0.8,
        minusSpeed: -0.8,},
]


startScreen();

function startScreen() {
    app.innerHTML = /*HTML*/`
        <div class="buttonDiv">
            <div onclick="startGame()" class="start button">Start Game</div>
            <div class="credits button">Credits</div>
        </div>
    `
}


function startGame() {
    app.innerHTML = /*HTML*/`
        <canvas id="board"></canvas>
        <div class="levelups">
        </div>
    `

    board = document.getElementById("board");
    
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");


    mainInterval = setInterval(updateView, 30);
    enemyInterval = setInterval(createEnemy, levels[currentLevel].spawnRate);
    levelInterval = setInterval(changeLevel, 60000);

    document.addEventListener("keydown", playerControls);
    document.addEventListener("keydown", bulletControls);
    document.addEventListener("keyup", playerControlsStop);
}


function updateView() {
    
    context.drawImage(bakrunn, 0, 0, board.width, board.height)

    

    updatePlayer();
    updateBullets();
    updateEnemy();
    checkCollision();
    updateHP();
    updateXP();
    checkForDeath();
    checkForLevelUp();
}

function updatePlayer() {

    if (player.posY <= 0 && player.velocityY < 0) {
        player.velocityY = 0
    }
    if (player.posY >= (board.height - player.size) && player.velocityY > 0) {
        player.velocityY = 0
    }
    if (player.posX <= 0 && player.velocityX < 0) {
        player.velocityX = 0
    }
    if (player.posX >= (board.width - player.size) && player.velocityX > 0) {
        player.velocityX = 0
    }

    player.posX += player.velocityX;
    player.posY += player.velocityY;

    context.drawImage(playerImage, player.posX, player.posY, player.size, player.size)
}

function updateBullets() {
    for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].posY <= 0 ||
            bullets[i].posY >= board.height ||
            bullets[i].posX <= 0 ||
            bullets[i].posX >= board.width) {
            bullets.splice(i, 1)
        } else {

        bullets[i].posY += bullets[i].velocityY;
        bullets[i].posX += bullets[i].velocityX;

        
        context.drawImage(bulletImage, bullets[i].posX, bullets[i].posY, 15, 15)
    }
    }
}


function playerControls(e) {
    if (e.code == "KeyW") {
        player.velocityY = -5;
    } else if (e.code == "KeyS") {
        player.velocityY = 5;
    } else if (e.code == "KeyA") {
        player.velocityX = -5;
    } else if (e.code == "KeyD") {
        player.velocityX = 5;
    } 


    
}

function bulletControls(b) {
    if (bulletState) {
        if (b.code == "ArrowUp") {
            bullets.push(
                {
                posY: truePlayerPosY,
                posX: truePlayerPosX,
                velocityY: -10,
                velocityX: 0,
            }
            )
            bulletState = false;
            setTimeout(changeBulletState, player.fireRate);
        } else if (b.code == "ArrowDown") {
            bullets.push(
                {
                posY: truePlayerPosY,
                posX: truePlayerPosX,
                velocityY: 10,
                velocityX: 0,
            }
            )
            bulletState = false;
            setTimeout(changeBulletState, player.fireRate);
        } else if (b.code == "ArrowLeft") {
            bullets.push(
                {
                posY: truePlayerPosY,
                posX: truePlayerPosX,
                velocityY: 0,
                velocityX: -10,
            }
            )
            bulletState = false;
            setTimeout(changeBulletState, player.fireRate);
        } else if (b.code == "ArrowRight") {
            bullets.push(
                {
                posY: truePlayerPosY,
                posX: truePlayerPosX,
                velocityY: 0,
                velocityX: 10,
            }
            )
            bulletState = false;
            setTimeout(changeBulletState, player.fireRate);
        } 
    }
}

function changeBulletState() {
    bulletState = true;
}

function playerControlsStop(e) {
    if (e.code == "KeyW" || e.code == "KeyS") {
        player.velocityY = 0;
    } else if (e.code == "KeyA" || e.code == "KeyD") {
        player.velocityX = 0;
    }
}


function createEnemy() {
    
    let direction = Math.floor(Math.random() * 4)
    let posX;
    let posY;

        if (direction == 0) {
        posX = Math.floor(Math.random() * boardWidth)
        posY = -100;
    } else if (direction == 1) {
        posX = Math.floor(Math.random() * boardWidth)
        posY = boardHeight;
    } else if (direction == 2) {
        posX = -100
        posY = Math.floor(Math.random() * boardHeight)
    } else if (direction == 3) {
        posX = boardWidth;
        posY = Math.floor(Math.random() * boardHeight);
    } 

    let randomNumber = Math.floor(Math.random() * 100);
    let newEnemy;
    if (randomNumber <= levels[currentLevel].gapers) {
        newEnemy = {...enemyTypes[0]};
    } else {newEnemy = {...enemyTypes[1]};}
    

    newEnemy.posX = posX
    newEnemy.posY = posY
    
    enemies.push(newEnemy)

}
        // true enemy position = enemy.posY + enemy.height / 2
        // enemy.posX + enemy.width / 2

function updateEnemy() {
    for (let i = 0; i < enemies.length; i++) {
        trueEnemyPosX = enemies[i].posX + enemies[i].width / 2;
        trueEnemyPosY = enemies[i].posY + enemies[i].height / 2;
        truePlayerPosX = player.posX + player.size / 2;
        truePlayerPosY = player.posY + player.size / 2;

        //sjekker om speler mister liv

        if (truePlayerPosX > enemies[i].posX &&
            truePlayerPosX < enemies[i].posX + enemies[i].width &&
            truePlayerPosY > enemies[i].posY &&
            truePlayerPosY < enemies[i].posY + enemies[i].height) {
                hp.total -= 1;}
            
        
                


        //styrer fienden

        if (enemies[i].canMove) {

            enemies[i].canMove = false;

            setTimeout(() => {
                enemies[i].canMove = true;
            }, 650);

            let randomMovement = enemies[i].width / 3 - 20 + Math.floor(Math.random() * 40)


        if (truePlayerPosX < trueEnemyPosX && truePlayerPosX + randomMovement > trueEnemyPosX) {
            enemies[i].velocityX = 0;
        } else if (truePlayerPosX > trueEnemyPosX && truePlayerPosX < trueEnemyPosX + randomMovement) {
            enemies[i].velocityX = 0;
        }
        else if (truePlayerPosX > trueEnemyPosX) {
            enemies[i].velocityX = enemies[i].speed;
        } else {enemies[i].velocityX = enemies[i].minusSpeed}


        if (truePlayerPosY < trueEnemyPosY && truePlayerPosY + randomMovement > trueEnemyPosY) {
            enemies[i].velocityY = 0;
        }
        else if (truePlayerPosY > trueEnemyPosY && truePlayerPosY < trueEnemyPosY + randomMovement) {
            enemies[i].velocityY = 0;
        }
        else if (truePlayerPosY > trueEnemyPosY) {
            enemies[i].velocityY = enemies[i].speed;
        } else {enemies[i].velocityY = enemies[i].minusSpeed}



        for (let n = 0; n < enemies.length; n++) {
            if (enemies[i].posX < enemies[n].posX && enemies[i].posX + randomMovement > enemies[n].posX
                && enemies[i].posY < enemies[n].posY && enemies[i].posY + randomMovement > enemies[n].posY) {
                    let direction = Math.floor(Math.random() * 2)

                    if (direction) {
                    enemies[i].velocityX = enemies[i].minusSpeed;
                } else {
                    enemies[i].velocityY = enemies[i].minusSpeed;
                    
                }
            } else if (enemies[i].posX > enemies[n].posX && enemies[i].posX < enemies[n].posX + randomMovement &&
                enemies[i].posY > enemies[n].posY && enemies[i].posY < enemies[n].posY + randomMovement) {
                    let direction = Math.floor(Math.random() * 2)
                    if (direction) {
                    enemies[i].velocityX = enemies[i].speed;
                } else {
                    enemies[i].velocityY = enemies[i].speed;
                }
                    }

        }
    }
        enemies[i].posX += enemies[i].velocityX;
        enemies[i].posY += enemies[i].velocityY;

        context.drawImage(enemies[i].name, enemies[i].posX, enemies[i].posY, enemies[i].width, enemies[i].height)
    }
}



function checkCollision() {
    if (enemies) {
        for (let i = 0; i < bullets.length; i++) {
            for (let n = 0; n < enemies.length; n++) {
                if (bullets[i].posX > enemies[n].posX && 
                    bullets[i].posX < enemies[n].posX + enemies[n].width &&
                    bullets[i].posY > enemies[n].posY && 
                    bullets[i].posY < enemies[n].posY + enemies[n].height) {
                        bullets.splice(i, 1);
                        enemies[n].hp -= player.damage;
                        if (enemies[n].hp <= 0) {
                            enemies.splice(n, 1);
                            xp.total += enemies[n].xpDrop;
                    }
                }
            }
        }
    }
}

function updateHP() {

    let displayHP = hp.width * hp.total / 100;

    if (displayHP > 180) {
        hp.color = "lime"
    } else if (displayHP > 50) {
        hp.color = "yellow"
    } else {hp.color = "red"}

    
    context.fillStyle = "grey";
    context.fillRect(hp.posX, hp.posY, hp.width, hp.height)
    
    context.fillStyle = hp.color;
    context.fillRect(hp.posX, hp.posY, displayHP, hp.height)
}

function updateXP() {
    let displayXP = xp.width * xp.total / 100;

    context.fillStyle = "grey";
    context.fillRect(xp.posX, xp.posY, xp.width, xp.height)
    
    context.fillStyle = "turquoise";
    context.fillRect(xp.posX, xp.posY, displayXP, xp.height)

}

function checkForDeath() {
    if (hp.total <= 0) {
        
        alert("Game Over")
        clearInterval(mainInterval);
        clearInterval(enemyInterval);
    }
}

function changeLevel() {
    currentLevel += 1;
    clearInterval(enemyInterval);
    enemyInterval = setInterval(createEnemy, levels[currentLevel].spawnRate);
}

function checkForLevelUp() {
    if (xp.total >= 100) {
        xp.total = 0;
        levelUpMenu();
    };
}

function levelUpMenu() {
    document.querySelector(".levelups").innerHTML = /*HTML*/`
        
            <div onclick="levelUp('damage')" class="upgrade damage">Upgrade Damage</div>
            <div onclick="levelUp('firerate')" class="upgrade firerate">Upgrade Firerate</div>
            <div class="upgrade health">Heal 40%</div>
        `
    clearInterval(mainInterval);
    clearInterval(enemyInterval);
    
}

function levelUp(stat) {
    document.querySelector(".levelups").innerHTML = "";


    if (stat == 'firerate'){
        player.fireRateLevel += 1;
        player.fireRate = levelupStats.fireRate[player.fireRateLevel];
    } else if (stat == 'damage') {
        player.damageLevel += 1;
        player.damage = levelupStats.damage[player.damageLevel];
    } 

    mainInterval = setInterval(updateView, 30);
    enemyInterval = setInterval(createEnemy, levels[currentLevel].spawnRate);
}