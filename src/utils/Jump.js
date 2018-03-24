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
        if(this.status === 'press'){
            // this.jumper.scale.y -= 0.01
            // this.jumper.scale.x += 0.01
            // this.jumper.scale.z += 0.01
            this.framesNum += 1
            cb()
        }
    },

    onUp(){
        this.status = 'normal'
        this.jumper.geometry.translate(0, -1, 0)
        this.jumper.position.y = 2
        this.computeXZ()
    },
    duringFlying(renderAgain,landing_cb){
        // if (this.jumper.scale.y < 1) { 
        //     this.jumper.scale.y += 0.02
        // }
        // if (this.jumper.scale.x > 1) {
        //     if((this.jumper.scale.x - 0.02) < 1){
        //         this.jumper.scale.x = 1
        //         this.jumper.scale.z = 1                
        //     }else{
        //         this.jumper.scale.x -= 0.02
        //         this.jumper.scale.z -= 0.02                
        //     }
        // }

        if (this.jumper.position.y >= 2) { //flying 执行很多次
            renderAgain()
            this.changeXZ()
            this.changeY()
        }else{ //land 每次跳跃 仅执行一次
            this.speed = {
                vertical:startSpeedY,
                horizontal:0,
                x: 0, 
                z: 0 
            }
            this.framesNum = 0
            this.jumper.position.y = 2
            // this.jumper.scale.y = 1
            // this.jumper.scale.x = 1
            // this.jumper.scale.z = 1
            landing_cb()
        }
        console.log(this.jumper.position.y)

    },
    framesNum:0,
    jumper:undefined,
    status:'normal',
    speed:{
        vertical:startSpeedY,
        horizontal:0,
        x: 0, 
        z: 0 
    },
    changeXZ(){
        this.jumper.position.x -= this.speed.x
        this.jumper.position.z -= this.speed.z
    },
    changeY(){
        this.jumper.position.y += this.speed.vertical
        // if(this.jumper.position.y < 2){
        //     this.jumper.position.y = 2
        // }
        this.speed.vertical -= gravity 
    },
    computeXZ(){
        const {a, b, c} = computeProportion(this.Cube,this.jumper)
        const temp = this.speed.horizontal/c
        const x = temp*a
        const z = temp*b
        this.speed.horizontal = { x, z }
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

function speedAlgorithm(status){
    status.counter += 1
    const x_levarage = 5.1/30
    const y_levarage = 0.35/3.8
    status.xSpeed = y_levarage * curveFunc(status.counter*x_levarage)
}

function curveFunc (x) { //曲线正比例函数
    if(x>1){
        return Math.logx + 1        
    }else{
        return Math.pow(x,3)
    }
}