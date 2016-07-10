// Inits
window.onload = function init() {
    var game = new GF();
    game.start();
};

// GAME FRAMEWORK STARTS HERE
var GF = function () {
    // Vars relative to the canvas
    var canvas, ctx, w, h;

    // vars for handling inputs
    var inputStates = {};

    // game states
    var gameStates = {
        mainMenu: 0,
        gameRunning: 1,
        gameOver: 2
    };
    var currentGameState = gameStates.gameRunning;
    var currentLevel = 1;
    var TIME_BETWEEN_LEVELS = 5000; // 5 seconds
    var currentLevelTime = TIME_BETWEEN_LEVELS;
    var points = 0;

    var assets = {};



    // The monster !
    var monster = {
        dead: false,
        x: 10,
        y: 10,
        width: 50,
        height: 50,
        speed: 100 // pixels/s this time !
    };

    // Woman object and sprites
    // sprite index corresponding to posture
    var WOMAN_DIR_RIGHT = 6;
    var WOMAN_DIR_LEFT = 2;
    var woman = {
        x: 100,
        y: 200,
        width: 48,
        speed: 100, // pixels/s this time !
        direction: WOMAN_DIR_RIGHT
    };

    var womanSprites = [];

    // array of balls to animate
    var ballArray = [];
    var nbBalls = 5;

    // array of bullets
    var bulletsArray = [];

    // clears the canvas content
    function clearCanvas() {
        ctx.clearRect(0, 0, w, h);
    }

    // Functions for drawing the monster and maybe other objects
    function drawMyMonster(x, y) {
        // draw a big monster !
        // head

        // save the context
        ctx.save();

        // translate the coordinate system, draw relative to it
        ctx.translate(x, y);
        ctx.scale(0.5, 0.5);

        // (0, 0) is the top left corner of the monster.
        ctx.strokeRect(0, 0, 100, 100);

        // eyes
        ctx.fillRect(20, 20, 10, 10);
        ctx.fillRect(65, 20, 10, 10);

        // nose
        ctx.strokeRect(45, 40, 10, 40);

        // mouth
        ctx.strokeRect(35, 84, 30, 10);

        // teeth
        ctx.fillRect(38, 84, 10, 10);
        ctx.fillRect(52, 84, 10, 10);

        // restore the context
        ctx.restore();
    }


    var mainLoop = function (time) {
        //main function, called each frame 
        measureFPS(time);

        // number of ms since last frame draw
        delta = timer(time);

        // Clear the canvas
        clearCanvas();

        if (monster.dead) {
            currentGameState = gameStates.gameOver;
        }

        switch (currentGameState) {
            case gameStates.gameRunning:

                // draw the monster
                drawMyMonster(monster.x, monster.y);

                // Check inputs and move the monster
                updateMonsterPosition(delta);

                // Draw a woman moving left and right
                womanSprites[woman.direction].draw(ctx, woman.x, woman.y);
                updateWomanPosition(delta);

                // update and draw balls
                updateBalls(delta);

                // shoot
                fire();

                // display Score
                displayScore();

                // decrease currentLevelTime. 
                // When < 0 go to next level
                currentLevelTime -= delta;

                if (currentLevelTime < 0) {
                    goToNextLevel();
                }

                break;
            case gameStates.mainMenu:
                // TO DO !
                break;
            case gameStates.gameOver:
                ctx.fillText("GAME OVER", 50, 100);
                ctx.fillText("Press SPACE to start again", 50, 150);
                ctx.fillText("Move with arrow keys", 50, 200);
                ctx.fillText("Shoot with a double click", 50, 250);
                ctx.fillText("Survive 5 seconds for next level", 50, 300);
                if (inputStates.space) {
                    startNewGame();
                }
                break;
        }

        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
    };

    function startNewGame() {
        monster.dead = false;
        currentLevelTime = 5000;
        currentLevel = 1;
        nbBalls = 5;
        createBalls(nbBalls);
        currentGameState = gameStates.gameRunning;
    }

    function goToNextLevel() {
        // reset time available for next level
        // 5 seconds in this example
        currentLevelTime = 5000;
        currentLevel++;
        // Add two balls per level
        nbBalls += 2;
        createBalls(nbBalls);
    }

    function displayScore() {
        ctx.save();
        ctx.fillStyle = 'Green';
        ctx.fillText("Level: " + currentLevel, 300, 30);
        ctx.fillText("Time: " + (currentLevelTime / 1000).toFixed(1), 300, 60);
        ctx.fillText("Balls: " + nbBalls, 300, 90);
        ctx.fillText("Points: " + points, 300, 120);
        ctx.restore();
    }
    function updateMonsterPosition(delta) {
        monster.speedX = monster.speedY = 0;
        // check inputStates
        if (inputStates.left) {
            monster.speedX = -monster.speed;
        }
        if (inputStates.up) {
            monster.speedY = -monster.speed;
        }
        if (inputStates.right) {
            monster.speedX = monster.speed;
        }
        if (inputStates.down) {
            monster.speedY = monster.speed;
        }
        if (inputStates.space) {
        }
        if (inputStates.mousePos) {
        }
        if (inputStates.mousedown) {
            monster.speed = 500;
        } else {
            // mouse up
            monster.speed = 100;
        }

        // Compute the incX and inY in pixels depending
        // on the time elasped since last redraw
        monster.x += calcDistanceToMove(delta, monster.speedX);
        monster.y += calcDistanceToMove(delta, monster.speedY);
    }

    function updateWomanPosition(delta) {

        // check collision on left or right
        if (((woman.x + woman.width) > canvas.width) || (woman.x < 0)) {
            // inverse speed
            woman.speed = -woman.speed;
        }

        // change sprite direction
        if (woman.speed >= 0) {
            woman.direction = WOMAN_DIR_RIGHT;
        } else {
            woman.direction = WOMAN_DIR_LEFT;
        }
        woman.x += calcDistanceToMove(delta, woman.speed);
    }

    function updateBalls(delta) {
        // Move and draw each ball, test collisions, 
        for (var i = 0; i < ballArray.length; i++) {
            var ball = ballArray[i];

            // 1) move the ball
            ball.move();

            // 2) test if the ball collides with a wall
            testCollisionWithWalls(ball, w, h);

            // Test if the monster collides
            if (circRectsOverlap(monster.x, monster.y,
                monster.width, monster.height,
                ball.x, ball.y, ball.radius)) {

                //change the color of the ball
                ball.color = 'red';
                monster.dead = true;
                // Here, a sound effect greatly improves
                // the experience!
                plopSound.play();
            }

            // 3) draw the ball
            ball.draw(ctx);
        }
    }

    function fire() {
        if (inputStates.fire) {
            console.log("fire");
            inputStates.fire = false;
            x = monster.x + 25;
            y = monster.y + 25;

            // Compute the direction so that the bullet is fired
            // toward the mouse position
            var dx = inputStates.mousePos.x - x;
            var dy = inputStates.mousePos.y - y;
            var angle = Math.atan2(dy, dx);
            var speed = 80;
            var bullet = new Ball(
                x, y, angle, speed,
                10);
            bulletsArray.push(bullet);

        }
        console.log(bulletsArray.length);
        // test collisions between bullets and balls
        var i = bulletsArray.length;
        while (i--) {
            //for (var i = bulletsArray.length -1; i > 0;  i--) {
            var bullet = bulletsArray[i];
            // 1) move the bullet
            bullet.move();
            // 2) test if the ball collides with a wall
            if (circleWallsCollide(bullet, w, h)) {
                console.log("Wall hit");
                bulletsArray.splice(i, 1);
            }
            var j = ballArray.length;
            while (j--) {
                //for (var j = 0; j < ballArray.length; j++) { 
                // Test if the bullet hits one of the balls
                var ball = ballArray[j];
                if (circleCollide(bullet.x, bullet.y,
                    bullet.radius,
                    ball.x, ball.y, ball.radius)) {

                    //change the color of the ball
                    // here draw an explosion
                    bullet.color = 'yellow';
                    ball.color = 'green';

                    bulletsArray.splice(i, 1);
                    ballArray.splice(j, 1);
                    points += 1;

                    // Here, a sound effect greatly improves
                    // the experience!, change this with a different from plop
                    plopSound.play();
                }

                // 3) draw the ball
                bullet.draw(ctx);
            }
        }
    }

    function createBalls(numberOfBalls) {
        // Start from an empty array
        ballArray = [];

        for (var i = 0; i < numberOfBalls; i++) {
            // Create a ball with random position and speed. 
            // You can change the radius
            var ball = new Ball(w * Math.random(),
                h * Math.random(),
                (2 * Math.PI) * Math.random(),
                (80 * Math.random()),
                30);

            // Do not create a ball on the player. We augmented the ball radius 
            // to sure the ball is created far from the monster. 
            if (!circRectsOverlap(monster.x, monster.y,
                monster.width, monster.height,
                ball.x, ball.y, ball.radius * 3)) {
                // Add it to the array
                ballArray[i] = ball;
            } else {
                i--;
            }


        }
    }


    function allAssetsLoaded(assetsLoaded) {
        /* Adapted from mainline.i3s.unice.fr/mooc/SkywardBound/ */
        plopSound = assetsLoaded.plop;

        var SPRITE_WIDTH = 48;
        var SPRITE_HEIGHT = 92;
        var NB_POSTURES = 8;
        var NB_FRAMES_PER_POSTURE = 13;

        for (var i = 0; i < NB_POSTURES; i++) {
            var sprite = new Sprite();

            sprite.extractSprites(assetsLoaded.spriteSheet, NB_POSTURES, (i + 1),
                NB_FRAMES_PER_POSTURE,
                SPRITE_WIDTH, SPRITE_HEIGHT);
            sprite.setNbImagesPerSecond(20);
            womanSprites[i] = sprite;
        }

    };


    var start = function () {
        initFPSCounter();

        // Canvas, context etc.
        canvas = document.querySelector("#myCanvas");

        // often useful
        w = canvas.width;
        h = canvas.height;

        // important, we will draw with this object
        ctx = canvas.getContext('2d');
        // default police for text
        ctx.font = "20px Arial";

        // Create the different key and mouse listeners
        addListeners(inputStates, canvas);

        // We create tge balls: try to change the parameter
        createBalls(nbBalls);

        loadAssets(function (assets) {
            // all assets (images, sounds) loaded, we can start the animation
            allAssetsLoaded(assets);
            requestAnimationFrame(mainLoop);
        });
    };

    //our GameFramework returns a public API visible from outside its scope
    return {
        start: start
    };
};


