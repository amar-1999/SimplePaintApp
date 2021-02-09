window.onload = function () {

    var canvas = document.getElementById("theCanvas");
    var clearButton = document.getElementById("clear");
    var isActive = false;
    var startCoordinates = null;
    var endCoordinates = null;
    var context = canvas.getContext("2d");
    var dataPool = [];
    var flag = false;
    var draggedTriIndex = 0;
    var randomRGB = null;
    var changeDistance = {
        x: 0,
        y: 0
    };

//Listener for deleting with double click.
    canvas.addEventListener('dblclick', function (e) {

        var pos = getMousePositions(canvas, e);
        dataPool.forEach(function (value) {
            var Area = findArea(value[0][0], value[0][1], value[1][0], value[1][1], value[2][0], value[2][1]);
            var Area1 = findArea(value[0][0], value[0][1], pos.x, pos.y, value[2][0], value[2][1]);
            var Area2 = findArea(value[0][0], value[0][1], value[1][0], value[1][1], pos.x, pos.y);
            var Area3 = findArea(pos.x, pos.y, value[1][0], value[1][1], value[2][0], value[2][1]);
            if (Math.round(Area) === Math.round(Area1 + Area2 + Area3)) {
                var newList = [];
                var item = dataPool[dataPool.indexOf(value)];
                dataPool.forEach(function (value2) {
                    if (value2 !== item) {
                        newList.push(value2);
                    }
                });
                dataPool = newList;
                clearCanvas();
                dataPool.forEach(function (value2) {
                    reDrawTriangles(value2[0][0], value2[0][1], value2[4], value2[3]);
                });
                return true;
            }
        });
        isActive = false;

    });

//Mousedown Listener
canvas.addEventListener('mousedown', function (e) {
    canvas.style.cursor = 'move';
    e.preventDefault();
    var mousePos = getMousePositions(canvas, e);
    startCoordinates = mousePos;
    endCoordinates = mousePos;
    isActive = true;
    flag = checkIfInside(mousePos);
    startCoordinates = mousePos;
    endCoordinates = mousePos;
    randomRGB = "rgb(" + Math.ceil(Math.random()*256) + "," + Math.floor(Math.random()*256) + "," + Math.floor(Math.random()*256) +")";
    if (dataPool.length > 0) {
        changeDistance.x = dataPool[draggedTriIndex][0][0] - mousePos.x;
        changeDistance.y = dataPool[draggedTriIndex][0][1] - mousePos.y
    }
    console.log(changeDistance);
});


//Movement listener
    canvas.addEventListener('mousemove', function (e) {

        endCoordinates = getMousePositions(canvas, e);

        if (isActive && flag) {
            clearCanvas();
            canvas.style.cursor = 'ne-resize';
            reDrawTriangles(startCoordinates.x, startCoordinates.y, calculateLineDistance(startCoordinates.x, startCoordinates.y, endCoordinates.x, endCoordinates.y), randomRGB);
            dataPool.forEach(function (value) {
                reDrawTriangles(value[0][0], value[0][1], value[4], value[3]);
            });
        } else if (isActive) {
            canvas.style.cursor = 'crosshair';
            clearCanvas();
            var item = dataPool[draggedTriIndex];
            var difX = endCoordinates.x - item[0][0] + changeDistance.x;
            var difY = endCoordinates.y - item[0][1] + changeDistance.y;
            item[0][0] += difX;
            item[0][1] += difY;
            item[1][0] += difX;
            item[1][1] += difY;
            item[2][0] += difX;
            item[2][1] += difY;
            reDrawTriangles(item[0][0], item[0][1], item[4], item[3]);
            dataPool.forEach(function (value) {
                if (value[0][0] !== startCoordinates.x && value[0][1] !== startCoordinates.y) {
                    reDrawTriangles(value[0][0], value[0][1], value[4], value[3]);
                }
            });
        }

    }, true);

//Click and Release Listener.
    canvas.addEventListener('mouseup', function (e) {
        canvas.style.cursor = 'pointer';
        var mousePos = getMousePositions(canvas, e);
        if (!flag) {
            isActive = false;
            flag = false;
            doDragTranslation(mousePos.x, mousePos.y);
        } else if (isActive && calculateLineDistance(startCoordinates.x, startCoordinates.y, endCoordinates.x, endCoordinates.y) > 2) {
            isActive = false;
            flag = false;
            // To get end mouse position
            endCoordinates = mousePos;
            drawTriangle(1, startCoordinates.x, startCoordinates.y, endCoordinates.x, endCoordinates.y);
        }

    });

//Clear button
    clearButton.addEventListener('click', function () {

        dataPool = [];
        clearCanvas();

    });

    //To check Whether the mouse is inside the triangle.
    function checkIfInside(pos) {

        flag = true;
        dataPool.forEach(function (value) {
            var Area = findArea(value[0][0], value[0][1], value[1][0], value[1][1], value[2][0], value[2][1]);
            var Area1 = findArea(value[0][0], value[0][1], pos.x, pos.y, value[2][0], value[2][1]);
            var Area2 = findArea(value[0][0], value[0][1], value[1][0], value[1][1], pos.x, pos.y);
            var Area3 = findArea(pos.x, pos.y, value[1][0], value[1][1], value[2][0], value[2][1]);
            if (Math.round(Area) === Math.round(Area1 + Area2 + Area3)) {
                draggedTriIndex = dataPool.indexOf(value);
                flag = false;
                return true;
            }
        });
        return flag;

    }

    function findArea(x1, y1, x2, y2, x3, y3) {

        return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0);

    }


// To do translation.
    function doDragTranslation(newx, newy) {

        var item = dataPool[draggedTriIndex];
        var difX = newx - item[0][0] + changeDistance.x;
        var difY = newy - item[0][1] + changeDistance.y;
        item[0][0] += difX;
        item[0][1] += difY;
        item[1][0] += difX;
        item[1][1] += difY;
        item[2][0] += difX;
        item[2][1] += difY;
        dataPool.splice(draggedTriIndex, 0, item);
        clearCanvas();
        dataPool.forEach(function (value) {
            reDrawTriangles(value[0][0], value[0][1], value[4], value[3]);
        });

    }

    function clearCanvas() {

        context.clearRect(0, 0, canvas.width, canvas.height);

    }

// To get current mouse position
    function getMousePositions(canvas, event) {

        var bounds = canvas.getBoundingClientRect();
        return {

            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top

        };

    }

    function calculateLineDistance(x1, y1, x2, y2) {

        return Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));

    }

    function reDrawTriangles(x1, y1, distance, color) {

        //height of triangle
        var height = distance * (Math.sqrt(3)/2);
        //To make a path
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x1 + distance / 2, y1 + height);
        context.lineTo(x1 - distance / 2, y1 + height);
        context.moveTo(x1, y1);
        context.fillStyle = color;
        context.fill();
        context.stroke();

    }

    function drawTriangle(temp, x1, y1, x2, y2) {

        //to get distance
        var distance = calculateLineDistance(x1, y1, x2, y2);
        //height of triangle
        var height = distance*(Math.sqrt(3)/2)* temp;
        //To make Path
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x1 + distance / 2, y1 + height);
        context.lineTo(x1 - distance / 2, y1 + height);
        context.moveTo(x1, y1);
        context.fillStyle = randomRGB;
        context.fill();
        context.stroke();
        dataPool.push([[x1, y1], [x1 + distance/2, y1 + height*1.25], [x1 - distance/2, y1 + height*1.25], [context.fillStyle], [distance]]);

    }
};
