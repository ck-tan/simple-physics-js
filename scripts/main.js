const maxFPS = 60;
const timestep = 1000/maxFPS;
const allowedTimeStepVariance = 1;
let lastUpdateTime = 0;
let delta = 1;
let running = false,
    started = false,
    currentRAF = 0;

var canvas, ctx;
var canvasWidth, canvasHeight;
var boundaryLeft, boundaryRight, boundaryTop, boundaryBottom;

let gravity = 0.001;
let balls = [];
let mouseTouchObj = {
	oldX : 0,
	oldY : 0,
	x : 0,
	y : 0,
	heldObj : null,
	
}
let heldObj;

document.addEventListener('DOMContentLoaded', function() {
	//initialize stage and tools
	canvas = document.querySelector("#myCanvas");
	ctx = canvas.getContext("2d");
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	boundaryLeft = 0;
	boundaryRight = canvas.width;
	boundaryTop = 0;
	boundaryBottom = canvas.height;
	
	myFPSCounter = new fpsCounter(); //fps-counter.js
	
	canvas.addEventListener("mousemove", function (e) {
		var mousePos = getInputPosition(e.target, e);
		var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
		var msgTarget = document.querySelector("#desc-one");
		msgTarget.innerHTML = message;
		mouseTouchInput('move', e)
	}, false);
	canvas.addEventListener("mousedown", function (e) {
		mouseTouchInput('down', e)
	}, false);
	window.addEventListener("mouseup", function (e) {
		mouseTouchInput('up', e)
	}, false);
	canvas.addEventListener("mouseout", function (e) {
		mouseTouchInput('out', e)
	}, false);
	canvas.addEventListener("touchstart", function (e) {
		mouseTouchInput('down', e)
	}, false);
	canvas.addEventListener("touchmove", function (e) {
        e.preventDefault();
		mouseTouchInput('move', e)
	}, false);
	window.addEventListener("touchend", function (e) {
        e.preventDefault();
		mouseTouchInput('up', e)
	}, false);
	window.addEventListener("touchcancel", function (e) {
        e.preventDefault();
		mouseTouchInput('up', e)
	}, false);
	
	init();
});

function init() {
	//initialize stage objects
	balls.push(new Ball(20, "#FF0000"));
	balls[0].x = 250;
	balls[0].y = 100;
	balls[0].vx = 0;
	balls[0].vy = 0;
	//updateObjects(timestep);
	//drawObjects(ctx, balls);
	start();
}

function start() {
	if (!started) {
        started = true;
        currentRAF = requestAnimationFrame(function(timestamp) {
            //updateObjects();
            running = true;
            //lastUpdateTime = timestamp;
            //lastFpsUpdate = timestamp;
            //framesThisSecond = 0;
            currentRAF = requestAnimationFrame(mainLoop);
        });
    }
}
function stop() {
    running = false;
    started = false;
    cancelAnimationFrame(currentRAF);	
}
function panic() {
    delta = 0;
}
function mainLoop(timestamp) {
    currentRAF = requestAnimationFrame(mainLoop);
	//fixed delta/timestep, multiple updates per frame===============================================================================
	//console.log (timestamp, lastUpdateTime + (1000 / maxFPS), timestamp < lastUpdateTime + (1000 / maxFPS), (timestamp < lastUpdateTime + (1000 / maxFPS) - allowedTimeStepVariance))
	if (timestamp < lastUpdateTime + (1000 / maxFPS) - allowedTimeStepVariance) { // Throttle the frame rate
		//If the timestamp is only a little more than the next ideal frame, we would have to wait another cycle for the next update.
		//I find that introducing 'allowedTimeStepVariance' will give some allowance and reduce frame skips.
		//This should reduce the need to update multiple times per frame and give us smoother animations.
		//After implementing this, it is easier to reach the desired FPS limit.
        return; //stop here and wait for the next cycle
    }
	myFPSCounter.update(timestamp); //fps-counter.js
	delta += timestamp - lastUpdateTime;
    lastUpdateTime = timestamp;
    var numUpdateSteps = 0;
    while (delta >= timestep) { //run update multiple times per update, to prevent sudden jumps over obstables
        updateObjects(timestep); //with the multiple updates per frame method, we use a fixed delta(timestep)
        delta -= timestep;
        if (++numUpdateSteps >= 240) { //too many updates in a frame
            panic();
            break;
        }
    }
	drawObjects(ctx, balls); //draw only when updates have caught up
	//fixed delta/timestep, multiple updates per frame===============================================================================
	
	/*
	//dynamic delta/timestep, single updates per frame===============================================================================
	delta = timestamp - lastUpdateTime;
	//console.log("delta", delta)
    if (delta > timestep) { // Throttle the frame rate
		myFPSCounter.update(timestamp); //fps-counter.js
        updateObjects(delta);
		drawObjects(ctx, balls);
        lastUpdateTime = timestamp - (delta % timestep); //adjust lastUpdateTime time
    }
	//dynamic delta/timestep, single updates per frame===============================================================================
	*/
}
function updateObjects(updateDelta) {
	moveObjects(updateDelta, balls);
}
function moveObjects(updateDelta, objArr) {
	for (i = 0; i < objArr.length; i++) {
		if (objArr[i].isMoving) {
			objArr[i].vy += gravity * updateDelta; //do we apply delta to gravity? or acceleration in general?
			objArr[i].vx *= objArr[i].drag;
			objArr[i].vy *= objArr[i].drag;
			objArr[i].x += objArr[i].vx * updateDelta;
			objArr[i].y += objArr[i].vy * updateDelta;
			
			if (objArr[i].x + objArr[i].radius > boundaryRight) {
				objArr[i].x = boundaryRight - objArr[i].radius;
				objArr[i].vx = -objArr[i].vx * objArr[i].bounceFactor;
			} else if (objArr[i].x - objArr[i].radius < boundaryLeft) {
				objArr[i].x = boundaryLeft + objArr[i].radius;
				objArr[i].vx = -objArr[i].vx * objArr[i].bounceFactor;
			}
			if (objArr[i].y + objArr[i].radius > boundaryBottom) {
				objArr[i].y = boundaryBottom - objArr[i].radius;
				objArr[i].vy = -objArr[i].vy * objArr[i].bounceFactor;
			} else if (objArr[i].y - objArr[i].radius < boundaryTop) {
				objArr[i].y = boundaryTop + objArr[i].radius;
				objArr[i].vy = -objArr[i].vy * objArr[i].bounceFactor;
			}
		}
	}
	if (mouseTouchObj.heldObj) {
		mouseTouchObj.heldObj.vx = (mouseTouchObj.heldObj.x - mouseTouchObj.oldX) / updateDelta;
		mouseTouchObj.heldObj.vy = (mouseTouchObj.heldObj.y - mouseTouchObj.oldY) / updateDelta;
		mouseTouchObj.oldX = mouseTouchObj.heldObj.x;
		mouseTouchObj.oldY = mouseTouchObj.heldObj.y;
	}
}
function clearObjects(ctx, objArr) {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight); //clear everything
	//or clear objects only, useful when performance is an issue
}
function drawObjects(ctx, objArr) {
	clearObjects(ctx, objArr);
	for (i = 0; i < objArr.length; i++) {
		objArr[i].draw(ctx);
	}	
}

function mouseTouchInput(type, e) {
	var inputPos = getInputPosition(canvas, e);
	if (type == 'down') {
		//simple hit detection for this test
		for (i = 0; i < balls.length; i++) {
			if ((inputPos.x >= balls[i].x - balls[i].radius && inputPos.x <= balls[i].x + balls[i].radius) && (inputPos.y >= balls[i].y - balls[i].radius && inputPos.y <= balls[i].y + balls[i].radius)) {
				balls[i].isMoving = false;
				mouseTouchObj.heldObj = balls[i];
				mouseTouchObj.oldX = mouseTouchObj.heldObj.x;
				mouseTouchObj.oldY = mouseTouchObj.heldObj.y;
			}
		}
	}
	if (type == 'up' || type == "out") {
		if (mouseTouchObj.heldObj) {
			mouseTouchObj.heldObj.isMoving = true;
			mouseTouchObj.heldObj = null;
		}
	}
	if (type == 'move') {
		if (mouseTouchObj.heldObj) {
			mouseTouchObj.heldObj.x = inputPos.x;
			mouseTouchObj.heldObj.y = inputPos.y;
		}
	}
}

function getInputPosition(targetCanvas, e) {
	var rect = targetCanvas.getBoundingClientRect();
    var position = {x: null, y: null};
    //if (Modernizr.touch) { //global variable detecting touch support
	if (e.touches && e.touches.length > 0) {
		position.x = e.touches[0].clientX - rect.left;
		position.y = e.touches[0].clientY - rect.top;
	} else {
		position.x = e.clientX - rect.left;
		position.y = e.clientY - rect.top;
	}
    return position;
}
//============================================Compatibility===================================================
var requestAnimationFrame = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (function() {
	var lastTimestamp = Date.now(),
		now,
		timeout;
	return function(callback) {
		now = Date.now();
		timeout = Math.max(0, timestep - (now - lastTimestamp));
		lastTimestamp = now + timeout;
		return setTimeout(function() {
			callback(now + timeout);
		}, timeout);
	};
})(),

cancelAnimationFrame = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout;
//============================================Compatibility===================================================