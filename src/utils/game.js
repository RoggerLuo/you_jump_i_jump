import * as THREE from 'three'
import Camera from './camera'
import Cube from './cube'
import Jumper from './jumper'
import Guide from './guide'
import Jump from './Jump'

function Game() {
    // 基本参数
    this.config = {
        isMobile: false,
        background: '#CCCEDA', // 背景颜色 0x282828
        ground: -1, // 地面y坐标
        fallingSpeed: 0.2, // 游戏npm失败掉落速度
    }
    // 游戏状态
    this.score = 0
    this.size = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer({ antialias: true })

    this.falledStat = {
        location: -1, // jumper所在的位置
        distance: 0 // jumper和最近方块的距离
    }
    this.fallingStat = {
        speed: 0.2, // 游戏失败后垂直方向上的掉落速度
        end: false // 掉到地面没有
    }


    this.Camera = Camera
    this.Camera.init(this.size,this.renderer,this.scene)

    this.Cube = Cube
    this.Cube.init(this.scene,this.Camera)


    this.Guide = Guide
    
}

Game.prototype = {
    init: function() {
        this._checkUserAgent() // 检测是否移动端
        this.Camera.set() // 设置摄像机位置
        this._setRenderer() // 设置渲染器参数
        this._setLight() // 设置光照
        this.Cube.add() // 加一个方块
        this.Cube.add() // 再加一个方块
        
        this.Jumper = Jumper
        this.Jumper.init(this.scene)
        this.Jumper.create() // 加入游戏者jumper
        
        this.Jump = Jump
        this.Jump.init(this.Jumper.jumper,this.Cube)

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
            // self.Time.clear()
            // self.Jumper.jumper.geometry.translate(0, 1, 0)
            // self.Jumper.jumper.position.y = 1
            // self.Guide.computeProportion(self.Cube,self.Jumper)
            self.Jump.onPress()
            self._handleMousedown()
        })
        // 监听鼠标松开的事件
        canvas.addEventListener(mouseEvents.up, function(evt) {
            self.Jump.onUp()
            self._handleMouseup()
        })
        // 监听窗口变化的事件
        window.addEventListener('resize', function() {
            self._handleWindowResize()
        })
    },
    _handleMousedown: function() {
       const self = this
       self.Jump.duringPressing(()=>{
           self._render() 
           requestAnimationFrame(function() {
               self._handleMousedown()
           })
       })
    },
     // 鼠标松开或触摸结束绑定的函数
    _handleMouseup: function() {
        const self = this
        self.Jump.duringFlying(renderAgain,landing)
        function renderAgain(){
            self._render()
            requestAnimationFrame(function() {
                self._handleMouseup()
            })
        }

         function landing(){
             self._checkInCube()
              if (
                  (self.falledStat.location === 1) 
              ){
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

    // 游戏失败重新开始的初始化配置
    restart: function() {
        this.score = 0
        this.Camera.newPos()
        this.fallingStat = {
            speed: 0.2,
            end: false
        }
        this.Cube.removeAll()
        this.scene.remove(this.Jumper.jumper)
        // 显示的分数设为 0
        this.successCallback(this.score)
        this.Cube.add()
        this.Cube.add()
        this.Jumper.create()
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
   *游戏失败执行的碰撞效果
   *@param {String} dir 传入一个参数用于控制倒下的方向：'rightTop','rightBottom','leftTop','leftBottom','none'
   **/
  _fallingRotate: function(dir) {
      var self = this
      const j = self.Jumper.jumper

      var offset = self.falledStat.distance - self.Cube.size.width / 2
      var rotateAxis = 'z' // 旋转轴
      var rotateAdd = j.rotation[rotateAxis] + 0.1 // 旋转速度
      var rotateTo = j.rotation[rotateAxis] < Math.PI / 2 // 旋转结束的弧度
      var fallingTo = self.config.ground + self.config.jumperWidth / 2 + offset

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
              j.position.y -= self.config.fallingSpeed
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
        const j = this.Jumper.jumper
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

            const lastCube = self.Cube.getCurrent()
            if (self.Cube.nextDir === 'left') {
                if (j.position.x < lastCube.position.x) {
                    self._fallingRotate('leftTop')
                } else {
                    self._fallingRotate('leftBottom')
                }
            } else {
                if (j.position.z < lastCube.position.z) {
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
            var pointO ={// this.Jumper.jumper.position
                x: this.Jumper.jumper.position.x,
                z: this.Jumper.jumper.position.z
            }
            const lastCube = this.Cube.getCurrent()
            const lastX2Cube = this.Cube.getLast()

            // 当前方块的位置
            var pointA = {
                x: lastX2Cube.position.x,
                z: lastX2Cube.position.z
            }
            // 下一个方块的位置
            var pointB = {
                x: lastCube.position.x,
                z: lastCube.position.z
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
            var should = this.Cube.size.width / 2 + this.Jumper.size.width / 2
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
