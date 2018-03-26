export default {
    getFat(jumper){
        if(jumper.scale.y > 0.3) {
            jumper.scale.y -= 0.01
            jumper.scale.x += 0.01
            jumper.scale.z += 0.01            
        }
    },
    getFit(jumper){
        const fitRate = 0.03
        if (jumper.scale.y < 1) { 
            if((jumper.scale.y + fitRate)>1){
                jumper.scale.y = 1
            }else{
                jumper.scale.y += fitRate                
            }
        }
        if (jumper.scale.x > 1) {
            if((jumper.scale.x - fitRate) < 1){
                jumper.scale.x = 1
                jumper.scale.z = 1                
            }else{
                jumper.scale.x -= fitRate
                jumper.scale.z -= fitRate                
            }
        }
    },
    reborn(jumper){
        jumper.scale.x = 1
        jumper.scale.z = 1                
        jumper.scale.y = 1
    }
}
