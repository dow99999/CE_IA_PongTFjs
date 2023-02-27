class Pong extends Collidable {
  constructor(ctx, x, y, velY, color, width, height, hit_counter=[]) {
    super(x, y, (x, y) => {
      let slope = ((y - this._y) / (x - this._x))
      slope = x <= this._x ? slope : slope * -1;
      let c = this._y - (slope * this._x)


      let perimeter_y = Math.max((slope * (this.sx)) + c, this.sy)
      perimeter_y = (perimeter_y != this.sy) ? Math.min(perimeter_y, this.sy + this.height) : perimeter_y;

      let perimeter_coords = [ this.sx + ((x <= this._x) ? 0 : this.width), perimeter_y ]

      // ctx.beginPath();
      // ctx.moveTo(this._x, this._y);
      // ctx.strokeStyle = "#FF0000";
      // ctx.lineWidth = 10;
      // ctx.lineTo(perimeter_coords[0], perimeter_coords[1]);
      // ctx.stroke();
      // ctx.strokeStyle = "#000000";
      // this.ctx.closePath();
      // ctx.lineWidth = 1;

      let distance = this._euclideanDistance(this._x, this._y, perimeter_coords[0], perimeter_coords[1])
      
      return distance;
    })

    this.sx = Number.parseInt(x - (width / 2));
    this.sy = Number.parseInt(y - (height / 2));
    this.ctx = ctx;
    this.velX = 0;
    this.velY = velY;
    this.color = color;

    this.hit_counter = hit_counter;

    this.width = width;
    this.height = height;
  }

  info() {
    return "[Pong] Pos: (" + this._x + ", " + this._y + ") Vel: (" + this.velX + "," + this.velY + ")";
  }

  dibuixar() {
    this.ctx.beginPath();
    this.ctx.rect(this.sx, this.sy, this.width, this.height);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();
  }

  update() {
    let lastx = this._x;
    let lasty = this._y;
    let lastsx = this.sx;
    let lastsy = this.sy;

    this._x += this.velX;
    this._y += this.velY;

    this.sx = Number.parseInt(this._x - (this.width / 2));
    this.sy = Number.parseInt(this._y - (this.height / 2));

    if (this.sx + this.width >= ctx.canvas.width || this.sx <= 0) {
      this._x = lastx;
      this.sx = lastsx;
    } 
    if (this.sy + this.height >= ctx.canvas.height || this.sy <= 0) {
      this._y = lasty;
      this.sy = lastsy;
    }
  }


  /**
   * 
   * @param {Collidable} collidables
   */
  collisio(collidables) {
    for (var i = 0; i < collidables.length; i++) {
      if (this != collidables[i] && this.checkCollition(collidables[i])) {
        this.hit_counter[0]++;

        collidables[i].velX *= -1
        collidables[i].velY += this.velY

        collidables[i].velY = Math.min(collidables[i].velY, 10)
      }
    }
  }
}