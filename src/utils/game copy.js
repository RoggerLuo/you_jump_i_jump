import * as THREE from 'three'

export default = {
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
    }
    // 基于更新后的摄像机位置，重新设置摄
    // 初始化jumper：游戏主角
    create() {
        const material = new THREE.MeshLambertMaterial({ color: 0x232323 })
        const geometry = new THREE.CubeGeometry(this.config.jumperWidth, this.config.jumperHeight, this.config.jumperDeep)
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
        //水平运动方向
        // jumper根据下一个方块的位置来确定水平运动方向
        if (direction === 'left') {
            this.jumper.position.x -= this.statu.xSpeed
        } else {
            this.jumper.position.z -= this.statu.xSpeed
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
    },

}


_handleMousedown: function() {
    const self = this
    //这个scale属性是高度，按得越久高度越矮
    Jumper.press(()=>{
        self._render(self.scene, self.Camera.camera) //这个render要改
        requestAnimationFrame(function() {
            self._handleMousedown()
        })
    })
},

// 鼠标松开或触摸结束绑定的函数
_handleMouseup: function() {
    var self = this
    const direction  = this.Cube.direction
    self.Jumper.up(direction,flying,landing)
    function flying(){
        // 每一次的变化，渲染器都要重新渲染，才能看到渲染效果
        self._render(self.scene, self.Camera.camera)
        requestAnimationFrame(function() {
            self._handleMouseup()
        })
    }
    function landing(){
        self._checkInCube()
        if (self.falledStat.location === 1) {
            // 掉落成功，进入下一步
            self.score++
            self.Cube.add()
            self.Camera.update() // 更新相机坐标
            if (self.successCallback) {
                self.successCallback(self.score)
            }
        } else {
            // 掉落失败，进入失败动画
            self._falling()
        }
    }
},
/**
 *游戏失败执行的碰撞效果
 *@param {String} dir 传入一个参数用于控制倒下的方向：'rightTop','rightBottom','leftTop','leftBottom','none'
 **/
_fallingRotate: function(dir) {
    var self = this
    var offset = self.falledStat.distance - self.Cube.size.width / 2
    var rotateAxis = 'z' // 旋转轴
    var rotateAdd = j.rotation[rotateAxis] + 0.1 // 旋转速度
    var rotateTo = j.rotation[rotateAxis] < Math.PI / 2 // 旋转结束的弧度
    var fallingTo = self.config.ground + self.config.jumperWidth / 2 + offset
    const j = self.Jumper.jumper

    if (dir === 'rightTop') {
        rotateAxis = 'x'
        rotateAdd = j.rotation[rotateAxis] - 0.1
        rotateTo = j.rotation[rotateAxis] > -Math.PI / 2
        j.geometry.translate.z = offset
    } else if (dir === 'rightBottom') {
        rotateAxis = 'x'
        rotateAdd = j.rotation[rotateAxis] + 0.1
        rotateTo = j.rotation[rotateAxis] < Math.PI / 2
        j.geometry.translate.z = -offset
    } else if (dir === 'leftBottom') {
        rotateAxis = 'z'
        rotateAdd = j.rotation[rotateAxis] - 0.1
        rotateTo = j.rotation[rotateAxis] > -Math.PI / 2
        j.geometry.translate.x = -offset
    } else if (dir === 'leftTop') {
        rotateAxis = 'z'
        rotateAdd = j.rotation[rotateAxis] + 0.1
        rotateTo = j.rotation[rotateAxis] < Math.PI / 2
        j.geometry.translate.x = offset
    } else if (dir === 'none') {
        rotateTo = false
        fallingTo = self.config.ground
    } else {
        throw Error('Arguments Error')
    }
    if (!self.fallingStat.end) {
        if (rotateTo) {
            j.rotation[rotateAxis] = rotateAdd
        } else if (j.position.y > fallingTo) {
            self.jumper.position.y -= self.config.fallingSpeed
        } else {
            self.fallingStat.end = true
        }
        self._render()
        requestAnimationFrame(function() {
            self._falling()
        })
    } else {
        if (self.failedCallback) {
            self.failedCallback()
        }
    }
},
