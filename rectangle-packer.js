var ctx = document.querySelector("#scratch").getContext("2d");
ctx.fillStyle = "rgba(155,100,45,0.2)";

var rects = [];
for(var i=0; i<15; i++) {
	rects.push({x:Math.random(), y:Math.random(), w:Math.random()+.1, h:Math.random()+.1});
}

var genetic = Genetic.create();

genetic.optimize = Genetic.Optimize.Minimize;
genetic.select1 = Genetic.Select1.Random;
genetic.select2 = Genetic.Select2.FittestRandom;

genetic.seed = function() {
	return this.userData.rects.map(function(r) {
		return {x:Math.random(), y:Math.random(), w:r.w, h:r.h};
	});
};

genetic.mutate = function(entity) {
	function change(n) {
		n += Math.random() * drift;
		return n < 0 ? 0 : n;
	}
	// allow chromosomal drift with this range (-0.05, 0.05)
	var drift = ((Math.random()-0.5)*2) * .25;
	var copy = entity.map(function(r) {
		var dir = Math.random() > .5;
		return {
				x: dir ? change(r.x) : r.x,
				y: !dir ? change(r.y) : r.y,
				w: r.w,
				h: r.h
		}
	});
	while (Math.random() > 0.5) {
		var i = Math.floor(Math.random() * entity.length);
		var j = Math.floor(Math.random() * entity.length);
		copy[i].x = entity[j].x; copy[i].y = entity[j].y;
		copy[j].x = entity[i].x; copy[j].y = entity[i].y;
	}
	return copy;
};

genetic.crossover = function(mother, father) {
	var end = Math.floor(Math.random()*mother.length);
	var son = [].concat(father);
	var daughter = [].concat(mother);

	for(var i=0; i<end; i++) {
		son[i] = mother[i];
		daughter[i] = father[i];
	}

	return [son, daughter];
};

genetic.fitness = function(entity) {
	var that = this;
	var red = entity.reduce(function(prev, cur, j) {
		for (var i=j+1; i<entity.length; i++) {
				prev.overlap += that.intersection(entity[i], entity[j]);
		}
		prev.sum += cur.x + cur.y;
		prev.maxx = Math.max(cur.x + cur.w, prev.maxx);
		prev.maxy = Math.max(cur.y + cur.y, prev.maxy);
		return prev;
	}, {overlap:0, sum:0, maxx:0, maxy: 0});

	return (red.overlap > 0) ? red.overlap : -1/(red.maxy * red.maxy * red.sum);
};

genetic.Rectangle = function(x,y,w,h) {
	return {x:x,y:y,w:w,h:h};
};

genetic.intersection = function(r1, r2) {
	var x, y, dx, dy;
	if (r1.x < r2.x) x =    r2.x, dx = r1.x + r1.w - r2.x;
	else             x = r1.x, dx = r2.x    + r2.w    - r1.x;
	if (dx < 0) dx = 0;
	if (dx > r1.w) dx = r1.w;
	if (dx > r2.w)    dx = r2.w;

	if (r1.y < r2.y) y =    r2.y, dy = r1.y + r1.h - r2.y;
	else             y = r1.y, dy = r2.y    + r2.h    - r1.y;
	if (dy < 0) dy = 0;
	if (dy > r1.h) dy = r1.h;
	if (dy > r2.h) dy = r2.h;

	return dx * dy;
}

genetic.generation = function(pop, generation, stats) {
};

genetic.notification = function(pop, generation, stats, isFinished) {
	var best = pop[0].entity;
	document.querySelector("#gen").textContent = generation;
	document.querySelector("#fitness").textContent = pop[0].fitness;

	var w = ctx.canvas.width, h = ctx.canvas.height;
	ctx.clearRect(0,0, w, h);
	for(var i=0; i<best.length; i++) {
		var e = best[i];
		ctx.fillRect(e.x*200, e.y*200, e.w*200, e.h*200);
		ctx.strokeRect(e.x*200, e.y*200, e.w*200, e.h*200);
	}
};

var config = {
			"iterations": 1e4
			, "size": 150
			, "maxResults" : 1
			, "crossover": 0.7
			, "mutation": 0.4
			, "skip": 10
			, "fittestAlwaysSurvives": true
};
var userData = {
	"rects" : rects
}
genetic.evolve(config, userData);
