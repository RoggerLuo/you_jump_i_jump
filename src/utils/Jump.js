
export default {
    init(jumper){
        this.jumper = jumper
    },
    timeClear(){
        this.framesNum = 0        
    },
    timeRecord(){
        this.framesNum += 1
    },
    framesNum:0,
    jumper:undefined,
    speed:{
        vertical:0,
        horizontal:{ x: 0, z: 0 }
    },
    changeXZ(){
        this.jumper.position.x -= this.speed.horizontal.x
        this.jumper.position.z -= this.speed.horizontal.z
    },
    changeY(){
        this.jumper.position.y += this.speed.vertical
    },
    ChangeHeight(){
        if (this.jumper.scale.y < 1) {
            this.jumper.scale.y += 0.02
        }
    },
    computeXZ(Cube,Jumper,horizontal){
        const {a, b, c} = computeProportion(Cube,Jumper)
        const temp = horizontal/c
        x = temp*a
        z = temp*b
        this.speed.horizontal = { x, z }
    }
}


function computeProportion(Cube,Jumper){
    const cube = Cube.getCurrent().position
    const j = Jumper.jumper.position
    const xIntercept = -(cube.x - j.x)
    const zIntercept = -(cube.z - j.z)
    const longestEdge = Math.sqrt(Math.pow(xIntercept,2)+Math.pow(zIntercept,2))
    return {
        a : xIntercept,
        b : zIntercept,
        c : longestEdge
    }
}