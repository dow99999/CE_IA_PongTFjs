class Ball extends Collidable {
  constructor(ctx, x, y, velX, velY, color, tamany) {
    super(x, y, (x, y) => {
      return tamany
    })

    this.ctx = ctx;
    this.velX = velX;
    this.velY = velY;
    this.color = color;
    this.tamany = tamany;
  }

  info() {
    return "[Ball] Pos: (" + this._x + ", " + this._y + ") Vel: (" + this.velX + "," + this.velY + ")";
  }

  dibuixar() {
    this.ctx.beginPath();
    this.ctx.arc(this._x, this._y, this.tamany, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();
  }

  update() {
    let lastx = this._x;
    let lasty = this._y;

    this._x += this.velX;
    this._y += this.velY;

    if (this._x >= ctx.canvas.width - this.tamany || this._x <= this.tamany){
      this.velX *= -1;
      this._x = lastx
    }
    if (this._y >= ctx.canvas.height - this.tamany || this._y <= this.tamany){
      this.velY *= -1;
      this._y = lasty
    }
  }


  /**
   * 
   * @param {Collidable} collidables
   */
  collisio(collidables) {
    // for (var i = 0; i < collidables.length; i++) {
    //   if (this != collidables[i] && this.checkCollition(collidables[i])) {
    //     let ax = this.velX;
    //     let ay = this.velY;

    //     this.velX = collidables[i].velX;
    //     this.velY = collidables[i].velY;
    //     collidables[i].velX = ax
    //     collidables[i].velY = ay
    //   }
    // }
  }
}
