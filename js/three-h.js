var scene = new THREE.Scene();



var bulbGeometry = new THREE.BoxGeometry(2, 10, 2);
bulbMat = new THREE.MeshStandardMaterial({
    emissive: 0x40ffef,
    emissiveIntensity: 1,
    color: 0x000000
});
var bulbLightArr = [];
for (var i = 0; i <= 15; i++) {
    bulbLight = new THREE.PointLight(0x2fffee, 0.2, 100, 2);
    bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
    bulbLight.position.set(0, 4, -90 + i * (2 + 10));

    bulbLight.castShadow = true;
    bulbLightArr.push(bulbLight);
    scene.add(bulbLight);
}
// var bulbGeometry3 = new THREE.BoxGeometry(5, 16, 5);
// bulbLight3 = new THREE.PointLight(0xffee88, 0.5, 100, 2);
// bulbMat3 = new THREE.MeshStandardMaterial({
//     emissive: 0xffffee,
//     emissiveIntensity: 1,
//     color: 0x000000
// });
// bulbLight3.add(new THREE.Mesh(bulbGeometry3, bulbMat3));
// bulbLight3.position.set(0, -8, 0);
// bulbLight3.castShadow = true;
// scene.add(bulbLight3);

//地面
var plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
        //         ambient: 0xffffee,
        // specular: 0x000000,
        // shininess: 600,
        // color: 0xffffff
        specular: 0x000000,
        color: 0xffffff,
        opacity: 1
        // transparent: true
    })
);
plane.position.y = 0;
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

scene.add(new THREE.AmbientLight(0x333333));


var Ww = document.body.clientWidth;
// var Ww = 1920;
var camera = new THREE.PerspectiveCamera(40, Ww / 400, 1, 1000);
camera.position.set(80, 30, 0);
var cameraLookAt = new THREE.Vector3(0, 10, 0);
camera.lookAt(cameraLookAt);

var renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(Ww, 400);
renderer.shadowMapEnabled = true;
renderer.domElement.setAttribute("id", "11");
document.body.appendChild(renderer.domElement);




function render() {
    renderer.render(scene, camera);
}
render();
// var controls = new THREE.OrbitControls(camera);
// controls.addEventListener('change', render);
var up = true;

function animate() {
    // if (up && bulbLight.position.y < 50) {
    //     bulbLight.position.y++;
    //     // bulbLight3.position.y--;
    //     if (bulbLight.position.y == 50)
    //         up = false;
    // } else {
    //     bulbLight.position.y--;
    //     // bulbLight3.position.y++;
    //     if (bulbLight.position.y == 8)
    //         up = true;
    // }

    requestAnimationFrame(animate);
    render();
}
animate();
window.onresize = function(){
    onWindowResize();
}
function onWindowResize() {
    camera.aspect = window.innerWidth / 400;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, 400);

}


//audio
var context1; //AudioContext
var source; //音源
var analyserfa; //音源分析器
var canvasFormAudio; //画布

//    canvasFormAudio = document.getElementById('canvasFormAudio');
canvasFormAudio = renderer.domElement;
canvasFormAudio.setAttribute("class", "header-bg");
try {

    context1 = new (window.AudioContext || window.webkitAudioContext);
} catch (e) {
    throw new Error('The Web Audio API is unavailable');
}

analyserfa = context1.createAnalyser();
// var audio = document.getElementById("audio");
// window.addEventListener('load', function (e) {
// var audio = document.getElementById("audio");
var source = context1.createMediaElementSource(audio);
console.log(source);
source.connect(analyserfa);
analyserfa.connect(context1.destination); //分析器连接扬声器
drawSpectrumfa();

// }, false);

function drawSpectrumfa() {
    var WIDTH = canvasFormAudio.width;
    var HEIGHT = canvasFormAudio.height;

    var array = new Uint8Array(128); //创建一个无符号字节数组

    analyserfa.getByteFrequencyData(array); //将当前频域数据拷贝进无符号字节数组

    // ctxfa.clearRect(0, 0, WIDTH, HEIGHT);
    // // console.log(array);
    // for (var i = 0; i < (array.length); i++) {
    //     var value = array[i];　　　　　　　　
    //     ctxfa.fillRect(i * 5, HEIGHT - value, 3, HEIGHT / 3);
    // }

    for (var i = 0; i < bulbLightArr.length; i++) {
        var value = array[i];
        if (value / 3 - 45 < 5) {
            bulbLightArr[i].position.y = 5;
        } else {
            bulbLightArr[i].position.y = value / 3 - 45;
        }
    }

    requestAnimationFrame(drawSpectrumfa);
}