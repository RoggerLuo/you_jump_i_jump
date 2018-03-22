import * as THREE from 'three'

// 依赖scene

export default {
    size:{
        width: 4, // 方块宽度
        height: 2, // 方块高度
        deep: 4, // 方块深度        
    },
    cubes:[],
    nextDir:'',
    init(scene,Camera){
        this.scene = scene
        this.Camera = Camera
    },
    getCurrent(){
        return this.cubes[this.cubes.length - 1]
    },
    getLast(){
        return this.cubes[this.cubes.length - 2]
    },
    removeAll(){
        var length = this.cubes.length
        for (var i = 0; i < length; i++) {
            this.scene.remove(this.cubes.pop())
        }
        this.last = undefined
        this.lastX2 = undefined
    },
    randomDirection(){
        const random = Math.random()
        this.nextDir = random > 0.5 ? 'left' : 'right'
        return this.nextDir
    },
    // 新增一个方块, 新的方块有2个随机方向
    add() {
        const { width, height, deep } = this.size
        // 新建一个形状
        const material = new THREE.MeshLambertMaterial({ color: 0xbebebe })
        const geometry = new THREE.CubeGeometry(width, height, deep)
        const mesh = new THREE.Mesh(geometry, material)
        
        //设置位置
        if (this.cubes.length >= 1) {
            const last = this.cubes[this.cubes.length - 1]

            mesh.position.x = last.position.x
            mesh.position.z = last.position.z
            const randomDistance = 4 * Math.random() + 6
            
            if (this.randomDirection() === 'left') {
                mesh.position.x -= randomDistance
            } else {
                mesh.position.z -= randomDistance
            }
        }
        this.cubes.push(mesh)

        // 当方块数大于6时，删除前面的方块，因为不会出现在画布中
        if (this.cubes.length > 6) {
            this.scene.remove(this.cubes.shift())
        }
        this.scene.add(mesh)
        // 每新增一个方块，重新计算摄像机坐标
        if (this.cubes.length > 1) {
            this.Camera.calculateNextPos(this.cubes)
        }
    }
}


// 新增一个方块, 新的方块有2个随机方向
// _createCube: function() {
//     var material = new THREE.MeshLambertMaterial({ color: this.config.cubeColor })
//     var geometry = new THREE.CubeGeometry(this.config.cubeWidth, this.config.cubeHeight, this.config.cubeDeep)
//     var mesh = new THREE.Mesh(geometry, material)
//     if (this.cubes.length) {
//         var random = Math.random()
//         this.cubeStat.nextDir = random > 0.5 ? 'left' : 'right'
//         mesh.position.x = this.cubes[this.cubes.length - 1].position.x
//         mesh.position.y = this.cubes[this.cubes.length - 1].position.y
//         mesh.position.z = this.cubes[this.cubes.length - 1].position.z
//         if (this.cubeStat.nextDir === 'left') {
//             mesh.position.x = this.cubes[this.cubes.length - 1].position.x - 4 * Math.random() - 6
//         } else {
//             mesh.position.z = this.cubes[this.cubes.length - 1].position.z - 4 * Math.random() - 6
//         }
//     }
//     this.cubes.push(mesh)
//     // 当方块数大于6时，删除前面的方块，因为不会出现在画布中
//     if (this.cubes.length > 6) {
//         this.scene.remove(this.cubes.shift())
//     }
//     this.scene.add(mesh)
//     // 每新增一个方块，重新计算摄像机坐标
//     if (this.cubes.length > 1) {
//         this.Camera.calculateNextPos(this.cubes)
//     }
// },