const initialMovementInterval = 80; // the interval of time there is between two movements of the snake (in milliseconds)
const reduceMovementsIntervalBy = 5; // amount of time we have to reduce this interval when we have to (in milliseconds)
const smallestMovementInterval = 50; // the interval of time there is between two movements cannot go bellow this.
const speedUpEveryXBlocks = 3; // how many blocks does the snake has to eat before attempting to speed up
const initialDirection = 'random'; // snake's initial direction could be "r","l","u","d", "random" or anything else (= random)
const growingDuration = 500; // growing animation duration (the longer the more blocks added to snakes body)
const foodBlockInitialValue = 100; // the maximum points added to score when a food block gets eaten
const foodBlockValueDecrementInterval = 60; // interval of time between two food block value decrementation
const foodBlockMinimumValue = 5; // minimum value of a food block
const allowReverseGear = true; // going backward allowed or not, we have to hit the reverse direction of the current direction for that



/* 
Block reference type
	parent: where the element representing the block is located
	type: food or bodyPart
	predecessor: Block object suppoosed to be this one's predecessor. We'll use it's previousPos property to set this one's position
	sbsl: "specified block side length", it's height and width
	leftPos & topPos: position of the element representing the block, used only if not body part of the snake
*/
function Block(parent, type, predecessor, sbsl, leftPos, topPos){
	var elt = document.createElement("div");
	elt.className = "block "+type;
	elt.style.height = sbsl+"px";
	elt.style.width = sbsl+"px";
	if(type == 'bodyPart') {
		if(predecessor != null && predecessor.previousPos) {
			// previousPos property is an array of two elements, it contains the previous position of the block it's found in
			elt.style.left = predecessor.previousPos[0]+"px";
			elt.style.top = predecessor.previousPos[1]+"px";
		} else {
			//snake body's first block
			elt.style.left = 0+"px";
			elt.style.top = 0+"px";
			this.previousPos = null;
		}
		// we'll need the predecessor to link all snake's blocks
		this.predecessor = predecessor;
	} else {
		// positionning the element (visual) representing the block
		elt.style.left = leftPos+"px";
		elt.style.top = topPos+"px";
	}
	// appending and saving this element
	parent.appendChild(elt);
	this.elt = elt;
}

/*
FoodBlock reference type
	arena: contains as properties the element in which this' block's representing elt will be contained and it's height and width
*/
function FoodBlock(arena) {
	var parent = arena.elt;

	/*
	the elt representing the block will get random coordinates
	We have to calculate left and top positionning ranges
	*/
	var maxLeftPos = (arena.width - arena.absl)/(arena.absl-1);
	var maxTopPos = (arena.height - arena.absl)/(arena.absl-1);
	var emptySpot, leftPos, topPos;
	
	/* 
	generating random left and top positions and checking if there's a collision with any of the snake's blocks
	we'll do that until no collision found
	*/	
	do {
		emptySpot = true;
		leftPos = Math.floor(Math.random()*(maxLeftPos+1))*(arena.absl-1);
		topPos = Math.floor(Math.random()*(maxTopPos+1))*(arena.absl-1);
		var blocks = parent.querySelectorAll(".block");
		for(var i=0; i < blocks.length; i++) {
			if(blocks[i].offsetLeft == leftPos && blocks[i].offsetTop == topPos){
				emptySpot = false;
				break;
			}
		}
	} while (emptySpot == false);

	this.block = new Block(parent, "foodBlock", null, arena.sbsl, leftPos, topPos);
	this.value = foodBlockInitialValue;
	// now that the block is visible, we start it's value loss
	this.startToDecrementValue();
}

/* This method decrements the objects value as time passes, the minimum value of the object is determined by foodBlockMinimumValue const */
FoodBlock.prototype.startToDecrementValue = function() {
	var foodBlock = this;
	this.decrementIntervalId = setInterval(function() {
		foodBlock.value--;
		if(foodBlock.value <= foodBlockMinimumValue) {
			clearInterval(foodBlock.decrementIntervalId);
		}
	},foodBlockValueDecrementInterval);
}

/* Snake reference type
		arena: the arena object in which this snake will "live" and "evolve"
		direction: it's direction when animated, "l","u","r" or "d" if anything else "r" will be chosen
		pace: the interval of time between two movements in milliseconds
*/
function Snake(arena, direction, pace) {
	this.arena = arena;
	this.bodyParts = [];
	this.eatenBlocks = 0;
	if("lurd".indexOf(direction) != -1 && direction.length == 1){
		this.direction = direction;
	} else {
		this.direction = "r";
	}
	this.pace = pace;
	//we'll need to keep a track of the interval Id used for it's animation, to stop it.
	this.animateIntervalId = null;
	/*
	the snake grows when eats block, it takes some time to make all the new blocks appear, we need to keep track of the intervalId's of
	those animations, to stop them when needed
	*/
	this.growingIntervalIds = [];
	this.addBlock();
	this.bodyParts[0].elt.className += " head";
}

/* this method start an animation based on the snake's pace and direction properties */
Snake.prototype.moveForward = function () {
	var head = this.bodyParts[0];
	var headsNextLeftPos = head.elt.offsetLeft;
	var headsNextTopPos = head.elt.offsetTop;
	var step = this.arena.absl-1;
	switch(this.direction) {
		case 'r':
			headsNextLeftPos += step;
			break;
		case 'l':
			headsNextLeftPos -= step;
			break;
		case 'u':
			headsNextTopPos -= step;
			break;
		case 'd':
			headsNextTopPos += step;
			break;
	}

	// determining maximum and minimum of top and left positions
	var minLeftPos = 0;
	var maxLeftPos = this.arena.width - this.arena.absl;
	var minTopPos = 0;
	var maxTopPos = this.arena.height - this.arena.absl;

	// if passed those it'll appear on the opposite side 
	if(headsNextLeftPos < minLeftPos) {
		headsNextLeftPos = maxLeftPos;
	} else if(headsNextLeftPos > maxLeftPos) {
		headsNextLeftPos = minLeftPos;
	}

	if(headsNextTopPos < minTopPos) {
		headsNextTopPos = maxTopPos;
	} else if (headsNextTopPos > maxTopPos) {
		headsNextTopPos = minTopPos;
	}

	// updating composing blocks' new previousPos properties and their elt property's element's positions.
	head.previousPos = [head.elt.offsetLeft, head.elt.offsetTop];
	head.elt.style.left = headsNextLeftPos+"px";
	head.elt.style.top = headsNextTopPos+"px";
	for(var i=1; i < this.bodyParts.length; i++) {
		this.bodyParts[i].previousPos = [this.bodyParts[i].elt.offsetLeft, this.bodyParts[i].elt.offsetTop];
		this.bodyParts[i].elt.style.left = this.bodyParts[i].predecessor.previousPos[0]+"px";
		this.bodyParts[i].elt.style.top = this.bodyParts[i].predecessor.previousPos[1]+"px";

		// checking if "head" (first block) isn't on the same coordinates as the currently processed block, if so game over
		if(head.elt.offsetLeft == this.bodyParts[i].elt.offsetLeft && head.elt.offsetTop == this.bodyParts[i].elt.offsetTop) {
			this.arena.endGame();
		}
	}
	//checking if head has the same coordinates as the foodBlock's element's, score - grow - ask new food block from arena if so.
	var foodBlockElt = this.arena.foodBlock.block.elt;
	if(head.elt.offsetTop == foodBlockElt.offsetTop && head.elt.offsetLeft == foodBlockElt.offsetLeft) {
		this.eatenBlocks++;
		this.arena.updateScore();
		this.grow();
	}
}

/* This method enables to change the snake's direction property*/
Snake.prototype.changeDirection = function(nDir) {
	cDir = this.direction;
	// anydirection but the opposite or the same direction as the currently set direction
	if(!(((cDir=='l'||cDir=='r') && (nDir=='l'||nDir=='r')) || ((cDir=='u'||cDir=='d')&&(nDir=='u'||nDir=='d'))) || this.bodyParts.length == 1){
		this.direction = nDir;
		if(this.bodyParts.length > 1)
		this.moveForward();
	} else {
		// if we want to go the opposite of the currently set direction and if we've allowed reverse gear
		if(allowReverseGear && cDir != nDir) {
			this.reverse();
		}
	}
}

/* This method enables the snake to switch head and tail and go the opposite way */
Snake.prototype.reverse = function() {
	var bodyParts = this.bodyParts;
	bodyParts[0].elt.className = bodyParts[0].elt.className.replace("head","").trim();
	bodyParts[bodyParts.length-1].elt.className +=  " head";
	//reversing bodyParts
	bodyParts.reverse();
	//predecessors become successors
	for(var i=1; i < bodyParts.length; i++) {
		bodyParts[i].predecessor = bodyParts[i-1];
	}
	//the previously last block becomes head and loses it's predecessor
	bodyParts[0].predecessor = null;
	//we determine the direction using the newly first two blocks top or left alignments 
	var newDirection;
	if(bodyParts[0].elt.offsetLeft == bodyParts[1].elt.offsetLeft) {
		if(bodyParts[0].elt.offsetTop < bodyParts[1].elt.offsetTop){
			newDirection = "u";
		} else {
			newDirection = "d";
		}
	} else {
		if(bodyParts[0].elt.offsetLeft < bodyParts[1].elt.offsetLeft) {
			newDirection = "l";
		} else {
			newDirection = "r";
		}
	}
	this.direction = newDirection;
}

//this methods animates the snake using it's moveforward method
Snake.prototype.animate = function() {
	var snake =this;
	this.animateIntervalId = setInterval(function() {
		snake.moveForward();
	}, this.pace);
}


//this method stops the snake
Snake.prototype.freeze = function () {
	clearInterval(this.animateIntervalId);
}

//this methods changes the snake's pace property and sets a new animation based on the new pace
Snake.prototype.speedUp = function () {
	var growingProcessNumber = this.isGrowing();
	var snake = this;
	setTimeout(function() {
		snake.freeze();
		snake.pace -= reduceMovementsIntervalBy;
		snake.animate();
	}, growingDuration * growingProcessNumber);
}

//this method adds a new block to the snake's body
Snake.prototype.addBlock = function() {
	if(this.bodyParts.length > 0) {
		this.bodyParts.push(new Block(this.arena.elt, 'bodyPart', this.bodyParts[this.bodyParts.length-1], this.arena.sbsl));
	} else {
		//head
		this.bodyParts.push(new Block(this.arena.elt, 'bodyPart', null, this.arena.sbsl));
	}
}

//this method sets animations and stores their's intervalId's into the growingIntervalId array as there can be
//several blocks eaten in a row
Snake.prototype.grow = function() {
	var snake = this;
	var intervalIdIndex = (this.growingIntervalIds.push(
		setInterval(function() {
			snake.addBlock();
		}, snake.pace+100)
	))-1;
	var intervalId = this.growingIntervalIds[intervalIdIndex];
	setTimeout(function() {
		for(var i=0; i < snake.growingIntervalIds.length; i++) {
			if(intervalId == snake.growingIntervalIds[i]) {
				snake.growingIntervalIds[i] = null;
				break;
			}
		}
		clearInterval(intervalId);
	}, growingDuration);
}

//stops the snake growth iterating throught it's growingIntervalId array
Snake.prototype.stopGrowing = function() {
	for(var i=0; i < this.growingIntervalIds.length; i++) {
		clearInterval(this.growingIntervalIds[i]);
	}
}

//checks if the snake in
Snake.prototype.isGrowing = function() {
	var growingProcessNumber = 0;
	for(var i=0; i < this.growingIntervalIds.length; i++) {
		if(this.growingIntervalIds[i] != null) {
			growingProcessNumber++;
		}
	}
	if(growingProcessNumber == 0) {
		this.growingIntervalIds = [];
	}
	return growingProcessNumber;
}


/*
Arena reference type
	parent : element in which the game will be embbeded in
	width & height: dimensions of the div (lets call it game shelter) serving as arena saved in elt property.
	specifiedBlockSideLength: the side length of the blocks that compose snake's body and food blocks


*/
function Arena(parent, width, height, specifiedBlockSideLength) {
	this.sbsl = specifiedBlockSideLength;
	/* 
	absl = actual block side length, as we don't use "box-sizing: border box;" which causes somes glitches with firefox esr
	this means that blocks will be 2 pixels larger in their side because of their borders which are not included
	*/
	this.absl = specifiedBlockSideLength+2;
	// we'll need the arena's dimensions to have some properties (which are related the blocks' side length)
	var temp = (width - this.absl)%(this.absl-1);
	this.width = width - temp;
	temp = (height - this.absl)%(this.absl-1);
	this.height = height - temp;

	this.elt = document.createElement('div');
	this.elt.className = "arena";
	// making the "game shelter" focusable
	this.elt.setAttribute("tabindex", "32767");
	// creating the central timer
	this.timer = new Timer(this.elt, "timer");
	
	//dimensions of the game shelter
	this.elt.style.height = this.height+"px";
	this.elt.style.width = this.width+"px";

	parent.appendChild(this.elt);
	this.popOver = null;
	//generating the "home" pop-over
	this.generateInfoPopOver("Snake Game", "Directional keys : control the snake<br>Spacebar : pauses/resumes the game", "Play");
	var arena = this;
	this.popOver.querySelector(".button").addEventListener("click", function() {
		arena.startGame();
	});
}


// generates a pop-over
Arena.prototype.generateInfoPopOver = function(title, text, buttonValue) {

	var popOver = document.createElement("div");
	popOver.className = "popOver";

	var titleElt = document.createElement("span");
	titleElt.className = "title";
	titleElt.innerHTML = title;

	if(typeof text != "undefined" && typeof buttonValue != "undefined") {
		var textElt = document.createElement("div");
		textElt.className = "text";
		textElt.innerHTML = text;

		var button = document.createElement("span")
		button.className= "button";
		button.innerHTML = buttonValue;
	}

	popOver.appendChild(titleElt);
	if(typeof text != "undefined" && typeof buttonValue != "undefined") {
		popOver.appendChild(textElt);
		popOver.appendChild(button);
	}
	this.elt.appendChild(popOver);

	var temp = (this.width - popOver.offsetWidth)/2 + "px";
	popOver.style.left = temp;
	temp =  (this.height - popOver.offsetHeight)/2 + "px";
	popOver.style.top = temp;
	titleElt.style.fontSize = popOver.offsetWidth/15+"px";
	if(typeof text != "undefined" && typeof buttonValue != "undefined") {
		textElt.style.fontSize = popOver.offsetWidth/45+"px";
		button.style.fontSize = popOver.offsetWidth/20+"px";
	}
	this.popOver = popOver;
}

//clears it
Arena.prototype.clearPopOver = function() {
	this.elt.removeChild(this.popOver);
	this.popOver = null;
}

//updates the score, invoked when the snake's head reaches a foodblock
Arena.prototype.updateScore = function() {
	// condition for the snake to speed up
	if(this.snake.pace > smallestMovementInterval && (this.snake.eatenBlocks % speedUpEveryXBlocks == 0)){
		this.snake.speedUp();
	}
	//if food block value is still being decremented
	if(this.foodBlock.decrementIntervalId) {
		clearInterval(this.foodBlock.decrementIntervalId);
	}
	//updates score, removes food block, creates a new food block
	this.scoreDisplay.innerHTML = parseInt(this.scoreDisplay.innerHTML, 10)+this.foodBlock.value;
	this.elt.removeChild(this.elt.querySelector(".foodBlock"));
	this.foodBlock = new FoodBlock(this);
}

//controls (with keyboard)
function kbControl(e) {
	e.preventDefault();
	var arena = this.arena;
	var keyCode = e.keyCode;
	if(keyCode >= 37 && keyCode <= 40 && arena.gameStatus == "playing") {
		var newDirection;
		switch(keyCode) {
			case 37:
				newDirection = "l";
				break;
			case 38:
				newDirection = "u";
				break;
			case 39:
				newDirection = "r";
				break;
			case 40:
				newDirection = "d";
				break;
		}
		if(typeof newDirection != "undefined") {
			arena.snake.changeDirection(newDirection);
		}
	} else if(keyCode == 32) {
		var growingProcessNumber = arena.snake.isGrowing();
		setTimeout(function(){
			arena.gamePauseResume();
		}, growingDuration * growingProcessNumber);
	}
}

//controls (with the touch surface)
function tcControl(e) {
	if(e.type == "touchmove") {
		e.preventDefault();
	} else if(e.type == "touchstart") {
		startXY = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];

	} else if(e.type == "touchend") {
		endXY = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
		var xDif = startXY[0] - endXY[0];
		var yDif = startXY[1] - endXY[1];
		if(Math.abs(xDif) > 5 || Math.abs(yDif) > 5) {
			var newDirection;
			if(Math.abs(xDif) > Math.abs(yDif)) {
				if(xDif < 0) {
					newDirection = "r";
				} else {
					newDirection = "l";
				}
			} else {
				if(yDif < 0) {
					newDirection = "d";
				} else {
					newDirection = "u";
				}
			}
			this.arena.snake.changeDirection(newDirection);
		}
	}
}


Arena.prototype.startGame = function() {
	//clearing the popover if there is one
	if(this.popOver != null) {
		this.clearPopOver();
	}
	//setting snake's direction (we're using intialDirection which is a const defined at the beginning of the file)
	var direction;
	if("lurd".indexOf(initialDirection) != -1 && initialDirection.length == 1){
		direction = initialDirection;
	} else {
		direction = "lurd".charAt(Math.floor(Math.random()*4));
	}

	//starting the timer
	this.timer.run();	
	this.snake = new Snake(this, direction, initialMovementInterval);

	// creating score display
	this.scoreDisplay = document.createElement("div");
	this.scoreDisplay.className = "scoreDisplay";
	this.scoreDisplay.appendChild(document.createTextNode("0"));
	this.elt.appendChild(this.scoreDisplay);
	this.scoreDisplay.style.height = this.scoreDisplay.offsetWidth/4+"px";
	this.scoreDisplay.style.lineHeight = this.scoreDisplay.offsetHeight+"px";
	this.scoreDisplay.style.fontSize = this.scoreDisplay.offsetHeight/2+"px";
	this.foodBlock = new FoodBlock(this);
	this.gameStatus = "playing";

	// associating this object to it's property elt's element so that we can access it when executing the coming event's callbacks
	this.elt.arena = this;
	// events to manage
	this.elt.addEventListener("keydown", kbControl);
	this.elt.addEventListener("touchstart", tcControl);
	this.elt.addEventListener("touchmove", tcControl);
	this.elt.addEventListener("touchend", tcControl);
	this.elt.focus();
	this.snake.animate();
}

// What happens when we hit spacebar during the game (Pause)
Arena.prototype.gamePauseResume = function() {
	if (this.gameStatus == "playing") {
		this.snake.freeze();
		this.timer.stop();
		this.gameStatus = "paused";
		this.elt.className += " blink";
		this.generateInfoPopOver("Game Paused");
	} else {
		this.snake.animate();
		this.timer.run();
		this.gameStatus = "playing";
		this.elt.className = this.elt.className.replace("blink", "").trim()
		this.clearPopOver();
	}
}

//What happens when the snake starts eating itself
Arena.prototype.endGame = function() {
	this.snake.stopGrowing();
	this.snake.freeze();
	this.timer.stop();
	this.elt.removeEventListener("keydown", kbControl);
	this.elt.removeEventListener("touchstart", tcControl);
	this.elt.removeEventListener("touchmove", tcControl);
	this.elt.removeEventListener("touchend", tcControl);
	var score = this.scoreDisplay.innerHTML;
	var eatenBlocks = this.snake.eatenBlocks;
	var snakeLength = this.snake.bodyParts.length;
	
	this.generateInfoPopOver("Game Over", "Score : "+score+"<br>Eaten blocks: "+eatenBlocks+"<br>Time: "+this.timer.display.innerHTML+"<br>Snake's length: "+snakeLength+" blocks", "retry");
	var arena = this;
	this.popOver.querySelector(".button").addEventListener("click", function() {
		arena.reinitialize();
	});
}

//Reinitializes the game when game over and the button "retry" hit.
Arena.prototype.reinitialize = function() {
	this.timer.reset();
	this.clearPopOver();
	var blocks = this.elt.querySelectorAll(".block");
	for(var i=0; i < blocks.length; i++) {
		this.elt.removeChild(blocks[i]);
	}
	this.elt.removeChild(this.scoreDisplay);
	this.startGame();
}

