import * as THREE from 'three'

export default {
    size: {
        width: 1, 
        height: 2,
        deep: 1
    },
    status: {
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
        geometry.translate(0, 1, 0) //把这个元素抬高1的高度，(cube高度是2，y=1)，(jumper高度是2,y=1,再抬高1)，
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.y = 1
        this.jumper = mesh
        this.scene.add(this.jumper)
    },
    press(cb){
        const self = this
        if (!self.status.ready && self.jumper.scale.y > 0.02) { 
            self.jumper.scale.y -= 0.01
            // self.status.xSpeed += 0.006 //线性 增加速度 //0.004
            speedUpAlgorithm(self.status)
            /* 
                线性的ySpeed, 这个决定了它可以跳多高，
                也决定了它置空的时间,
                所以也作为一部分因素 决定了它会跑多远, 时间x速度 = 水平距离
            */
            self.status.ySpeed += 0.016
            cb()
        }
    },
    isFlying(){
        return this.jumper.position.y >= 1
    },
    up(direction,flying_cb,landing_cb){
        // 标记鼠标已经松开
        this.status.ready = true
        // 判断jumper是在方块水平面之上，是的话说明需要继续运动
        if (this.isFlying()) {
            this.horizontalPosChange(direction)
            this.verticalPosChange()
            flying_cb()
        }else{
            // jumper掉落到方块水平位置，开始充值状态，并开始判断掉落是否成功
            this.status.ready = false
            this.status.xSpeed = 0
            this.status.ySpeed = 0
            this.status.counter = 0 // 新增计数器

            this.jumper.position.y = 1
            landing_cb()
        }
    },
    horizontalPosChange(direction){
        // jumper根据下一个方块的位置来确定 水平运动方向
        if (direction === 'left') {
            this.jumper.position.x -= this.status.xSpeed
        } else {
            this.jumper.position.z -= this.status.xSpeed
        }
    },
    verticalPosChange(){
        // jumper在垂直方向上运动
        this.jumper.position.y += this.status.ySpeed

        //还原jumper的高度
        if (this.jumper.scale.y < 1) {
            this.jumper.scale.y += 0.02
        }

        // jumper在垂直方向上先上升后下降
        this.status.ySpeed -= 0.02 // 这个可以看成加速度
    }
}

const curveFunc = x => { //曲线正比例函数
    //y=(log(x/2+0.01))/2 + 1
    // return Math.log(x/2+0.01)/2 + 1 
    return Math.log(x) + 2
}
function speedUpAlgorithm(status){
    status.counter += 1
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
    const x_levarage = 5.1/30
    const y_levarage = 0.18/3.8
    status.xSpeed = y_levarage*curveFunc(status.counter*x_levarage)
}




