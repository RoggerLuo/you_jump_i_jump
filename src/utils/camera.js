import * as THREE from 'three'

//依赖scene, renderer, size, cubes,

export default {
    init({width,height},renderer,scene){
        // this.camera = new THREE.PerspectiveCamera(width/ -80, width/ 80, height/ 80, height/ -80, 0, 5000)
        this.camera = new THREE.PerspectiveCamera(8, width / height, 1, 5000 );
        this.render = ()=>renderer.render(scene, this.camera)
        this.newPos()
        this.camera.zoom = 1
        this.camera.updateProjectionMatrix() 
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
        const x = current.x
        const z = current.z

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
            /* 增加一个set */
            this.camera.position.set(current.x+100, 100, current.z+100)
            /* 
                somehow, 就算camera离方块很远, 但是视角也不会变小，可能是其他某个地方设置的效果？
                所以，会变扁是因为，
                xyz中,lookAt的x和z增加了，虽然set的y不变，但导致观察的角度变低了，
                关键confuse的地方时，camera拉拉远了，可是视图区域却没有变小，违背了近大远小的常理，所以不好理解
            */

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
