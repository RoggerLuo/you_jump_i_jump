
export default {
    a:0,
    b:0,
    c:0,
    xSpeed:0,
    x:0,
    z:0,
    computeProportion(Cube,Jumper){
        const cube = Cube.getCurrent().position
        const j = Jumper.jumper.position
        const xIntercept = -(cube.x - j.x)
        const zIntercept = -(cube.z - j.z)
        const longestEdge = Math.sqrt(Math.pow(xIntercept,2)+Math.pow(zIntercept,2))
        // console.log(xIntercept,zIntercept,longestEdge)
        this.a = xIntercept
        this.b = zIntercept
        this.c = longestEdge
    },
    computeXZ(){
        const temp = this.xSpeed/this.c
        this.x = temp*this.a
        this.z = temp*this.b
    }
}

