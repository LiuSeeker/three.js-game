var scene = new THREE.Scene();

var aspect_ratio = 1280/720;

var min_width = 1280*0.4;
var min_height = 720*0.4;

// https://github.com/pothonprogramming/pothonprogramming.github.io/blob/master/content/control/control.js
var player = {
    left: false,
    right: false,
    up: false,
    down: false,
    is_jumping: false,
    spin_charge: 0,
    keyListener: function(event){
        var key_state = (event.type == "keydown") ? true : false;
        

        switch(event.keyCode){
            case 65 || 37:// left key
                player.left = key_state;
            break;
            case 68 || 39:// right key
                player.right = key_state;
            break;
            case 32:// space key
                player.up = key_state & !player.is_jumping;
                if(player.down && key_state && player.spin_charge < 3){
                    player.spin_charge += 1;
                }
            break;
            case 83 || 40:// down key
                player.down = key_state;
            break;
        }
        
    }
};


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
var boxGeom = new THREE.BoxGeometry(0.6,0.6,0.6);
var boxMaterial = new THREE.MeshLambertMaterial({color: 0xF700F7});
var boxObj = new THREE.Mesh(boxGeom, boxMaterial);
scene.add(boxObj);
boxObj.position.x = 3;

var playerGeom = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
var playerMaterial = new THREE.MeshLambertMaterial({color: 0x0033F7});
var playerObj = new THREE.Mesh(playerGeom, playerMaterial);
scene.add(playerObj);


var platformGeom = new THREE.BoxGeometry(10,1,2);
var platformMaterial = new THREE.MeshLambertMaterial({color:0x000000});
var platformObj = new THREE.Mesh(platformGeom, platformMaterial);
scene.add(platformObj);
platformObj.position.y = -1;

var world = new THREE.SphereGeometry(20, 32, 32);
var worldMaterial = new THREE.MeshBasicMaterial({color: 0x00AA33});
var worldMesh = new THREE.Mesh(world, worldMaterial);
scene.add(worldMesh);
worldMesh.position.y = -20;
worldMesh.position.z = -10;

var dynamicObjects = [];



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
window.addEventListener("keydown", player.keyListener)
window.addEventListener("keyup", player.keyListener);





// ----- Update ----- //
var gravity = -0.98;
var timestep = 1/60;
var y_velocity = 0;
var x_velocity = 0;
var looking_right = 1;
var walk_speed = 0.06;
function update(){
    // 













    if(player.left){
        looking_right = -1;
        if(!(!player.is_jumping && player.down)){
            if(x_velocity < walk_speed){
                x_velocity = walk_speed;
            }
        }
    }
    else if(player.right){
        looking_right = 1;
        if(!(!player.is_jumping && player.down)){
            if(x_velocity < walk_speed){
                x_velocity = walk_speed;
            }
        }
    }
    if(player.up && !player.is_jumping && !player.down){
        player.is_jumping = true;
        y_velocity = 0.08;
    }
    if(player.down){
        if(player.is_jumping){
            y_velocity -= 0.0018;
        }        
    }
    else{
        if(player.spin_charge <= 2 && player.spin_charge > 0){
            x_velocity = 0.1 * player.spin_charge;
        }
        else if (player.spin_charge > 2){
            x_velocity = 0.1 * 3;
        }
        player.spin_charge = 0;
    }

    function resizePlayer(spin_charge){
        var tl = new TimelineMax();
        tl.to(playerObj.scale, 1, {x:1, y:(10-spin_charge)/10, z:1, ease: Expo.easeOut})
    }
    resizePlayer(player.spin_charge);


    playerObj.position.x += x_velocity * looking_right;
    camera.position.x += x_velocity * looking_right;
    if((x_velocity > 0 && (!player.left && !player.right)) || x_velocity > walk_speed){
        x_velocity -= 0.003;
        if(x_velocity < 0){
            x_velocity = 0;
        }
    }

    playerObj.position.y += y_velocity;
    if(playerObj.position.y > 0){
        y_velocity -= 0.0018;
    }
    else {
        y_velocity = 0;
        player.is_jumping = false;
        playerObj.position.y = 0;
    }

    boxObj.rotation.x += 0.005;
    boxObj.rotation.y += 0.01;

    renderer.render(scene, camera);
    requestAnimationFrame(function(){update();});
}


update();