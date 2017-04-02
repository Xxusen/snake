function isElement(o){
  return (
	    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
	    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
	);
}
function Timer(parent, className) {
	this.time = new Date();
	this.display = document.createElement("div");
	this.runIntervalId = null;

	this.time.setHours(0,0,0,0);
	this.display.className += (" "+className).trim();

	if(isElement(parent)) {
		parent.appendChild(this.display);
	} else {
		document.body.appendChild(this.display);
	}
	this.updateDisplay();
}

Timer.prototype.reset = function() {
	this.time.setHours(0,0,0,0);
	this.updateDisplay();
}

Timer.prototype.updateDisplay = function() {
	function cplt(n) {
		if(n < 10) {
			n = "0"+n;
		}
		return n;
	}
	var hrs = cplt(this.time.getHours());
	var min = cplt(this.time.getMinutes());
	var sec = cplt(this.time.getSeconds());

	this.display.innerHTML = hrs+":"+min+":"+sec;
}

Timer.prototype.run = function() {
	var timer = this;
	this.runIntervalId = setInterval(function() {
		timer.time.setSeconds(timer.time.getSeconds()+1);
		timer.updateDisplay();
	}, 1000)
}

Timer.prototype.stop = function() {
	clearInterval(this.runIntervalId);
}
