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
    //var currentGameState = gameStates.gameRunning;
    var currentGameState = gameStates.mainMenu;
    var currentLevel = 1;
    var TIME_BETWEEN_LEVELS = 5000; // 5 seconds
    var POINTS_FOR_WIPES = 20;
    var wipes = 0;
    var wipesCounter = 0;
    var currentLevelTime = TIME_BETWEEN_LEVELS;
    var points = 0;


    var assets = {};

    // audio
    var currentGameTrack = 0;
    var musicPaused = false;


    // player object and sprites
    // sprite index corresponding to posture
    var PLAYER_DIR_RIGHT = 0;
    var PLAYER_DIR_LEFT = 1;

    var PLAYER_SPRITE_WIDTH = 567;
    var PLAYER_SPRITE_HEIGHT = 556;
    var PLAYER_NB_POSTURES = 2;
    var PLAYER_NB_FRAMES_PER_POSTURE = 8;
    var PLAYER_SPRITE_SCALE = 0.15;
    // White space around the true image
    var PLAYER_SPRITE_MARGIN_X = 20;
    var PLAYER_SPRITE_MARGIN_Y = 5;

    var player = {
        dead: false,
        x: 10,
        y: 10,
        width: PLAYER_SPRITE_WIDTH * PLAYER_SPRITE_SCALE,
        height: PLAYER_SPRITE_HEIGHT * PLAYER_SPRITE_SCALE,
        marginX: PLAYER_SPRITE_MARGIN_X,
        marginY: PLAYER_SPRITE_MARGIN_Y,
        speed: 100, // pixels/s this time !
        scale: PLAYER_SPRITE_SCALE, // it depends on the size of the sprite
        direction: PLAYER_DIR_RIGHT
    };

    var playerSprites = [];

    // array of balls to animate
    var ballArray = [];
    var nbBalls = 5;

    // array of bullets
    var bulletsArray = [];

    // clears the canvas content
    function clearCanvas() {
        ctx.clearRect(0, 0, w, h);
    }


    var mainLoop = function (time) {
        //main function, called each frame 
        measureFPS(time);

        // number of ms since last frame draw
        delta = timer(time);

        // Clear the canvas
        clearCanvas();

        if (player.dead) {
            currentGameState = gameStates.gameOver;
        }



        switch (currentGameState) {
            case gameStates.gameRunning:

                if (inputStates.pause) {
                    ctx.save();
                    var initialH = 75;
                    ctx.fillStyle = 'LightGreen';
                    ctx.fillText("GAME PAUSED", 50, initialH);
                    ctx.fillText("Press 'esc' to start again", 50, initialH + 50);
                    ctx.restore();
                    pauseMusic();
                    break;
                }

                if (musicPaused) {
                    currentGameTrack.play();
                    musicPaused = false;
                }
                // Draw the player moving left and right
                playerSprites[player.direction].draw(ctx, player.x, player.y, player.scale);
                updatePlayerPosition(delta);

                // update and draw balls
                updateBalls(delta);

                // shoot
                updateWipes();
                fire();
                updateParticles(delta);
                drawParticles(ctx);

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
                var initialH = 75;
                drawInfo("MAIN MENU", initialH);
                if (inputStates.restart) {
                    startNewGame();
                }
                pauseMusic();
                break;
            case gameStates.gameOver:
                var initialH = 75;
                drawInfo("GAME OVER", initialH);

                if (inputStates.restart) {
                    startNewGame();
                }
                pauseMusic();
                break;


        }

        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
    };

    function startNewGame() {
        player.dead = false;
        currentLevelTime = 5000;
        currentLevel = 1;
        nbBalls = 5;
        points = 0;
        wipes = 0;
        wipesCounter = 0;
        createBalls(nbBalls);
        bulletsArray = []
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
        ctx.fillStyle = 'LightGreen';
        ctx.fillText("Level: " + currentLevel, 300, 30);
        ctx.fillText("Time: " + (currentLevelTime / 1000).toFixed(1), 300, 60);
        ctx.fillText("Balls: " + nbBalls, 300, 90);
        ctx.fillText("Points: " + points, 300, 120);
        ctx.fillText("Wipe: " + wipes, 300, 150);
        ctx.restore();
    }

    function drawInfo(text, initialH) {
        ctx.save();
        ctx.fillStyle = 'LightGreen';
        ctx.fillText(text, 50, initialH);
        ctx.fillText("Press 'r' to start", 50, initialH + 50);
        ctx.fillText("Move with arrow keys or 'w s a d'", 50, initialH + 100);
        ctx.fillText("Shoot with the space bar", 50, initialH + 150);
        ctx.fillText("Wipe with f (one every " + POINTS_FOR_WIPES + " points)", 50, initialH + 200);
        ctx.fillText("Survive 5 seconds for next level", 50, initialH + 250);
        ctx.restore();


    }

    function updatePlayerPosition(delta) {
        player.speedX = player.speedY = 0;
        // check inputStates
        if (inputStates.left) {
            player.speedX = -player.speed;
            player.direction = PLAYER_DIR_LEFT;
        }
        if (inputStates.up) {
            player.speedY = -player.speed;
        }
        if (inputStates.right) {
            player.speedX = player.speed;
            player.direction = PLAYER_DIR_RIGHT;
        }
        if (inputStates.down) {
            player.speedY = player.speed;
        }
        if (inputStates.space) {
        }
        if (inputStates.mousePos) {
        }
        if (inputStates.mousedown) {
            player.speed = 500;
        } else {
            // mouse up
            player.speed = 100;
        }

        // Compute the incX and inY in pixels depending
        // on the time elasped since last redraw
        player.x += calcDistanceToMove(delta, player.speedX);
        player.y += calcDistanceToMove(delta, player.speedY);
    }

    function updateBalls(delta) {
        // Move and draw each ball, test collisions, 
        for (var i = 0; i < ballArray.length; i++) {
            var ball = ballArray[i];

            // 1) move the ball
            ball.move();

            // 2) test if the ball collides with a wall
            testCollisionWithWalls(ball, w, h);

            // Test if the player collides
            if (circRectsOverlap(player.x, player.y,
                player.width, player.height,
                ball.x, ball.y, ball.radius,
                player.marginX, player.marginY)) {

                //change the color of the ball
                ball.color = 'red';
                player.dead = true;
                // Here, a sound effect greatly improves
                // the experience!
                plopSound.play();
            }

            // 3) draw the ball
            ball.draw(ctx);
        }
    }

    function updateWipes() {
        if (wipesCounter === POINTS_FOR_WIPES) {
            wipes += 1
            wipesCounter = 0;
        }
    }


    function fire() {
        // find the relative center of the player
        var xc = player.width / 2;
        var yc = player.height / 2;
        // compute the absolute center of the player
        var x = player.x + xc;
        var y = player.y + yc;
        // Compute the direction so that the bullet is fired
        // toward the mouse position
        if (inputStates.mousePos) {
            var dx = Math.abs(inputStates.mousePos.x - x);
            if (player.direction === PLAYER_DIR_LEFT) {
                dx *= -1;
            }
            var dy = inputStates.mousePos.y - y;
            var angle = Math.atan2(dy, dx);

            drawSights(ctx, x, y, angle);
        }
        if (inputStates.space) {
            console.log("fire");
            inputStates.space = false;
            var speed = 120;
            var bullet = new Ball(
                x, y, angle, speed,
                10, true);
            bulletsArray.push(bullet);
        } else if (inputStates.wipes && (wipes > 0)) {
            console.log("wipe");
            inputStates.wipes = false;
            wipes -= 1;
            var nSuper = 40
            for (var i = 0; i < nSuper; i++) {
                var speed = 200;
                //console.log(2 * Math.PI / nSuper * i);
                var bullet = new Ball(
                    x, y, 2 * Math.PI / nSuper * i, speed,
                    15, true);
                bulletsArray.push(bullet);
            }
        }
        //console.log(bulletsArray.length);

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

                    // here draw an explosion
                    createExplosion(ball.x, ball.y, "red", "Boom!");
                    plopSound.play();

                    bulletsArray.splice(i, 1);
                    ballArray.splice(j, 1);
                    points += 1;
                    wipesCounter += 1;

                    // Here, a sound effect greatly improves
                    // the experience!, change this with a different from plop
                    plopSound.play();
                }

                // 3) draw the ball
                bullet.draw(ctx);
            }
        }
    }

    // To draw a sights moving around the player
    function drawSights(ctx, x, y, angle) {
        ctx.save();
        ctx.strokeStyle = "yellow";
        //the following line is for debug
        //ctx.strokeRect(player.x + player.marginX, player.y + player.marginY, 
        //player.width - 2*player.marginX, player.height - 2*player.marginY);
        ctx.beginPath();
        var radius = Math.min(player.width, player.height) / 2;
        var newX = x + radius * Math.cos(angle);
        var newY = y + radius * Math.sin(angle);
        ctx.arc(newX, newY, 5, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }
    // To draw the explosions, taken from mainline.i3s.unice.fr/mooc/SkywardBound/ */

    function updateParticles(delta) {
        for (var i = 0; i < particles.length; i++) {
            var particle = particles[i];
            particle.update(delta);
        }
    }

    function drawParticles(ctx) {
        for (var i = 0; i < particles.length; i++) {
            var particle = particles[i];
            particle.draw(ctx);
        }
    }

    /* end explosion part */

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
            // to sure the ball is created far from the player. 
            if (!circRectsOverlap(player.x, player.y,
                player.width, player.height,
                ball.x, ball.y, ball.radius * 3,
                player.marginX, player.marginY)) {
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

        soundtrack = assetsLoaded.soundtrack;

        for (var i = 0; i < PLAYER_NB_POSTURES; i++) {
            var sprite = new Sprite();

            sprite.extractSprites(assetsLoaded.spriteRun, PLAYER_NB_POSTURES, (i + 1),
                PLAYER_NB_FRAMES_PER_POSTURE,
                PLAYER_SPRITE_WIDTH, PLAYER_SPRITE_HEIGHT);
            sprite.setNbImagesPerSecond(20);
            playerSprites[i] = sprite;
        }

    };

    function playMainMusic(track) {
        /* Adapted from mainline.i3s.unice.fr/mooc/SkywardBound/ */
        if (currentGameTrack) currentGameTrack.pause();

        currentGameTrack = track;
        currentGameTrack.play();
    }

    function pauseMusic() {
        if (currentGameTrack) {
            currentGameTrack.pause();
            musicPaused = true;
        }
    }


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
            playMainMusic(soundtrack);
            requestAnimationFrame(mainLoop);
        });

    };

    //our GameFramework returns a public API visible from outside its scope
    return {
        start: start
    };
};


