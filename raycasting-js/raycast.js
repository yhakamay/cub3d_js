const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINIMAP_SCALE_FACTOR = 0.3;

class Map {
	constructor() {
		this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 1],
            [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 3, 1, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 3, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		];
	}
	hasWallAt(x, y) {
		if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
			return true;
		}
		let mapGridIndexX = Math.floor(x / TILE_SIZE);
		let mapGridIndexY = Math.floor(y / TILE_SIZE);
		return this.grid[mapGridIndexY][mapGridIndexX] != 0;
	}
	getWallContentAt(x, y) {
		if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
			return 0;
		}
		let mapGridIndexX = Math.floor(x / TILE_SIZE);
		let mapGridIndexY = Math.floor(y / TILE_SIZE);
		return this.grid[mapGridIndexY][mapGridIndexX];
	}
	render() {
		for (let i = 0; i < MAP_NUM_ROWS; i++) {
			for (let j = 0; j < MAP_NUM_COLS; j++) {
				let tileX = j * TILE_SIZE;
				let tileY = i * TILE_SIZE;
				let tileColor = this.grid[i][j] != 0 ? "#222" : "#fff";
				stroke("#222");
				fill(tileColor);
				rect(
					MINIMAP_SCALE_FACTOR * tileX,
					MINIMAP_SCALE_FACTOR * tileY,
					MINIMAP_SCALE_FACTOR * TILE_SIZE,
					MINIMAP_SCALE_FACTOR * TILE_SIZE
				);
			}
		}
	}
}

class Player {
	constructor() {
		this.x = WINDOW_WIDTH / 2;
		this.y = WINDOW_HEIGHT / 2;
		this.radius = 4;
		this.turnDirection = 0; // -1 if left, +1 if right
		this.walkDirection = 0; // -1 if back, +1 if front
		this.rotationAngle = Math.PI / 2;
		this.moveSpeed = 8.0;
		this.rotationSpeed = 2 * (Math.PI / 180);
	}
	update() {
		this.rotationAngle += this.turnDirection * this.rotationSpeed;

		let moveStep = this.walkDirection * this.moveSpeed;

		let newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
		let newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;

		if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
			this.x = newPlayerX;
			this.y = newPlayerY;
		}
	}
	render() {
		noStroke();
		fill("blue");
		circle(
			MINIMAP_SCALE_FACTOR * this.x,
			MINIMAP_SCALE_FACTOR * this.y,
			MINIMAP_SCALE_FACTOR * this.radius
		);
		stroke("blue");
		line(
			MINIMAP_SCALE_FACTOR * this.x,
			MINIMAP_SCALE_FACTOR * this.y,
			MINIMAP_SCALE_FACTOR * (this.x + Math.cos(this.rotationAngle) * 30),
			MINIMAP_SCALE_FACTOR * (this.y + Math.sin(this.rotationAngle) * 30)
		);
	}
}

class Ray {
	constructor(rayAngle) {
		this.rayAngle = normalizeAngle(rayAngle);
		this.wallHitX = 0;
		this.wallHitY = 0;
		this.distance = 0;
		this.wasHitVertical = false;
		this.hitWallColor = 0;

		this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
		this.isRayFacingUp = !this.isRayFacingDown;

		this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
		this.isRayFacingLeft = !this.isRayFacingRight;
	}
	cast() {
		let xintercept, yintercept;
		let xstep, ystep;

		/////////////////////////////////////////////
		/// HORIZONTAL RAY-GRID INTERSECTION CODE ///
		/////////////////////////////////////////////
		let foundHorzWallHit = false;
		let horzWallHitX = 0;
		let horzWallHitY = 0;
		let horzWallColor = 0;

		// Find the y-coordinate of the closest horizontal grid intersection
		yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
		yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

		// Find the x-coordinate of the closest horizontal grid intersection
		xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

		// Calculate the increment xstep and ystep
		ystep = TILE_SIZE;
		ystep *= this.isRayFacingUp ? -1 : 1;

		xstep = TILE_SIZE / Math.tan(this.rayAngle);
		xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
		xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

		let nextHorzTouchX = xintercept;
		let nextHorzTouchY = yintercept;

		// Increment xstep and ystep until we find a wall
		while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
			let wallGridContent = grid.getWallContentAt(
				nextHorzTouchX,
				nextHorzTouchY + (this.isRayFacingUp ? -1 : 0) // if ray is facing up, force one pixel up so we are inside a grid cell
			);
			if (wallGridContent != 0) {
				foundHorzWallHit = true;
				horzWallHitX = nextHorzTouchX;
				horzWallHitY = nextHorzTouchY;
				horzWallColor = wallGridContent;
				break;
			} else {
				nextHorzTouchX += xstep;
				nextHorzTouchY += ystep;
			}
		}

		///////////////////////////////////////////
		/// VERTICAL RAY-GRID INTERSECTION CODE ///
		///////////////////////////////////////////
		let foundVertWallHit = false;
		let vertWallHitX = 0;
		let vertWallHitY = 0;
		let vertWallColor = 0;

		// Find the x-coordinate of the closest vertical grid intersection
		xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
		xintercept += this.isRayFacingRight ? TILE_SIZE : 0;

		// Find the y-coordinate of the closest vertical grid intersection
		yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

		// Calculate the increment xstep and ystep
		xstep = TILE_SIZE;
		xstep *= this.isRayFacingLeft ? -1 : 1;

		ystep = TILE_SIZE * Math.tan(this.rayAngle);
		ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
		ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

		let nextVertTouchX = xintercept;
		let nextVertTouchY = yintercept;

		// Increment xstep and ystep until we find a wall
		while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
			let wallGridContent = grid.getWallContentAt(
				nextVertTouchX + (this.isRayFacingLeft ? -1 : 0),
				nextVertTouchY
			);
			if (wallGridContent != 0) {
				foundVertWallHit = true;
				vertWallHitX = nextVertTouchX;
				vertWallHitY = nextVertTouchY;
				vertWallColor = wallGridContent;
				break;
			} else {
				nextVertTouchX += xstep;
				nextVertTouchY += ystep;
			}
		}

		// Calculate both horizontal and vertical distances and choose the smallest value
		let horzHitDistance = (foundHorzWallHit)
			? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY)
			: Number.MAX_VALUE;
		let vertHitDistance = (foundVertWallHit)
			? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
			: Number.MAX_VALUE;

		// only store the smallest of the distances
		if (vertHitDistance < horzHitDistance) {
			this.wallHitX = vertWallHitX;
			this.wallHitY = vertWallHitY;
			this.distance = vertHitDistance;
			this.hitWallColor = vertWallColor;
			this.wasHitVertical = true;
		} else {
			this.wallHitX = horzWallHitX;
			this.wallHitY = horzWallHitY;
			this.distance = horzHitDistance;
			this.hitWallColor = horzWallColor;
			this.wasHitVertical = false;
		}
	}
	render() {
		stroke("rgba(255, 0, 0, 1.0)");
		line(
			MINIMAP_SCALE_FACTOR * player.x,
			MINIMAP_SCALE_FACTOR * player.y,
			MINIMAP_SCALE_FACTOR * this.wallHitX,
			MINIMAP_SCALE_FACTOR * this.wallHitY
		);
	}
}

let grid = new Map();
let player = new Player();
let rays = [];

function keyPressed() {
	if (keyCode == UP_ARROW) {
		player.walkDirection = +1;
	} else if (keyCode == DOWN_ARROW) {
		player.walkDirection = -1;
	} else if (keyCode == RIGHT_ARROW) {
		player.turnDirection = +1;
	} else if (keyCode == LEFT_ARROW) {
		player.turnDirection = -1;
	}
}

function keyReleased() {
	if (keyCode == UP_ARROW) {
		player.walkDirection = 0;
	} else if (keyCode == DOWN_ARROW) {
		player.walkDirection = 0;
	} else if (keyCode == RIGHT_ARROW) {
		player.turnDirection = 0;
	} else if (keyCode == LEFT_ARROW) {
		player.turnDirection = 0;
	}
}

function castAllRays() {
	// start first ray subtracting half of the FOV
	let rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

	// empty array of rays
	rays = [];

	// loop all columns casting the rays
	for (let col = 0; col < NUM_RAYS; col++) {
		let ray = new Ray(rayAngle);
		ray.cast();
		rays.push(ray);
		rayAngle += FOV_ANGLE / NUM_RAYS;
	}
}

function renderCeiling() {
	noStroke();
	fill('#414141');
	rect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT / 2);
}

function renderFloor() {
	noStroke();
	fill('#818181');
	rect(0, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT);
}

function render3DProjectedWalls() {
	renderCeiling();
	renderFloor();

	// loop every ray in the array of rays
	for (let i = 0; i < NUM_RAYS; i++) {
		let ray = rays[i];

		// get the perpendicular distance to the wall to fix fishbowl distortion
		let correctWallDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);

		// calculate the distance to the projection plane
		let distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);

		// projected wall height
		let wallStripHeight = (TILE_SIZE / correctWallDistance) * distanceProjectionPlane;

		// set a darker color if the wall is facing north-south
		let colorBrightness = ray.wasHitVertical ? 255 : 200;

		// set the correct color based on the wall hit grid content (1: red, 2: green, 3: blue)
		let colorR = ray.hitWallColor == 1 ? colorBrightness : 0;
		let colorG = ray.hitWallColor == 2 ? colorBrightness : 0;
		let colorB = ray.hitWallColor == 3 ? colorBrightness : 0;
		let alpha = 1.0;

		fill("rgba(" + colorR + ", " + colorG + ", " + colorB + ", " + alpha + ")");
		noStroke();

		// render a rectangle with the calculated projected wall height
		rect(
			i * WALL_STRIP_WIDTH,
			(WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
			WALL_STRIP_WIDTH,
			wallStripHeight
		);
	}
}

function normalizeAngle(angle) {
	angle %= 2 * Math.PI;
	if (angle < 0) {
		angle += 2 * Math.PI;
	}
	return angle;
}

function distanceBetweenPoints(x1, y1, x2, y2) {
	return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function setup() {
	createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
	player.update();
	castAllRays();
}

function draw() {
	background("#111");
	update();

	render3DProjectedWalls();

	grid.render();
	for (ray of rays) {
		ray.render();
	}
	player.render();
}
