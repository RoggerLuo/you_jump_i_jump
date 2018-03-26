
export default function(framesNum){
    const x_levarage = 0.005
    const y_levarage = 25.0
    return y_levarage * curveFunc(framesNum * x_levarage)
}

function curveFunc (x) { //曲线正比例函数
    x = x+0.07
    if(x>1){
        return Math.logx + 1        
    }else{
        return Math.pow(x,3)
    }
}