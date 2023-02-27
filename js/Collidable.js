class Collidable {
  constructor(x, y, dist_fnc=(x, y) => { return 0 }) {
    this._x = x;
    this._y = y;
    
    this._distance = dist_fnc
  }

  _euclideanDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2))
  }
  
  _powEuclideanDistance(x1, y1, x2, y2) {
    return Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)
  }

  /**
   * 
   * @param {Collidable} target 
   */
  checkCollition(target) {    
    let total_distance = this._euclideanDistance(this._x, this._y, target._x, target._y);
    let self_distance = this._distance(target._x, target._y);
    let target_distance = target._distance(this._x, this._y);
    
    return self_distance + target_distance >= total_distance;
  }
}