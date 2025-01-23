const BLOCK_SIZE = 30;
const COLS = 10;
const ROWS = 20;
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');

// 七种方块形状
const TETROMINOES = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[1,1,1],[0,1,0]], // T
    [[1,1,0],[0,1,1]], // S
    [[0,1,1],[1,1,0]], // Z
    [[1,0,0],[1,1,1]], // J
    [[0,0,1],[1,1,1]] // L
];

let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentPiece = null;
let currentPiecePos = {x: 0, y: 0};
let score = 0;
let gameLoop;
let isGameOver = false;

function createPiece() {
    const typeIdx = Math.floor(Math.random() * 7);
    const shape = TETROMINOES[typeIdx];
    return {
        shape: shape,
        type: typeIdx
    };
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制已落下方块
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
    
    // 绘制当前方块
    if (currentPiece) {
        currentPiece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    drawBlock(
                        currentPiecePos.x + dx,
                        currentPiecePos.y + dy,
                        getColorClass(currentPiece.type)
                    );
                }
            });
        });
    }
}

function isValidMove(piece, pos) {
    return piece.shape.every((row, dy) => 
        row.every((value, dx) => {
            let newX = pos.x + dx;
            let newY = pos.y + dy;
            return (
                value === 0 ||
                (newX >= 0 && newX < COLS &&
                 newY < ROWS &&
                 !board[newY]?.[newX])
            );
        })
    );
}

// function rotatePiece() {
//     const rotated = currentPiece.shape[0].map((_, i) =>
//         currentPiece.shape.map(row => row[i]).reverse()
//     );
//     rotated.forEach(row => row.reverse()); // 修复旋转方向
//     const previousShape = currentPiece.shape;
//     currentPiece.shape = rotated;
//     if (!isValidMove(currentPiece, currentPiecePos)) {
//         currentPiece.shape = previousShape;
//     }
// }

function rotatePiece() {
    const rotated = rotateMatrix(currentPiece.shape);
    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;
    if (!isValidMove(currentPiece, currentPiecePos)) {
        currentPiece.shape = previousShape;
    }
}

/**
 * 旋转一个二维数组（顺时针90度）
 * @param {Array<Array>} matrix - 输入的二维数组
 * @returns {Array<Array>} - 旋转后的二维数组
 */
function rotateMatrix(matrix) {
    // 获取矩阵的行数和列数
    const rows = matrix.length;
    const cols = matrix[0].length;

    // 创建一个新的数组来存储旋转后的结果
    const rotated = new Array(cols).fill().map(() => new Array(rows).fill(0));

    // 旋转逻辑
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            rotated[j][rows - 1 - i] = matrix[i][j];
        }
    }

    return rotated;
}

function mergePiece() {
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                board[currentPiecePos.y + dy][currentPiecePos.x + dx] = 
                    getColorClass(currentPiece.type);
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    if (linesCleared) {
        score += linesCleared * 100;
        scoreElement.textContent = score;
    }
}

function gameOver() {
    clearInterval(gameLoop);
    isGameOver = true;
    gameOverElement.style.display = 'block';
}

function update() {
    currentPiecePos.y++;
    if (!isValidMove(currentPiece, currentPiecePos)) {
        currentPiecePos.y--;
        mergePiece();
        clearLines();
        currentPiece = createPiece();
        currentPiecePos = {
            x: Math.floor(COLS/2 - currentPiece.shape[0].length/2),
            y: 0
        };
        if (!isValidMove(currentPiece, currentPiecePos)) {
            gameOver();
        }
    }
    drawBoard();
}

document.addEventListener('keydown', (e) => {
    if (isGameOver) {
        if (e.key === 'r') {
            location.reload();
        }
        return;
    }

    switch(e.key) {
        case 'a':
            currentPiecePos.x--;
            if (!isValidMove(currentPiece, currentPiecePos)) currentPiecePos.x++;
            break;
        case 'd':
            currentPiecePos.x++;
            if (!isValidMove(currentPiece, currentPiecePos)) currentPiecePos.x--;
            break;
        case 's':
            currentPiecePos.y++;
            if (!isValidMove(currentPiece, currentPiecePos)) currentPiecePos.y--;
            break;
        case 'w':
            rotatePiece();
            break;
        case ' ':
            while(isValidMove(currentPiece, currentPiecePos)) {
                currentPiecePos.y++;
            }
            currentPiecePos.y--;
            update();
            break;
    }
    drawBoard();
});

// 获取颜色类名
function getColorClass(type) {
    const colors = [
        '#00f0f0', // I
        '#f0f000', // O
        '#a000f0', // T 
        '#00f000', // S
        '#f00000', // Z
        '#0000f0', // J
        '#f0a000'  // L
    ];
    return colors[type];
}

// 初始化游戏
function init() {
    currentPiece = createPiece();
    currentPiecePos = {
        x: Math.floor(COLS/2 - currentPiece.shape[0].length/2),
        y: 0
    };
    gameLoop = setInterval(update, 1000);
}

init();

/* play audio in the game, to do Next:
// 音效对象
const sounds = {
    move: new Audio('assets/move.mp3'),
    rotate: new Audio('assets/rotate.mp3'),
    clear: new Audio('assets/clear.mp3'),
    gameOver: new Audio('assets/game-over.mp3')
};

// 预加载音效
function preloadSounds() {
    for (const key in sounds) {
        sounds[key].load();
    }
}
preloadSounds();

// 播放音效
function playSound(sound) {
    if (sounds[sound]) {
        sounds[sound].currentTime = 0; // 重置音效
        sounds[sound].play().catch(error => {
            console.error('音效播放失败:', error);
        });
    }
}

// 示例：在游戏逻辑中调用音效
document.addEventListener('keydown', (event) => {
    if (event.key === 'a' || event.key === 'A') {
        playSound('move'); // 左移音效
    } else if (event.key === 'd' || event.key === 'D') {
        playSound('move'); // 右移音效
    } else if (event.key === 'w' || event.key === 'W') {
        playSound('rotate'); // 旋转音效
    } else if (event.key === 's' || event.key === 'S') {
        playSound('move'); // 下落音效
    }
});

function clearLines() {
    playSound('clear'); // 消除音效
}

function gameOver() {
    playSound('gameOver'); // 游戏结束音效
}
*/