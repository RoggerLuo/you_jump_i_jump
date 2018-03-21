import * as THREE from 'three'

//依赖scene, renderer, size, cubes,

export default {
    init({width,height},renderer,scene){
        this.camera = new THREE.OrthographicCamera(width/ -80, width/ 80, height/ 80, height/ -80, 0, 5000)
        this.render = ()=>renderer.render(scene, this.camera)
        this.newPos()
    },
    pos:{},
    newPos(){
        this.pos = {
            current: new THREE.Vector3(0, 0, 0), // 摄像机当前的坐标
            next: new THREE.Vector3() // 摄像机即将要移到的位置
        }
    },
    resize({width,height}){
        this.camera.left = width / -80
        this.camera.right = width / 80
        this.camera.top = height / 80
        this.camera.bottom = height / -80
        this.camera.updateProjectionMatrix()
    },
    update(){
        const { current, next } = this.pos
        const needUpdate = current.x > next.x || current.z > next.z
        if(needUpdate){
            current.x -= 0.17
            current.z -= 0.17
            // 校准用的，如果没有这个中心就会偏离
            if (current.x - next.x < 0.05) {
                current.x = next.x
            }
            if (current.z - next.z < 0.05) {
                current.z = next.z
            }
            this.camera.lookAt(new THREE.Vector3(current.x, 0, current.z))
            this.render()
            requestAnimationFrame(()=>this.update())
        }
    },
    set() {
        this.camera.position.set(100, 100, 100)
        this.camera.lookAt(this.pos.current)
    },
    calculateNextPos(cubes) {
        var lastIndex = cubes.length - 1
        var pointA = {
            x: cubes[lastIndex].position.x,
            z: cubes[lastIndex].position.z
        }
        var pointB = {
            x: cubes[lastIndex - 1].position.x,
            z: cubes[lastIndex - 1].position.z
        }
        var pointR = new THREE.Vector3()
        pointR.x = (pointA.x + pointB.x) / 2
        pointR.y = 0
        pointR.z = (pointA.z + pointB.z) / 2
        this.pos.next = pointR
    }
}
