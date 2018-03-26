import shape from './shape'
import algorithm from './algorithm'
const rateY = 0.2
const startSpeedY = 1.5
const gravity = 0.15

export default {
    init(jumper,Cube){
        this.jumper = jumper
        this.Cube = Cube
    },
    onPress(){
        this.status = 'press'
        this.jumper.geometry.translate(0, 1, 0)
        this.jumper.position.y = 1
    },
    duringPressing(cb){
        console.log(this.framesNum)
        if(this.status === 'press'){
            shape.getFat(this.jumper)
            this.framesNum += 1
            cb()
        }
    },
    onUp(){
        this.status = 'normal'
        this.jumper.geometry.translate(0, -1, 0)
        this.jumper.position.y = 2
        this.computeHorizontalSpeed()  
    },
    duringFlying(renderAgain,landing_cb){
        shape.getFit(this.jumper)
        if (this.jumper.position.y >= 2) { //flying 执行很多次
            renderAgain()
            this.changeXZ()
            this.changeY()
        }else{ //land 每次跳跃 仅执行一次
            this.onLand(landing_cb)
        }
    },
    restart(jumper){
        this.jumper = jumper
        this.speed = {
            vertical: startSpeedY,
            horizontal: { x: 0, z: 0 }
        }
        this.framesNum = 0
        this.status = 'normal'
        shape.reborn(this.jumper)
        this.jumper.position.y = 2
    },
    onLand(landing_cb){
        this.restart(this.jumper)
        landing_cb()
    },
    framesNum: 0,
    jumper: undefined,
    status: 'normal',
    speed:{
        vertical: startSpeedY,
        horizontal: { x: 0, z: 0 }
    },
    changeXZ(){
        this.jumper.position.x -= this.speed.horizontal.x
        this.jumper.position.z -= this.speed.horizontal.z
    },
    changeY(){
        this.jumper.position.y += this.speed.vertical
        this.speed.vertical -= gravity 
    },
    computeHorizontalSpeed(){
        const compositeSpeed = algorithm(this.framesNum)
        const {a, b, c} = computeProportion(this.Cube,this.jumper)
        const temp = compositeSpeed/c
        const x = temp*a
        const z = temp*b
        this.speed.horizontal = { x, z }
    },
    countTime(){
        let fakeSpeedY = startSpeedY + this.framesNum * rateY
        let fakePositionY = 2 
        let counter = 0
        while(fakePositionY>=2){
            fakePositionY += fakeSpeedY
            fakeSpeedY -= gravity
            counter += 1
        }        
        return counter
    }
}

function computeProportion(Cube,jumper){
    const cube = Cube.getCurrent().position
    const j = jumper.position
    const xIntercept = -(cube.x - j.x)
    const zIntercept = -(cube.z - j.z)
    const longestEdge = Math.sqrt(Math.pow(xIntercept,2)+Math.pow(zIntercept,2))
    return {
        a : xIntercept,
        b : zIntercept,
        c : longestEdge
    }
}
