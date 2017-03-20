//TODO:
//add friction to paddle for weird bounce pattern
//add github board

(function (window,document){
	'use strict';

	let timeSpeed = 50;
	let epsilon = 0.00001;
	var prevTime = 0;
	var paused = false;
	var loadMode = true;

	var frameByFrameMode = false;
	var pausedMode = false;
	var debugMode = false;
	var gridMode = false;

	var moveCounter = 0;
	var lineSegmentCollisionCounter = 0;
	var lives = 3;

	function moveShapes(){

		var currentTime = Date.now();
		var timeLeft = currentTime - prevTime;
		var halting = false;
		var collisionCounter = 0

		while (timeLeft > epsilon) {
			
			var collision = board.getClosestCollision (timeLeft);
			if (collision.shape != null && Math.abs (collision.time) <= timeLeft) {

				if (pausedMode) {
					paused = true;
					timeLeft = 0;
					clearInterval (animation);
				}

				board.moveCircles(collision.time,loadMode);
				collision.collisionResponse (collision.circle, collision.shape, collision.time);

				//remove shape on collision
				if (collision.hasOwnProperty("arr") && collision.hasOwnProperty("index")) {
					collision.arr.splice (collision.index, 1)
					board.incrementScore();
					if (board.circles.length <= 0) {
						
						if (lives > 0) {
							board.resetBoard();
							timeLeft = 0;
							loadMode = true;
							lives--;
						} else {
							clearInterval (animation);
							halting = true;
							board.drawGameOver(ctx, c);
						}
					}
				}

				timeLeft-=collision.time;
				collisionCounter++;
			} else {
				board.moveCircles(timeLeft,loadMode);
				timeLeft = 0
			}

			//debugging conditions
			if (collisionCounter > 1000) {

				console.log ("too many collisions");
				board.moveCircles(timeLeft);
				timeLeft = 0
				clearInterval (animation);
			}
			if (frameByFrameMode) {
				paused = true;
				clearInterval (animation);
			}

		}

		if (!halting) {
			board.drawShapes(ctx, c);
		}

		prevTime = Date.now();
	}

	var animation;
	var c;
	var ctx;
	var board;
	function startAnimation (){
		c = document.getElementById("myCanvas");
		ctx = c.getContext("2d");
		prevTime = Date.now();
		animation = setInterval(moveShapes, timeSpeed);
		paused = false;
	}

	//moves the first circle
	function setCirclePos (event) {
		board.circles[0].x = event.clientX;
		board.circles[0].y = event.clientY - 100;
	}

	//set paddle speed
	function setPaddleVelX (velX) {
		board.paddle.setVel (new Vector (velX, board.paddle.vel.y));
	}

	//Note: remember to resize everything when the display size changes
	function init(){
		
		var mainContent = document.getElementById('main-body');
		mainContent.style.borderStyle = "none";

		var c = document.getElementById("myCanvas");
		c.onclick = setCirclePos;

		//var c = document.getElementById("myCanvas");
		c.width = 500;
		c.height = 500;
		var ctx = c.getContext("2d");
		var width = ctx.canvas.width
		var height = ctx.canvas.height;

		board = new Board (width, height);
		console.log ("init header")
	}

	window.Window = {
		init : init,
		startAnimation : startAnimation,
		animation : animation
	}

	function pauseAnimation(event) {
		console.log ("pressed key");
		if (paused) {
			startAnimation ();
		} else {
			paused = true;
			clearInterval (animation);
		}
	}

	var leftDown = false;
	var rightDown = false;
	let paddleVel = 0.2
	//document.onkeydown = pauseAnimation;
	document.addEventListener ('keydown', function (event) {
		if (event.keyCode == 37) {
			//console.log ("Left was down");
			setPaddleVelX (-paddleVel);
			leftDown = true;
		} else if (event.keyCode == 39) {
			//console.log ("Right was down");
			setPaddleVelX (paddleVel);
			rightDown = true;
		} else if (event.keyCode == 38 && loadMode) {
			//console.log ("Game start");
			if (board.circles.length > 0) {board.circles[0].vel = new Vector (0.2, -0.2);}
			loadMode = false;
		} else {
			pauseAnimation();
		}
	});

	document.addEventListener ('keyup', function (event) {
		if (event.keyCode == 37) {
			//console.log ("Left was lifted");
			setPaddleVelX (0);
			leftDown = false;
			if (rightDown) {
				setPaddleVelX (paddleVel);
			}
		} else if (event.keyCode == 39) {
			//console.log ("Right was lifted");
			setPaddleVelX (0);
			rightDown = false;
			if (leftDown) {
				setPaddleVelX (-paddleVel);
			}
		} 
	});

})(window,document);

function pauseAnimation (event) {
	clearInterval (Window.animation);
}

Window.init();
Window.startAnimation();
