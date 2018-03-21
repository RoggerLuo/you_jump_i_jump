import * as THREE from 'three'

export default {
    size: {
        width: 1, 
        height: 2,
        deep: 1
    },
    status: {
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
            self.status.xSpeed += 0.004 //线性加速
            self.status.ySpeed += 0.008 //线性加速
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
        // 运动伴随着缩放
        if (this.jumper.scale.y < 1) {
            this.jumper.scale.y += 0.02
        }
        // jumper在垂直方向上先上升后下降
        this.status.ySpeed -= 0.01
    }
}
