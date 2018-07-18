class Ball {
	constructor(radius, color) {
		this.radius = radius;
		this.color = color;
		this.isMoving = true;
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.mass = 1;
		this.drag = 0.995;
		this.bounceFactor = 0.8;
		this.init();
	}
	init() {
		
		/*graphics.beginFill(color);
		graphics.drawCircle(0, 0, radius);
		graphics.endFill();*/
	}
	draw(ctx) {
		ctx.beginPath();
		ctx.strokeStyle = this.color;
		ctx.fillStyle = this.color;
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
	}
}