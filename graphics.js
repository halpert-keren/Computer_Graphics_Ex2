/**
 * Computer Graphics Course - Homework Exercise 1
 * @author: Danit Noa Yechezkel (203964036)
 * @author: Dekel Menashe (311224117)
 * @author: Keren Halpert (313604621)
 */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const clearBtn = document.getElementById('clear');
const loadBtn = document.getElementById('load');
const undoBtn = document.getElementById('undo');
const translateBtn = document.getElementById('translate');
const HMirrorBtn = document.getElementById('h-mirror');
const VMirrorBtn = document.getElementById('v-mirror');
const rotateBtn = document.getElementById('rotate');
const shearBtn = document.getElementById('shear');
const helpTxt = document.getElementById('help');

let mode = 'translate'
let drawingCoordinates = []
let oldCoordinates = []
let x1 = 0
let y1 = 0

let maxPointX = 0
let minPointX = 800
let maxPointY = 0
let minPointY = 450

/**
 * Draws a line between {x1, y1} and {x2, y2} using the DDA line algorithm
 */
const myLine = (x1, y1, x2, y2) => {
    let range = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    let dx = (x2 - x1) / range;
    let dy = (y2 - y1) / range;

    let x = x1;
    let y = y1;

    for (let i = 0; i < range; i++) {
        ctx.fillRect(Math.round(x), Math.round(y), 1, 1)
        x += dx;
        y += dy;
    }
}

/**
 * Draws a circle with the center at {x1, y1} and the radius of {r}
 */
const myCircle = (x1, y1, r) => {
    let x = 0
    let y = r
    let p = 3 - 2 * x

    while (x < y) {
        ctx.fillRect(x + x1, y + y1, 1, 1)
        ctx.fillRect(y + x1, x + y1, 1, 1)
        ctx.fillRect(-x + x1, y + y1, 1, 1)
        ctx.fillRect(-y + x1, x + y1, 1, 1)
        ctx.fillRect(-x + x1, -y + y1, 1, 1)
        ctx.fillRect(-y + x1, -x + y1, 1, 1)
        ctx.fillRect(x + x1, -y + y1, 1, 1)
        ctx.fillRect(y + x1, -x + y1, 1, 1)

        if (p < 0) {
            p = p + 4 * x + 6
        } else {
            p = p + 4 * (x - y) + 10
            y--
        }
        x++
    }
}

/**
 * Draws a Bezier curve starting at {x1, y1} and ending at {x4, y4}
 * with two control points: {x2, y2} and {x3, y3}
 */
const myCurve = (x1, y1, x2, y2, x3, y3, x4, y4) => {
    const aX = -x1 + 3 * x2 - 3 * x3 + x4
    const aY = -y1 + 3 * y2 - 3 * y3 + y4

    const bX = 3 * x1 - 6 * x2 + 3 * x3
    const bY = 3 * y1 - 6 * y2 + 3 * y3

    const cX = -3 * x1 + 3 * x2
    const cY = -3 * y1 + 3 * y2

    const dX = x1
    const dY = y1

    const accuracy = 1 / 40
    let oldX = x1
    let oldY = y1

    for (let t = 0; t <= 1; t += accuracy) {
        const newX = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + dX;
        const newY = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + dY;

        myLine(oldX, oldY, newX, newY)

        oldX = newX
        oldY = newY
    }
}

/**
 * Translate the image according to specific point {x1, y1} and {x2, y2}
 */
const translateImg = (x1, y1, x2, y2) => {
    const tX = (x2 - x1)
    const tY = (y2 - y1)

    for (let i = 0; i < drawingCoordinates.length; i++) {
        if (drawingCoordinates[i].length === 3) {
            drawingCoordinates[i][0] += tX
            drawingCoordinates[i][1] += tY
        } else {
            for (let j = 0; j < drawingCoordinates[i].length; j++) {
                if (j % 2 === 0)
                    drawingCoordinates[i][j] += tX
                else
                    drawingCoordinates[i][j] += tY
            }
        }
    }
    createDrawing()
}

/**
 * Scale the image by {t} value
 */
const scaleImg = (t) => {
    for (let i = 0; i < drawingCoordinates.length; i++)
        for (let j = 0; j < drawingCoordinates[i].length; j++)
            drawingCoordinates[i][j] *= t
    createDrawing()
}

/**
 * Mirror the image according to the direction provided (horizontal or vertical)
 */
const mirrorImg = (dir) => {
    let centerPoint = dir === 'h' ? (maxPointX + minPointX) : (maxPointY + minPointY)
    let k = dir === 'h' ? 0 : 1

    for (let i = 0; i < drawingCoordinates.length; i++) {
        if (drawingCoordinates[i].length === 3) {
            drawingCoordinates[i][k] *= -1
            drawingCoordinates[i][k] += (centerPoint)
        } else {
            for (let j = 0; j < drawingCoordinates[i].length; j++) {
                if (dir === 'h' && j % 2 === 0) {
                    drawingCoordinates[i][j] *= -1
                    drawingCoordinates[i][j] += (centerPoint)
                } else if (dir === 'v' && j % 2 !== 0) {
                    drawingCoordinates[i][j] *= -1
                    drawingCoordinates[i][j] += (centerPoint)
                }
            }
        }
    }

    createDrawing()
}

/**
 * Rotate the image according to specific point {x1, y1} and {x2, y2}
 */
const rotateImg = (x1, y1, x2, y2) => {
    let angleRad = Math.atan((y2 - y1) / (x2 - x1))
    let angleDeg = angleRad * 180 / Math.PI
    angleDeg = 1
    console.log(angleDeg)
    let c = Math.cos(angleDeg)
    let s = Math.sin(angleDeg)
    console.log(c, s)

    for (let i = 0; i < drawingCoordinates.length; i++) {
        if (drawingCoordinates[i].length === 3) {
            drawingCoordinates[i][0] = drawingCoordinates[i][0] * c - drawingCoordinates[i][1] * s
            drawingCoordinates[i][1] = drawingCoordinates[i][0] * s + drawingCoordinates[i][1] * c
        } else {
            for (let j = 0; j < drawingCoordinates[i].length; j = j + 2) {
                drawingCoordinates[i][j] = drawingCoordinates[i][j] * c - drawingCoordinates[i][j + 1] * s
                drawingCoordinates[i][j + 1] = drawingCoordinates[i][j] * s + drawingCoordinates[i][j + 1] * c
            }
        }
    }
    createDrawing()
}

/**
 * Shear the image according to the direction provided by point {x1, y1} and {x2, y2}
 */
const shearImg = (x1, y1, x2, y2) => {
    const dir = ((y2 - y1) / (x2 - x1)) > 1 ? 'v' : 'h'
    const tX = (x2 - x1) / 100
    const tY = (y2 - y1) / 100

    if (dir === 'h') {
        for (let i = 0; i < drawingCoordinates.length; i++) {
            if (drawingCoordinates[i].length === 3) {
                drawingCoordinates[i][0] += tX * drawingCoordinates[i][1]
            } else {
                for (let j = 0; j < drawingCoordinates[i].length; j = j + 2)
                    drawingCoordinates[i][j] += tX * drawingCoordinates[i][j + 1]
            }
        }
    } else {
        for (let i = 0; i < drawingCoordinates.length; i++) {
            if (drawingCoordinates[i].length === 3) {
                drawingCoordinates[i][1] += tY * drawingCoordinates[i][0]
            } else {
                for (let j = 1; j <= drawingCoordinates[i].length; j = j + 2)
                    drawingCoordinates[i][j] += tY * drawingCoordinates[i][j - 1]
            }
        }
    }
    createDrawing()
}

/**
 * Undo the last action made
 */
const undoAction = () => {
    for (let i = 0; i < drawingCoordinates.length; i++)
        for (let j = 0; j < drawingCoordinates[i].length; j++) {
            let tmp = drawingCoordinates[i][j]
            drawingCoordinates[i][j] = oldCoordinates[i][j]
            oldCoordinates[i][j] = tmp
        }
    createDrawing()
}

/**
 * Load the image coordinates from a text file
 */
const loadDrawingFile = () => {
    fetch('boat.txt')
        .then(response => response.text())
        .then(text => {
            drawingCoordinates = []
            const lines = text.split('\n')
            for (let i = 0; i < lines.length; i++) {
                const values = lines[i].split(',')
                drawingCoordinates.push([])
                oldCoordinates.push([])
                for (let j = 0; j < values.length; j++) {
                    drawingCoordinates[i].push(parseInt(values[j]))
                    oldCoordinates[i].push(parseInt(values[j]))
                }
            }
            createDrawing()
        })
}

/**
 * Check the min and max values of the drawing to determine the placement
 */
const maxMinCheck = (size, i) => {
    for (let j = 0; j < size; j++) {
        if (j % 2 === 0) {
            maxPointX = maxPointX < drawingCoordinates[i][j] ? drawingCoordinates[i][j] : maxPointX
            minPointX = minPointX > drawingCoordinates[i][j] ? drawingCoordinates[i][j] : minPointX
        } else {
            maxPointY = maxPointY < drawingCoordinates[i][j] ? drawingCoordinates[i][j] : maxPointY
            minPointY = minPointY > drawingCoordinates[i][j] ? drawingCoordinates[i][j] : minPointY
        }
    }
}

/**
 * Create the drawing of the canvas according to the coordinates in {drawingCoordinates} array
 */
const createDrawing = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < drawingCoordinates.length; i++) {
        if (drawingCoordinates[i].length === 3) {
            maxMinCheck(2, i)
            myCircle(drawingCoordinates[i][0], drawingCoordinates[i][1], drawingCoordinates[i][2])
        } else if (drawingCoordinates[i].length === 4) {
            maxMinCheck(4, i)
            myLine(drawingCoordinates[i][0], drawingCoordinates[i][1],
                drawingCoordinates[i][2], drawingCoordinates[i][3])
        } else if (drawingCoordinates[i].length === 8) {
            maxMinCheck(8, i)
            myCurve(drawingCoordinates[i][0], drawingCoordinates[i][1], drawingCoordinates[i][2],
                drawingCoordinates[i][3], drawingCoordinates[i][4], drawingCoordinates[i][5],
                drawingCoordinates[i][6], drawingCoordinates[i][7])
        }
    }
}

/**
 * Remove the selected class for the GUI
 */
const removeSelected = () => {
    translateBtn.classList.remove('selected');
    rotateBtn.classList.remove('selected');
    shearBtn.classList.remove('selected');
}

/**
 * Handles mouse events for the application to work
 */
window.onload = () => {
    loadDrawingFile();
    translateBtn.classList.add('selected');
    helpTxt.innerText = 'Drag the image with the mouse to move the image'

    loadBtn.addEventListener('click', () => {
        loadDrawingFile();
    });
    undoBtn.addEventListener('click', () => {
        undoAction();
    });
    clearBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear the canvas?"))
            ctx.clearRect(0, 0, canvas.width, canvas.height)
    });

    translateBtn.addEventListener('click', () => {
        mode = 'translate'
        helpTxt.innerText = 'Drag the image with the mouse to move the image'
        removeSelected()
        translateBtn.classList.add('selected');
    });
    HMirrorBtn.addEventListener('click', () => {
        mirrorImg('h')
    });
    VMirrorBtn.addEventListener('click', () => {
        mirrorImg('v')
    });
    rotateBtn.addEventListener('click', () => {
        mode = 'rotate'
        helpTxt.innerText = 'Drag the image with the mouse to rotate the image'
        removeSelected()
        rotateBtn.classList.add('selected');
    });
    shearBtn.addEventListener('click', () => {
        mode = 'shear'
        helpTxt.innerText = 'Drag the image with the mouse to shear the image'
        removeSelected()
        shearBtn.classList.add('selected');
    });

    canvas.addEventListener('wheel', (event) => {
        event.preventDefault()
        if (Math.sign(event.deltaY) > 0)
            scaleImg(0.99)
        else
            scaleImg(1.01)
    });

    canvas.addEventListener('mousedown', (event) => {
        for (let i = 0; i < drawingCoordinates.length; i++)
            for (let j = 0; j < drawingCoordinates[i].length; j++)
                oldCoordinates[i][j] = drawingCoordinates[i][j]

        x1 = event.layerX
        y1 = event.layerY
    });

    canvas.addEventListener('mouseup', (event) => {
        if (mode === 'translate') {
            translateImg(x1, y1, event.layerX, event.layerY)
        } else if (mode === 'rotate') {
            rotateImg(x1, y1, event.layerX, event.layerY)
        } else if (mode === 'shear') {
            shearImg(x1, y1, event.layerX, event.layerY)
        }
    });
}