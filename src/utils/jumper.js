import * as THREE from 'three'

export default {
    size: {
        width: 1, 
        height: 2,
        deep: 1
    },
    status: {
        compress:0,
        counter: 0,
        ready: false, // 鼠标按完没有
        xSpeed: 0, // xSpeed根据鼠标按的时间进行赋值
        ySpeed: 0 // ySpeed根据鼠标按的时间进行赋值
    },
    jumper:undefined,
    init(scene){
        this.scene = scene
    },
    // 基于更新后的摄像机位置，重新设置摄
    // 初始化jumper：游戏主角
    create() {
        const material = new THREE.MeshLambertMaterial({ color: 0x232323 })
        const geometry = new THREE.CubeGeometry(this.size.width, this.size.height, this.size.deep)
        geometry.translate(0, 0, 0) //把这个元素抬高1的高度，(cube高度是2，y=1)，(jumper高度是2,y=1,再抬高1)，
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.y = 2
        this.jumper = mesh
        this.scene.add(this.jumper)
    },
    verticalPosChange(){
        // jumper在垂直方向上运动
        this.jumper.position.y += this.status.ySpeed

        //还原jumper的高度
        if (this.jumper.scale.y < 1) {
            this.jumper.scale.y += 0.02
            // this.status.compress += 0.01
            // this.jumper.geometry.translate(0, this.status.compress, 0)
            // console.log(this.status.compress)
        }
        // else{
        //     this.status.compress = 0
        // }

        // jumper在垂直方向上先上升后下降
        this.status.ySpeed -= 0.02 // 这个可以看成加速度
    },
    press(cb){
        const self = this
        if (!self.status.ready && self.jumper.scale.y > 0.02) { 
            self.jumper.scale.y -= 0.01


            // self.status.compress -= 0.005
            // console.log('self.jumper.scale.y',self.jumper.scale.y)
            // console.log('this.status.compress',this.status.compress)

            // self.jumper.geometry.translate(0, self.status.compress, 0)
            // self.status.xSpeed += 0.006 //线性 增加速度 //0.004
            xSpeedAlgorithm(self.status)
            self.status.ySpeed += 0.01
            /* 
                ySpeed, 这个决定了它可以跳多高，
                也决定了它置空的时间,
                所以也作为一部分因素 决定了它会跑多远, 时间x速度 = 水平距离

                原x的速度，是三角形abc最长边c的速度,
                求出a和b和c的比例，就能求出x和z方向的分速度,

            */
            
            cb(self.status.xSpeed)
        }
    },
    isFlying(){
        return this.jumper.position.y >= 2
    },
    up(direction,Guide,flying_cb,landing_cb){
        // this.jumper.geometry.translate(0, 0, 0)
        // this.jumper.position.y = 2

        // 标记鼠标已经松开
        this.status.ready = true
        // 判断jumper是在方块水平面之上，是的话说明需要继续运动
        if (this.isFlying()) {
            this.horizontalPosChange(Guide)
            this.verticalPosChange()
            this.airRotate(direction)
            flying_cb()
        }else{
            // jumper掉落到方块水平位置，开始充值状态，并开始判断掉落是否成功
            this.status.ready = false
            this.status.xSpeed = 0
            this.status.ySpeed = 0
            this.status.counter = 0 // 新增计数器
            this.jumper.position.y = 2
            landing_cb()
        }
    },
    horizontalPosChange(Guide){
        this.jumper.position.x -= Guide.x
        this.jumper.position.z -= Guide.z
    },
    
    airRotate(dir) { //t为总帧数
        /*
            上升的时候每次加 0.01
            下降的时候每次减 0.02

            上升的时候 花了时间t
            那么，v降为0的时间是t/2
            那么，落回地面的时间是 (t/2)*2 = t
        */
        const j = this.jumper
        const totalFrameNum = this.status.counter
        let rotationValue
        const unit = (2*Math.PI/(totalFrameNum))
        let nextHalfPassed = 0
        if(this.status.ySpeed > 0){
            const frameNumPassed = totalFrameNum/2 - this.status.ySpeed/0.02
            rotationValue = frameNumPassed*unit
        }else{
            nextHalfPassed = (-this.status.ySpeed/0.02)
            // console.log('nextHalfPassedNumber',nextHalfPassed)
            rotationValue = Math.PI + nextHalfPassed*unit
            if(rotationValue>=Math.PI*2){
                rotationValue=Math.PI*2
            }
        }

        if (dir === 'left') {
            // debugger
            // j.rotateOnAxis(new THREE.Vector3(0,1,1),unit)
            j.rotation['z'] = rotationValue
        }else{
            j.rotation['x'] = - rotationValue
        }
    }

}

const curveFunc = x => { //曲线正比例函数
    //y=log(x+0.1) +1
    return Math.log(x+0.1) + 1
}
function xSpeedAlgorithm(status){
    status.counter += 1
    const x_levarage = 5.1/30
    const y_levarage = 0.35/3.8
    status.xSpeed = y_levarage*curveFunc(status.counter*x_levarage)
}
// status.xSpeed += 0.006

/*
    最后xSpeed累积到0.18的时候是最通用的距离，
    0.18/0.006 = 30个count
*/

/*
    max y=3.3

    x: 0~10 , 
    y: 0~3,
    x=5.1, y=2.7 的时候变化率开始大程度衰减

    so, y=2.7, 应该调整成0.18   
    so, curveFunc/2.7 * 0.18

    30个count为 x=5.1
    1个count为 5.1/30
*/

