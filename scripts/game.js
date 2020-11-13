export class Game{
    constructor(){
        this.scene = new THREE.Scene();

        this.aspect_ratio = 1280/720;

        this.min_width = 1280*0.4;
        this.min_height = 720*0.4;

        // https://github.com/pothonprogramming/pothonprogramming.github.io/blob/master/content/control/control.js
        this.player = {
            is_jumping: false,
            x: 0,
            y: 0,
            x_velocity: 0,
            y_velocity: 0
        };
        this.controller = {
            left: false,
            right: false,
            up: false,
            keyListener: function(event){
                this.key_state = (event.type == "keydown") ? true : false;

                switch(event.keyCode){
                    case 65:// left key
                        this.controller.left = key_state;
                    break;
                    case 68:// up key
                        this.controller.right = key_state;
                    break;
                    case 87 | 32:// right key
                        this.controller.up = key_state;
                    break;
                }
            }
        }


        // ----- Camera ----- //
        this.camera = new THREE.PerspectiveCamera(
            75, //fov
            this.aspect_ratio, //aspect ratio
            0.1, //near far plane
            1000 // ?
        )
        this.camera.position.z = 5;
        this.camera.position.y = 2;
        this.camera.rotation.x = -Math.PI/10;

        // ----- Lights ----- //
        this.light = new THREE.PointLight(0xFFFFFF, 0.2, 500)
        this.light.position.set(0,10,25);
        this.scene.add(this.light);

        this.ambient_light = new THREE.AmbientLight(0x707070, 1)
        this.scene.add(this.ambient_light);

        // ----- Objects ------ //
        this.box = new THREE.BoxGeometry(1,1,1);
        this.boxMaterial = new THREE.MeshLambertMaterial({color: 0xF700F7});
        this.boxMesh = new THREE.Mesh(this.box, this.boxMaterial);
        this.scene.add(this.boxMesh);

        // ----- Renderer ----- //
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor("#404040");
        this.renderer.setSize(1280, 720);

        document.body.appendChild(this.renderer.domElement);
        
        this.update();
    }

    // Update
    update() {
        var game = this;

        this.boxMesh.rotation.x += 0.005;
        this.boxMesh.rotation.y += 0.01;

        this.renderer.render(this.scene, this.camera);
        
        this.resizeRenderer(game);
        window.addEventListener("resize", this.resizeRenderer(this));
        requestAnimationFrame(function(){game.update();});
    }

    resizeRenderer(game){
        if(window.innerWidth/game.aspect_ratio > window.innerHeight){
            game.new_width = window.innerHeight*game.aspect_ratio;
            game.new_height = window.innerHeight;
        }
        else if(window.innerWidth/game.aspect_ratio <= window.innerHeight){
            game.new_width = window.innerWidth;
            game.new_height = window.innerWidth/game.aspect_ratio;
        }
        if(game.new_width < game.min_width){
            game.new_width = game.min_width;
            game.new_height = game.min_height;
        }
        game.renderer.setSize(game.new_width, game.new_height);
        game.camera.updateProjectionMatrix();
    }
}
