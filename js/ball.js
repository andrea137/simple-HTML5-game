// constructor function for balls
function Ball(x, y, angle, v, diameter, bullet) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.v = v;
    this.radius = diameter / 2;
    this.color = 'black';

    this.draw = function (ctx) {
        ctx.save();
        ctx.beginPath();
        //ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        grd = ctx.createRadialGradient(this.x, this.y, this.radius / 4,
            this.x, this.y, this.radius);
        if (bullet) {
            grd.addColorStop(0, "red");
            grd.addColorStop(1, "orange");
        } else {
            grd.addColorStop(0, "red");
            grd.addColorStop(0.17, "orange");
            grd.addColorStop(0.33, "yellow");
            grd.addColorStop(0.5, "green");
            grd.addColorStop(0.666, "blue");
            grd.addColorStop(1, "violet");
        }
        ctx.fillStyle = grd;


        ctx.fill();
        ctx.restore();
        //this.color = 'red';
    };

    this.move = function () {
        // add horizontal increment to the x pos
        // add vertical increment to the y pos

        var incX = this.v * Math.cos(this.angle);
        var incY = this.v * Math.sin(this.angle);

        this.x += calcDistanceToMove(delta, incX);
        this.y += calcDistanceToMove(delta, incY);
    };
}