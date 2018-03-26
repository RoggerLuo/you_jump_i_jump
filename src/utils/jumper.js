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
    }
}
