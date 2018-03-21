import * as THREE from 'three'
import Camera from './camera'
import Cube from './cube'

function Game() {
    // 基本参数
    this.config = {
        isMobile: false,
        background: '#CCCEDA', // 背景颜色 0x282828
        ground: -1, // 地面y坐标
        fallingSpeed: 0.2, // 游戏npm失败掉落速度
        jumperColor: 0x232323,
        jumperWidth: 1, // jumper宽度
        jumperHeight: 2, // jumper高度
        jumperDeep: 1, // jumper深度
    }
    // 游戏状态
    this.score = 0
    this.size = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer({ antialias: true })

    // this.cubes = [] // 方块数组
    // this.cubeStat = {
    //     nextDir: '' // 下一个方块相对于当前方块的方向: 'left' 或 'right'
    // }
    this.jumperStat = {
        ready: false, // 鼠标按完没有
        xSpeed: 0, // xSpeed根据鼠标按的时间进行赋值
        ySpeed: 0 // ySpeed根据鼠标按的时间进行赋值
    }
    this.falledStat = {
        location: -1, // jumper所在的位置
        distance: 0 // jumper和最近方块的距离
    }
    this.fallingStat = {
        speed: 0.2, // 游戏失败后垂直方向上的掉落速度
        end: false // 掉到地面没有
    }

    const cubeSize = {
        width: 4, // 方块宽度
        height: 2, // 方块高度
        deep: 4, // 方块深度        
    }


    this.Camera = Camera
    this.Camera.init(this.size,this.renderer,this.scene)

    this.Cube = Cube
    this.Cube.init(cubeSize,this.scene,this.Camera)
}

Game.prototype = {
    init: function() {
        this._checkUserAgent() // 检测是否移动端
        this.Camera.set() // 设置摄像机位置
        this._setRenderer() // 设置渲染器参数
        this._setLight() // 设置光照
        this.Cube.add() // 加一个方块
        this.Cube.add() // 再加一个方块
        this._createJumper() // 加入游戏者jumper
        this.Camera.update() // 更新相机坐标
        this._listen()
    },
    _listen() {
        var self = this
        var mouseEvents = (self.config.isMobile) ? {
            down: 'touchstart',
            up: 'touchend',
        } : {
            down: 'mousedown',
            up: 'mouseup',
        }
        // 事件绑定到canvas中
        var canvas = document.querySelector('canvas')
        canvas.addEventListener(mouseEvents.down, function() {
            self._handleMousedown()
        })
        // 监听鼠标松开的事件
        canvas.addEventListener(mouseEvents.up, function(evt) {
            self._handleMouseup()
        })
        // 监听窗口变化的事件
        window.addEventListener('resize', function() {
            self._handleWindowResize()
        })
    },
    // 游戏失败重新开始的初始化配置
    restart: function() {
        this.score = 0
        this.Camera.newPos()
        this.fallingStat = {
            speed: 0.2,
            end: false
        }
        this.Cube.removeAll()
        // 删除所有方块
        // var length = this.cubes.length
        // for (var i = 0; i < length; i++) {
        //     this.scene.remove(this.cubes.pop())
        // }
        // 删除jumper
        this.scene.remove(this.jumper)
        // 显示的分数设为 0
        this.successCallback(this.score)
        this.Cube.add()
        this.Cube.add()
        this._createJumper()
        this.Camera.update() // 更新相机坐标

    },
    // 游戏成功的执行函数, 外部传入
    addSuccessFn: function(fn) {
        this.successCallback = fn
    },
    // 游戏失败的执行函数, 外部传入
    addFailedFn: function(fn) {
        this.failedCallback = fn
    },
    // 检测是否手机端
    _checkUserAgent: function() {
        var n = navigator.userAgent;
        if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i)) {
            this.config.isMobile = true
        }
    },
    // THREE.js辅助工具
    _createHelpers: function() {
        var axesHelper = new THREE.AxesHelper(10)
        this.scene.add(axesHelper)
    },
    // 窗口缩放绑定的函数
    _handleWindowResize: function() {
        this._setSize()
        this.Camera.resize(this.size)
        this.renderer.setSize(this.size.width, this.size.height)
        this._render()
    },
    /**
     *鼠标按下或触摸开始绑定的函数
     *根据鼠标按下的时间来给 xSpeed 和 ySpeed 赋值
     *@return {Number} this.jumperStat.xSpeed 水平方向上的速度
     *@return {Number} this.jumperStat.ySpeed 垂直方向上的速度
     **/
    _handleMousedown: function() {
        var self = this
        if (!self.jumperStat.ready && self.jumper.scale.y > 0.02) {
            self.jumper.scale.y -= 0.01
            self.jumperStat.xSpeed += 0.004
            self.jumperStat.ySpeed += 0.008
            self._render(self.scene, self.Camera.camera)
            requestAnimationFrame(function() {
                self._handleMousedown()
            })
        }
    },

    // 鼠标松开或触摸结束绑定的函数
    _handleMouseup: function() {
        var self = this
        // 标记鼠标已经松开
        self.jumperStat.ready = true
        // 判断jumper是在方块水平面之上，是的话说明需要继续运动
        if (self.jumper.position.y >= 1) {
            // jumper根据下一个方块的位置来确定水平运动方向
            if (self.Cube.nextDir === 'left') {
                self.jumper.position.x -= self.jumperStat.xSpeed
            } else {
                self.jumper.position.z -= self.jumperStat.xSpeed
            }
            // jumper在垂直方向上运动
            self.jumper.position.y += self.jumperStat.ySpeed
            // 运动伴随着缩放
            if (self.jumper.scale.y < 1) {
                self.jumper.scale.y += 0.02
            }
            // jumper在垂直方向上先上升后下降
            self.jumperStat.ySpeed -= 0.01
            // 每一次的变化，渲染器都要重新渲染，才能看到渲染效果
            self._render(self.scene, self.Camera.camera)
            requestAnimationFrame(function() {
                self._handleMouseup()
            })
        } else {
            // jumper掉落到方块水平位置，开始充值状态，并开始判断掉落是否成功
            self.jumperStat.ready = false
            self.jumperStat.xSpeed = 0
            self.jumperStat.ySpeed = 0
            self.jumper.position.y = 1
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
        var offset = self.falledStat.distance - self.config.cubeWidth / 2
        var rotateAxis = 'z' // 旋转轴
        var rotateAdd = self.jumper.rotation[rotateAxis] + 0.1 // 旋转速度
        var rotateTo = self.jumper.rotation[rotateAxis] < Math.PI / 2 // 旋转结束的弧度
        var fallingTo = self.config.ground + self.config.jumperWidth / 2 + offset

        if (dir === 'rightTop') {
            rotateAxis = 'x'
            rotateAdd = self.jumper.rotation[rotateAxis] - 0.1
            rotateTo = self.jumper.rotation[rotateAxis] > -Math.PI / 2
            self.jumper.geometry.translate.z = offset
        } else if (dir === 'rightBottom') {
            rotateAxis = 'x'
            rotateAdd = self.jumper.rotation[rotateAxis] + 0.1
            rotateTo = self.jumper.rotation[rotateAxis] < Math.PI / 2
            self.jumper.geometry.translate.z = -offset
        } else if (dir === 'leftBottom') {
            rotateAxis = 'z'
            rotateAdd = self.jumper.rotation[rotateAxis] - 0.1
            rotateTo = self.jumper.rotation[rotateAxis] > -Math.PI / 2
            self.jumper.geometry.translate.x = -offset
        } else if (dir === 'leftTop') {
            rotateAxis = 'z'
            rotateAdd = self.jumper.rotation[rotateAxis] + 0.1
            rotateTo = self.jumper.rotation[rotateAxis] < Math.PI / 2
            self.jumper.geometry.translate.x = offset
        } else if (dir === 'none') {
            rotateTo = false
            fallingTo = self.config.ground
        } else {
            throw Error('Arguments Error')
        }
        if (!self.fallingStat.end) {
            if (rotateTo) {
                self.jumper.rotation[rotateAxis] = rotateAdd
            } else if (self.jumper.position.y > fallingTo) {
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
    /**
     *游戏失败进入掉落阶段
     *通过确定掉落的位置来确定掉落效果
     **/
    _falling: function() {
        var self = this
        if (self.falledStat.location === 0) {
            self._fallingRotate('none')
        } else if (self.falledStat.location === -10) {
            if (self.Cube.nextDir === 'left') {
                self._fallingRotate('leftTop')
            } else {
                self._fallingRotate('rightTop')
            }
        } else if (self.falledStat.location === 10) {
            if (self.Cube.nextDir === 'left') {
                if (self.jumper.position.x < self.cubes[self.cubes.length - 1].position.x) {
                    self._fallingRotate('leftTop')
                } else {
                    self._fallingRotate('leftBottom')
                }
            } else {
                if (self.jumper.position.z < self.cubes[self.cubes.length - 1].position.z) {
                    self._fallingRotate('rightTop')
                } else {
                    self._fallingRotate('rightBottom')
                }
            }
        }
    },
    /**
     *判断jumper的掉落位置
     *@return {Number} this.falledStat.location
     * -1 : 掉落在原来的方块，游戏继续
     * -10: 掉落在原来方块的边缘，游戏失败
     *  1 : 掉落在下一个方块，游戏成功，游戏继续
     *  10: 掉落在下一个方块的边缘，游戏失败
     *  0 : 掉落在空白区域，游戏失败
     **/
    _checkInCube: function() {
        if (this.Cube.cubes.length > 1) {
            // jumper 的位置
            var pointO = {
                x: this.jumper.position.x,
                z: this.jumper.position.z
            }
            // 当前方块的位置
            var pointA = {
                x: this.Cube.cubes[this.Cube.cubes.length - 1 - 1].position.x,
                z: this.Cube.cubes[this.Cube.cubes.length - 1 - 1].position.z
            }
            // 下一个方块的位置
            var pointB = {
                x: this.Cube.cubes[this.Cube.cubes.length - 1].position.x,
                z: this.Cube.cubes[this.Cube.cubes.length - 1].position.z
            }
            var distanceS, // jumper和当前方块的坐标轴距离
                distanceL // jumper和下一个方块的坐标轴距离
            // 判断下一个方块相对当前方块的方向来确定计算距离的坐标轴
            if (this.Cube.nextDir === 'left') {
                distanceS = Math.abs(pointO.x - pointA.x)
                distanceL = Math.abs(pointO.x - pointB.x)
            } else {
                distanceS = Math.abs(pointO.z - pointA.z)
                distanceL = Math.abs(pointO.z - pointB.z)
            }
            var should = this.Cube.size.width / 2 + this.config.jumperWidth / 2
            var result = 0

            if (distanceS < should) {
                // 落在当前方块，将距离储存起来，并继续判断是否可以站稳
                this.falledStat.distance = distanceS

                result = distanceS < this.Cube.size.width / 2 ? -1 : -10

            } else if (distanceL < should) {
                
                this.falledStat.distance = distanceL
                // 落在下一个方块，将距离储存起来，并继续判断是否可以站稳
                result = distanceL < this.Cube.size.width / 2 ? 1 : 10
            } else {
                result = 0
            }
            this.falledStat.location = result
        }
    },


    // 基于更新后的摄像机位置，重新设置摄
    // 初始化jumper：游戏主角
    _createJumper: function() {
        var material = new THREE.MeshLambertMaterial({ color: this.config.jumperColor })
        var geometry = new THREE.CubeGeometry(this.config.jumperWidth, this.config.jumperHeight, this.config.jumperDeep)
        geometry.translate(0, 1, 0)
        var mesh = new THREE.Mesh(geometry, material)
        mesh.position.y = 1
        this.jumper = mesh
        this.scene.add(this.jumper)
    },
 
    _render: function() {
        this.Camera.render()
    },
    _setLight: function() {
        var directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
        directionalLight.position.set(3, 10, 5)
        this.scene.add(directionalLight)

        var light = new THREE.AmbientLight(0xffffff, 0.3)
        this.scene.add(light)
    },
    _setRenderer: function() {
        this.renderer.setSize(this.size.width, this.size.height)
        this.renderer.setClearColor(this.config.background)
        document.querySelector('.game-inner').appendChild(this.renderer.domElement)
    },
    _setSize: function() {
        this.size.width = window.innerWidth
        this.size.height = window.innerHeight
    }
}
export default Game