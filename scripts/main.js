var scene = new THREE.Scene();

var aspect_ratio = 1280/720;

var min_width = 1280*0.4;
var min_height = 720*0.4;

// https://github.com/pothonprogramming/pothonprogramming.github.io/blob/master/content/control/control.js
var player = {
    is_jumping: false,
    x: 0,
    y: 0,
    x_velocity: 0,
    y_velocity: 0
};
var controller = {
    left: false,
    right: false,
    up: false,
    keyListener: function(event){
        var key_state = (event.type == "keydown") ? true : false;

        switch(event.keyCode){
            case 65:// left key
                controller.left = key_state;
            break;
            case 68:// up key
                controller.right = key_state;
            break;
            case 87 | 32:// right key
                controller.up = key_state;
            break;
        }
    }
}


// ----- Camera ----- //
var camera = new THREE.PerspectiveCamera(
    75, //fov
    aspect_ratio, //aspect ratio
    0.1, //near far plane
    1000 // ?
)
camera.position.z = 5;
camera.position.y = 2;
camera.rotation.x = -Math.PI/10;

// ----- Lights ----- //
var light = new THREE.PointLight(0xFFFFFF, 0.8, 500)
light.position.set(0,10,25);
scene.add(light);

var ambient_light = new THREE.AmbientLight(0x707070, 0.4)
scene.add(ambient_light);

// ----- Objects ------ //
var box = new THREE.BoxGeometry(1,1,1);
var boxMaterial = new THREE.MeshLambertMaterial({color: 0xF700F7});
var boxMesh = new THREE.Mesh(box, boxMaterial);
scene.add(boxMesh);

// ----- Renderer ----- //
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor("#404040");
renderer.setSize(1280, 720);

document.body.appendChild(renderer.domElement);

// Resize render
function resizeRenderer(){
    var new_width, new_height;
    if(window.innerWidth/aspect_ratio > window.innerHeight){
        new_width = window.innerHeight*aspect_ratio;
        new_height = window.innerHeight;
    }
    else if(window.innerWidth/aspect_ratio <= window.innerHeight){
        new_width = window.innerWidth;
        new_height = window.innerWidth/aspect_ratio;
    }
    if(new_width < min_width){
        new_width = min_width;
        new_height = min_height;
    }
    renderer.setSize(new_width, new_height);
    camera.updateProjectionMatrix();
}
resizeRenderer();

window.addEventListener("resize", resizeRenderer);
update();

// Update
function update(){

    boxMesh.rotation.x += 0.005;
    boxMesh.rotation.y += 0.01;

    renderer.render(scene, camera);
    requestAnimationFrame(function(){update();});
}