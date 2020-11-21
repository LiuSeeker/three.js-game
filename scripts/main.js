main();

async function main(){
    var aspect_ratio = 1280/720;

    var min_width = 1280*0.4;
    var min_height = 720*0.4;

    // https://github.com/pothonprogramming/pothonprogramming.github.io/blob/master/content/control/control.js
    var playerController = {
        left: false,
        right: false,
        up: false,
        down: false,
        is_jumping: false,
        spin_charge: 0,
        looking_right: true,

        x_acceleration: 0,
        y_acceleration: 0,

        x_velocity: 0,
        y_velocity: 0,

        collision_right:false,
        collision_left:false,
        collision_ground:false,

        keyListener: function(event){
            var key_state = (event.type == "keydown") ? true : false;

            switch(event.keyCode){
                case 65 || 37:// left key
                    playerController.left = key_state;
                break;
                case 68 || 39:// right key
                    playerController.right = key_state;
                break;
                case 32:// space key
                    playerController.up = key_state & !playerController.is_jumping;
                    if(playerController.down && key_state && playerController.spin_charge < 3){
                        playerController.spin_charge += 1;
                    }
                break;
                case 83 || 40:// down key
                    playerController.down = key_state;
                break;
            }
            
        }
    };

    async function getData(url) {
        const response = await fetch(url);

        if(response.status == 200){
            return response.json();
        }
        else{
            return -1;
        }
    }

    // ----- Geoms and Materials ----- //
    var boxGeom = new THREE.BoxGeometry(0.6,0.6,0.6);
    var boxMaterial = new THREE.MeshLambertMaterial({color: 0xF700F7});

    var goalGeom = new THREE.SphereGeometry(0.3, 32, 32);
    var goalMaterial = new THREE.MeshLambertMaterial({color: 0XFFFC42});

    var playerGeom = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    var playerMaterial = new THREE.MeshLambertMaterial({color: 0x0033F7});

    var platformGeom = new THREE.BoxGeometry(10,1,2);
    var platformMaterial = new THREE.MeshLambertMaterial({color:0x000000});

    var bgGeom = new THREE.SphereGeometry(20, 32, 32);
    var bgMaterial = new THREE.MeshBasicMaterial({color: 0x00AA33});


    

    // ----- Objects arrays ----- //
    var platformsobjects = []
    var dynamicObjects = []
    var animatedObjects = []

    // ----- "Global" objects ----- //
    var scene = null;
    var camera = null;
    var light = null;
    var ambient_light = null;
    var player = null;
    var goal = null;
    var bg = null;
    var first_load = true;
    var frame_id;
    var gravity = -0.002;
    var walk_speed = 0.06;
    var actual_level = 0;

    function createObj(obj){
        // Função que cria os objetos baseado no .json
        var newObj;
        if(obj.type == "box"){
            newObj = new THREE.Mesh(boxGeom, boxMaterial);
            scene.add(newObj);
            animatedObjects.push(newObj);
            platformsobjects.push(newObj);
        }
        else if(obj.type == "platform"){
            newObj = new THREE.Mesh(platformGeom, platformMaterial);
            scene.add(newObj);
            platformsobjects.push(newObj);
        }
        else if(obj.type == "goal"){
            newObj = new THREE.Mesh(goalGeom, goalMaterial);
            scene.add(newObj);
            goal = newObj;
        }

        newObj.position.x = obj.posX;
        newObj.position.y = obj.posY;

    }

    async function loadLevel(n){
        // Função para carregar o level
        if(!first_load){
            // Se não for o primeiro load, reseta todas as variáveis globais
            window.removeEventListener("keydown", playerController.keyListener);
            window.removeEventListener("keyup", playerController.keyListener);
            cancelAnimationFrame(frame_id);
            scene = null;
            camera = null;
            light = null;
            ambient_light = null;
            player = null;
            goal = null;
            bg = null;
            playerController.x_acceleration = 0;
            playerController.y_acceleration = 0;
            playerController.x_velocity = 0;
            playerController.y_velocity = 0;
            platformsobjects=[];
            animatedObjects=[];
            dynamicObjects=[];
        }
        else{
            first_load = false;
        }

        // ----- Scene ----- //
        scene = new THREE.Scene();

        // ----- Camera ----- //
        camera = new THREE.PerspectiveCamera(
            75, //fov
            aspect_ratio, //aspect ratio
            0.1, //near far plane
            1000 // ?
        )
        camera.position.z = 5;
        camera.position.y = 2;
        camera.rotation.x = -Math.PI/10;

        // ----- Lights ----- //
        light = new THREE.PointLight(0xFFFFFF, 0.8, 500)
        light.position.set(0,10,25);
        scene.add(light);

        ambient_light = new THREE.AmbientLight(0x707070, 0.6)
        scene.add(ambient_light);

        // ----- Player ----- //
        player = new THREE.Mesh(playerGeom, playerMaterial);
        scene.add(player);

        // ----- BG ----- //
        bg = new THREE.Mesh(bgGeom, bgMaterial);
        scene.add(bg);
        bg.position.y = -20;
        bg.position.z = -10;

        // ----- Load e criação de objetos
        var file_name = "../level".concat(n.toString(), ".json");
        var level_data = await getData(file_name);
        if(level_data == -1){
            actual_level = 0;
            file_name = "../level".concat("0", ".json");
            level_data = await getData(file_name);
        }

        for(var i=0; i < level_data.objects.length; i++){
            createObj(level_data.objects[i]);
        }

        // ----- Event Listeners ----- //
        window.addEventListener("keydown", playerController.keyListener);
        window.addEventListener("keyup", playerController.keyListener);

    }

    // ----- Collision Detection ----- //
    function collisionDetection2(){
        for(var i=0; i < platformsobjects.length; i++){
            if(player.position.y - 0.5 - 0.5 < platformsobjects[i].position.y &&
                player.position.x > platformsobjects[i].position.x - 5 - 0.5 &&
                player.position.x < platformsobjects[i].position.x + 5 + 0.5 &&
                player.position.y + 0.5 + 0.5 > platformsobjects[i].position.y){
                return true;
            }
        }
        return false;
    }

    function collisionDetection(){
        var originPoint = player.position.clone();
        playerController.collision_left=false;
        playerController.collision_right=false;
        playerController.collision_ground=false;
       
    
        for (var vertexIndex = 0; vertexIndex < player.geometry.vertices.length; vertexIndex++)
        {		
            var localVertex = player.geometry.vertices[vertexIndex].clone();
            var globalVertex = localVertex.applyMatrix4( player.matrix );
            var directionVector = globalVertex.sub( player.position );
            
            var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
            var collisionResults = ray.intersectObjects( platformsobjects );
            if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()){
                console.log(ray.ray.direction)
                if(collisionResults[0].faceIndex ==5){
                   playerController.collision_ground=true;
                   //console.log("grounded");
                }
                if(ray.ray.direction.x<0){
                    //console.log("Left collision");
                    playerController.collision_left=true;
                }
            
                if(ray.ray.direction.x>0){
                    //console.log("Right collision");
                    playerController.collision_right=true;
                }
                //console.log(collisionResults[0].uv.x-player.position.x);
                return true}	
                }

        
        return false;
       

        } 

               

    // ----- Goal Detection ----- //
    function goalDetection(){
        if(player.position.y - 0.5 - 0.2 < goal.position.y &&
            player.position.x > goal.position.x - 0.2 - 0.5 &&
            player.position.x < goal.position.x + 0.2 + 0.5 &&
            player.position.y + 0.5 + 0.2 > goal.position.y){
            return true;
        }
    }

    await loadLevel(actual_level); // Load da camera antes do render

    // ----- Renderer ----- //
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor("#404040");
    renderer.setSize(1280, 720);

    document.body.appendChild(renderer.domElement);

    // Resize render function
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

    // ----- Update -----//
    async function update(){
        //console.log(playerController.collision_right);
        // X Acceleration inputs
        if(playerController.left){
            playerController.looking_right = false;
            if(playerController.x_velocity > 0){
                playerController.x_acceleration = -0.02;
            }
            else{
                playerController.x_acceleration = -0.003;
            }
        }
        else if(playerController.right){
            //console.log(playerController.collision_right);
            playerController.looking_right = true;
            if(playerController.x_velocity < 0){
                playerController.x_acceleration = 0.02;
            }
            else{
                playerController.x_acceleration = 0.003;
            }
        }
        else{
            playerController.x_acceleration = 0;
        }

        // Y "Acceleration" inputs
        if(playerController.up && !playerController.is_jumping){
            playerController.y_velocity = 0.08;
            playerController.is_jumping = true;
        }
        if(playerController.down){
            playerController.y_acceleration = -0.002;
        }
        else{
            playerController.y_acceleration = 0;
        }

        // Y velocity calc

        if(!collisionDetection() || playerController.y_velocity > 0){
            playerController.y_velocity += gravity + playerController.y_acceleration;
        }
        else{
            playerController.is_jumping = false
            playerController.y_velocity = 0;
        }

        // X velocity calc
        if(playerController.x_acceleration>0 && playerController.collision_right){
            playerController.x_acceleration=0;
            playerController.x_velocity=0;
        }
        if(playerController.x_acceleration<0 && playerController.collision_left){
            playerController.x_acceleration=0;
            playerController.x_velocity=0;
        }


        if((playerController.x_velocity <= walk_speed && playerController.x_velocity >= -walk_speed) ||
            (playerController.x_velocity > 0 && playerController.x_acceleration < 0) || 
            (playerController.x_velocity < 0 && playerController.x_acceleration > 0)){
                playerController.x_velocity += playerController.x_acceleration;
        }
       
        if(playerController.x_acceleration == 0){
            if (playerController.x_velocity > 0){
                playerController.x_velocity -= 0.002;
            }
            else if (playerController.x_velocity < 0){
                playerController.x_velocity += 0.002;
            }
            if(playerController.x_velocity < 0.002 && playerController.x_velocity > -0.002){
                playerController.x_velocity = 0;
            }
        }
        
    
        // player position update
        player.position.x += playerController.x_velocity;
        player.position.y += playerController.y_velocity;
        
        camera.position.x = player.position.x;

        // Rotate animated objects
        for(var i=0; i< animatedObjects.length; i++){
            animatedObjects[i].rotation.x += 0.005;
            animatedObjects[i].rotation.y += 0.01;
        }

        // Ver se o player chegou no objetivo
       
        if(goalDetection()){
            actual_level++;
            await loadLevel(actual_level);
        }
        else if(player.position.y < -10){
            await loadLevel(actual_level);
        }

        // Atualização do render e frame
        renderer.render(scene, camera);
        frame_id = requestAnimationFrame(function(){update();});
        
    }


    update();
    
}