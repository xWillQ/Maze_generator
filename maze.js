const a = 40;               //  Сторона клетки (в пикселях)

const maxSize = true;   // Если true, то размер вычисляется исходя из размера окна, иначе задаётся следующими параметрами
let columns = 20,       //  Количество столбцов
    rows = 10;          //  Количество рядов

const newest = 100,          //  Шанс выбора продолжения из последней добавленной клетки(%)
    random = 0;            //  Шанс выбора продолжения из случайной клетки(%)

let speed = 1;           // Скорость генерации (кол-во клеток обрабатываемых каждый кадр), 0 < speed <= columns * rows

const randomStartPoint = true,              //  True - клетка начала генерации задаётся случайно, False - координаты задаются следующими переменными
    startPointX = Math.floor(columns / 2),  // Стартовый столбец
    startPointY = Math.floor(rows / 2);     // Стартовый ряд


const stroke = '#000000',   //  Цвет границ
    fill = '#ffffff',       //  Цвет заливки
    WIP = '#DF8191',        //  Цвет обрабатываемых клеток
    start = '#c62323',      //  Цвет входа
    finish = '#75c663',     //  Цвет выхода
    player = '#1D1D1D';     //  Цвет игрока

//------------------------------      Глобальные переменные      ----------------------------------

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');


function Cell(x, y) {
    this.column = x;
    this.row = y;

    this.visited = false;

    this.north = true;
    this.south = true;
    this.west = true;
    this.east = true;

    this.pathToNorth = false;
    this.pathToSouth = false;
    this.pathToWest = false;
    this.pathToEast = false;

    if (x == 0) {
        if (y == 0) {
            this.unvisitedNeighbours = 2;
            this.north = false;
            this.west = false;
        } else {
            if (y == rows - 1) {
                this.unvisitedNeighbours = 2;
                this.south = false;
                this.west = false;
            } else {
                this.unvisitedNeighbours = 3;
                this.west = false;
            }
        }
    } else {
        if (x == columns - 1) {
            if (y == 0) {
                this.unvisitedNeighbours = 2;
                this.north = false;
                this.east = false;
            } else {
                if (y == rows - 1) {
                    this.unvisitedNeighbours = 2;
                    this.south = false;
                    this.east = false;
                } else {
                    this.unvisitedNeighbours = 3;
                    this.east = false;
                }
            }
        } else {
            if (y == 0) {
                this.unvisitedNeighbours = 3;
                this.north = false;
            } else {
                if (y == rows - 1) {
                    this.unvisitedNeighbours = 3;
                    this.south = false;
                } else {
                    this.unvisitedNeighbours = 4;
                }
            }
        }
    }

}

function Pos(x, y) {
    this.x = x;
    this.y = y;
}

let cells = [];
let wip = [];
let processed = 0;
let total = columns * rows;
let posInWIP;
let startPos = new Pos(0, 0);
let finishPos = new Pos(0, 0);
let playerPos = new Pos(0, 0);
let step = 1;

//------------------------------         Тело программы          ----------------------------------


function setup() {

    if (maxSize) {
        columns = Math.floor(window.innerWidth / a) - 1;
        rows = Math.floor(window.innerHeight / a) - 1 - Math.floor(30 / a);
        total = columns * rows;
    }
    canvas.width = a * columns + 2;
    canvas.height = a * rows + 2 + 30;

    context.strokeRect(0, 0, canvas.width, canvas.height - 30);

    drawGrid();

    if (randomStartPoint) {
        setWIP(cells[getRandomInt(columns)][getRandomInt(rows)]);
    } else {
        setWIP(cells[startPointX][startPointY]);
    }

    draw();
}


function draw() {
    context.fillRect(0, rows * a + 2, canvas.width, 30);
    context.textAlign = 'center';

    context.font = 'bold 20px sans-serif';
    context.fillStyle = stroke;
    context.fillText(`Speed: ${speed}`, Math.floor(canvas.width / 2), rows * a + 20, 100);
    context.fillStyle = fill;

    for (let i = 0; i < speed; i++) {
        if ((total == processed) && (wip.length == 1)) {
            deleteWIP(0);
            setStart();
            setFinish();
            createPlayer();
            context.fillStyle = fill;

            context.fillRect(0, rows * a + 2, canvas.width, 30);
            play();

            return;
        }
        let currentCell = chooseCell(newest, random);
        if (currentCell.unvisitedNeighbours > 0) {
            makePathFrom(currentCell);
        } else {
            deleteWIP(posInWIP);
        }
    }
    requestAnimationFrame(draw);
}
/*eslint no-alert: 'off'*/
function play() {
    drawPlayer();
    if ((playerPos.x == finishPos.x) && (playerPos.y == finishPos.y)) {
        alert('You win!');
        return;
    }
    requestAnimationFrame(play);
}

setup();


//------------------------------             Функции             ----------------------------------

document.addEventListener('keydown', movePlayer);
document.addEventListener('keydown', changeSpeed);
document.addEventListener('keydown', changeSpeedStep);

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function drawGrid() {
    context.strokeStyle = stroke;
    for (let i = 0; i < columns; i++) {
        cells.push([]);
        for (let j = 0; j < rows; j++) {
            context.strokeRect(i * a + 1, j * a + 1, a, a);
            cells[i][j] = new Cell(i, j);
        }
    }
}

function setWIP(c) {
    c.visited = true;
    if (c.row > 0) {
        cells[c.column][c.row - 1].south = false;
        cells[c.column][c.row - 1].unvisitedNeighbours--;
    }
    if (c.row < rows - 1) {
        cells[c.column][c.row + 1].north = false;
        cells[c.column][c.row + 1].unvisitedNeighbours--;
    }
    if (c.column > 0) {
        cells[c.column - 1][c.row].east = false;
        cells[c.column - 1][c.row].unvisitedNeighbours--;
    }
    if (c.column < columns - 1) {
        cells[c.column + 1][c.row].west = false;
        cells[c.column + 1][c.row].unvisitedNeighbours--;
    }

    wip.push(c);
    processed++;

    context.fillStyle = WIP;
    context.fillRect((c.column * a) + 2, (c.row * a) + 2, a - 2, a - 2);
    context.fillStyle = fill;
}

function deleteWIP(c) {
    context.fillRect((wip[c].column * a) + 2, (wip[c].row * a) + 2, a - 2, a - 2);
    if (wip[c].pathToNorth) {
        context.fillRect((wip[c].column * a) + 2, (wip[c].row * a), a - 2, 2);
    }
    if (wip[c].pathToSouth) {
        context.fillRect((wip[c].column * a) + 2, (wip[c].row * a) + a, a - 2, 2);
    }
    if (wip[c].pathToWest) {
        context.fillRect((wip[c].column * a), (wip[c].row * a) + 2, 2, a - 2);
    }
    if (wip[c].pathToEast) {
        context.fillRect((wip[c].column * a) + a, (wip[c].row * a) + 2, 2, a - 2);
    }

    wip.splice(posInWIP, 1);
}

function chooseCell(newest, random) {
    if (getRandomInt(newest + random) < random) {
        posInWIP = getRandomInt(wip.length);
        return wip[posInWIP];
    } else {
        posInWIP = wip.length - 1;
        return wip[posInWIP];
    }
}

function makePathFrom(currentCell) {
    switch (chooseDirection(currentCell)) {
        case 0:
            pathToNorth(currentCell);
            currentCell.north = false;
            currentCell.pathToNorth = true;
            cells[currentCell.column][currentCell.row - 1].pathToSouth = true;
            setWIP(cells[currentCell.column][currentCell.row - 1]);
            break;
        case 1:
            pathToSouth(currentCell);
            currentCell.south = false;
            currentCell.pathToSouth = true;
            cells[currentCell.column][currentCell.row + 1].pathToNorth = true;
            setWIP(cells[currentCell.column][currentCell.row + 1]);
            break;
        case 2:
            pathToWest(currentCell);
            currentCell.west = false;
            currentCell.pathToWest = true;
            cells[currentCell.column - 1][currentCell.row].pathToEast = true;
            setWIP(cells[currentCell.column - 1][currentCell.row]);
            break;
        case 3:
            pathToEast(currentCell);
            currentCell.east = false;
            currentCell.pathToEast = true;
            cells[currentCell.column + 1][currentCell.row].pathToWest = true;
            setWIP(cells[currentCell.column + 1][currentCell.row]);
            break;
    }
}


function chooseDirection(currentCell) {
    let dir;
    dir = getRandomInt(currentCell.unvisitedNeighbours) + 1;

    if (currentCell.north) {
        dir--;
        if (dir == 0) {
            return 0;
        }
    }
    if (currentCell.south) {
        dir--;
        if (dir == 0) {
            return 1;
        }
    }
    if (currentCell.west) {
        dir--;
        if (dir == 0) {
            return 2;
        }
    }
    if (currentCell.east) {
        dir--;
        if (dir == 0) {
            return 3;
        }
    }
    return 0;
}

function pathToNorth(currentCell) {
    context.fillStyle = WIP;
    context.fillRect((currentCell.column * a) + 2, (currentCell.row * a), a - 2, 2);
    context.fillStyle = fill;
}

function pathToSouth(currentCell) {
    context.fillStyle = WIP;
    context.fillRect((currentCell.column * a) + 2, (currentCell.row * a) + a, a - 2, 2);
    context.fillStyle = fill;
}

function pathToWest(currentCell) {
    context.fillStyle = WIP;
    context.fillRect((currentCell.column * a), (currentCell.row * a) + 2, 2, a - 2);
    context.fillStyle = fill;
}

function pathToEast(currentCell) {
    context.fillStyle = WIP;
    context.fillRect((currentCell.column * a) + a, (currentCell.row * a) + 2, 2, a - 2);
    context.fillStyle = fill;
}

function setStart() {
    context.fillStyle = start;

    for (let j = 1; j < rows; j++) {
        let paths = 0;
        if (cells[0][j].pathToNorth) {
            paths++;
        }
        if (cells[0][j].pathToSouth) {
            paths++;
        }
        if (cells[0][j].pathToWest) {
            paths++;
        }
        if (cells[0][j].pathToEast) {
            paths++;
        }
        if (paths == 1) {
            context.fillRect((cells[0][j].column * a) + 2, (cells[0][j].row * a) + 2, a - 2, a - 2);
            startPos.x = cells[0][j].column;
            startPos.y = cells[0][j].row;
            return;
        }
    }

    for (let i = 1; i < columns; i++) {
        let paths = 0;
        if (cells[i][0].pathToNorth) {
            paths++;
        }
        if (cells[i][0].pathToSouth) {
            paths++;
        }
        if (cells[i][0].pathToWest) {
            paths++;
        }
        if (cells[i][0].pathToEast) {
            paths++;
        }
        if (paths == 1) {
            context.fillRect((cells[i][0].column * a) + 2, (cells[i][0].row * a) + 2, a - 2, a - 2);
            startPos.x = cells[i][0].column;
            startPos.y = cells[i][0].row;
            return;
        }
    }
}

function setFinish() {
    context.fillStyle = finish;

    for (let j = rows - 2; j >= 0; j--) {
        let paths = 0;
        if (cells[columns - 1][j].pathToNorth) {
            paths++;
        }
        if (cells[columns - 1][j].pathToSouth) {
            paths++;
        }
        if (cells[columns - 1][j].pathToWest) {
            paths++;
        }
        if (cells[columns - 1][j].pathToEast) {
            paths++;
        }
        if (paths == 1) {
            context.fillRect((cells[columns - 1][j].column * a) + 2, (cells[columns - 1][j].row * a) + 2, a - 2, a - 2);
            finishPos.x = cells[columns - 1][j].column;
            finishPos.y = cells[columns - 1][j].row;
            return;
        }
    }

    for (let i = columns - 2; i >= 0; i--) {
        let paths = 0;
        if (cells[i][rows - 1].pathToNorth) {
            paths++;
        }
        if (cells[i][rows - 1].pathToSouth) {
            paths++;
        }
        if (cells[i][rows - 1].pathToWest) {
            paths++;
        }
        if (cells[i][rows - 1].pathToEast) {
            paths++;
        }
        if (paths == 1) {
            context.fillRect((cells[i][rows - 1].column * a) + 2, (cells[i][rows - 1].row * a) + 2, a - 2, a - 2);
            finishPos.x = cells[i][rows - 1].column;
            finishPos.y = cells[i][rows - 1].row;
            return;
        }
    }
}

function createPlayer() {
    playerPos.x = startPos.x;
    playerPos.y = startPos.y;
}

function drawPlayer() {

    context.beginPath();
    context.fillStyle = player;
    context.arc(playerPos.x * a + Math.round(a / 2) + 1, playerPos.y * a + Math.round(a / 2) + 1, Math.floor(a / 4), 0, Math.PI * 2);
    context.fill();
    context.closePath();
}

function movePlayer(e) {
    if ((e.code == 'ArrowUp') && (cells[playerPos.x][playerPos.y].pathToNorth)) {
        if ((playerPos.x == startPos.x) && (playerPos.y == startPos.y)) {
            context.fillStyle = start;
            context.fillRect((playerPos.x * a) + 2, (playerPos.y * a) + 2, a - 2, a - 2);
        } else {
            context.fillStyle = fill;
            context.fillRect((playerPos.x * a) + 2, (playerPos.y * a) + 2, a - 2, a - 2);
        }
        playerPos.y--;
    }

    if ((e.code == 'ArrowDown') && (cells[playerPos.x][playerPos.y].pathToSouth)) {
        if ((playerPos.x == startPos.x) && (playerPos.y == startPos.y)) {
            context.fillStyle = start;
            context.fillRect((playerPos.x * a) + 2, (playerPos.y * a) + 2, a - 2, a - 2);
        } else {
            context.fillStyle = fill;
            context.fillRect((playerPos.x * a) + 2, (playerPos.y * a) + 2, a - 2, a - 2);
        }
        playerPos.y++;
    }

    if ((e.code == 'ArrowLeft') && (cells[playerPos.x][playerPos.y].pathToWest)) {
        if ((playerPos.x == startPos.x) && (playerPos.y == startPos.y)) {
            context.fillStyle = start;
            context.fillRect((playerPos.x * a) + 2, (playerPos.y * a) + 2, a - 2, a - 2);
        } else {
            context.fillStyle = fill;
            context.fillRect((playerPos.x * a) + 2, (playerPos.y * a) + 2, a - 2, a - 2);
        }
        playerPos.x--;
    }

    if ((e.code == 'ArrowRight') && (cells[playerPos.x][playerPos.y].pathToEast)) {
        if ((playerPos.x == startPos.x) && (playerPos.y == startPos.y)) {
            context.fillStyle = start;
            context.fillRect((playerPos.x * a) + 2, (playerPos.y * a) + 2, a - 2, a - 2);
        } else {
            context.fillStyle = fill;
            context.fillRect((playerPos.x * a) + 2, (playerPos.y * a) + 2, a - 2, a - 2);
        }
        playerPos.x++;
    }
}

function changeSpeedStep(e) {
    if (Number(e.key) >= 0 && Number(e.key) <= 9) {
        step = Number(e.key);
    }
}

function changeSpeed(e) {
    if (e.code == 'Equal') {
        speed += step;
    }
    if ((e.code == 'Minus') && (speed > 1)) {
        speed -= step;
    }
}
