function addListeners(inputStates, canvas) {
    //add the listener to the main, window object, and update the states
    window.addEventListener('keydown', function (event) {
        if (event.keyCode === 37 || event.keyCode === 65) {
            inputStates.left = true;
        } else if (event.keyCode === 38 || event.keyCode === 87) {
            inputStates.up = true;
        } else if (event.keyCode === 39 || event.keyCode === 68) {
            inputStates.right = true;
        } else if (event.keyCode === 40 || event.keyCode === 83) {
            inputStates.down = true;
        } else if (event.keyCode === 32) {
            inputStates.space = true;
        } else if (event.keyCode === 70) {
            inputStates.wipes = true;
        } else if (event.keyCode === 82) {
            inputStates.restart = true;
        } else if (event.keyCode === 27) {
            inputStates.pause =  !inputStates.pause;
        } 
    }, false);

    //if the key will be released, change the states object 
    window.addEventListener('keyup', function (event) {
        if (event.keyCode === 37 || event.keyCode === 65) {
            inputStates.left = false;
        } else if (event.keyCode === 38 || event.keyCode === 87) {
            inputStates.up = false;
        } else if (event.keyCode === 39 || event.keyCode === 68) {
            inputStates.right = false;
        } else if (event.keyCode === 40 || event.keyCode === 83) {
            inputStates.down = false;
        } else if (event.keyCode === 32) {
            inputStates.space = false;
        } else if (event.keyCode === 70) {
            inputStates.wipes = false;
        } else if (event.keyCode === 82) {
            inputStates.restart = false;
        } 
    }, false);

    // Mouse event listeners
    canvas.addEventListener('mousemove', function (evt) {
        inputStates.mousePos = getMousePos(evt, canvas);
    }, false);

    canvas.addEventListener('mousedown', function (evt) {
        inputStates.mousedown = true;
        inputStates.mouseButton = evt.button;
    }, false);

    canvas.addEventListener('mouseup', function (evt) {
        inputStates.mousedown = false;
    }, false);
}

function getMousePos(evt, canvas) {
    // necessary to take into account CSS boudaries
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
