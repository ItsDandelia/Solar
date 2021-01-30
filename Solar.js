import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/jsm/controls/OrbitControls.js';

var scene = new THREE.Scene();

var earth_flag = 0;
var moon_flag = 0;

var camera = new THREE.PerspectiveCamera (75, window.innerWidth/window.innerHeight, 0.1, 10000);
//camera.lookAt(scene.position);
scene.add(camera);
camera.position.set(-500,900,-1700);
//camera.position.set(0,0,0);
var renderer = new THREE.WebGLRenderer ();
renderer.setSize (window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const axis = new THREE.AxesHelper( 1000 );
scene.add( axis );

var controls = new OrbitControls(camera, renderer.domElement);

var geometry_s = new THREE.SphereGeometry(5000, 64,64);
var material_s = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('galaxy_starfield.png'), side: THREE.DoubleSide});
var starfield = new THREE.Mesh (geometry_s, material_s);
scene.add(starfield);

var sun_geom = new THREE.SphereGeometry (150, 32, 32);
var sun_mat = new THREE.MeshBasicMaterial ({map : new THREE.TextureLoader().load('sun_detailed.jpg'), side: THREE.DoubleSide});
var sun = new THREE.Mesh (sun_geom, sun_mat);
sun.position.set(0,0,0);
scene.add(sun);

var earth_geom = new THREE.SphereGeometry (50, 32, 32);
var earth_mat = new THREE.MeshPhongMaterial ({map : new THREE.TextureLoader().load('earth_terrain_4k.jpg'), side: THREE.DoubleSide, color: 0xaaaaaa,
shininess: 25});
var earth = new THREE.Mesh (earth_geom, earth_mat);
earth.position.set(800,0,0);
scene.add(earth);

var geometry_m = new THREE.SphereGeometry (20 , 32 , 32);
var material_m = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('moon_4k.jpg'), side: THREE.FrontSide, color: 0xaaaaaa, shininess:25});
var moon = new THREE.Mesh(geometry_m, material_m);
moon.position.set(800,0,0);
earth.add(moon);
var rad_m = 90;
var theta_m = 0;
var mtheta = 2 * Math.PI/1000;

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

const light_p = new THREE.PointLight( 0xffffff, 6, 4000 );
light_p.position.set( 0, 0, 0 );
scene.add( light_p );

var orbits = function(name, radius, delta){
    var theta =0;
    var diff = 2 * Math.PI / delta;
    var material_o = new THREE.LineBasicMaterial ();
    var geometry_o = new THREE.Geometry();
    for (theta; theta<= 2 * Math.PI; theta+=diff){
        geometry_o.vertices.push(new THREE.Vector3(radius * Math.cos(theta) * 1.8 , 0, radius * Math.sin(theta)));
    }
    var orbit = new THREE.Line (geometry_o, material_o);
    scene.add(orbit);
}

orbits(earth, 800, 3000);
var theta_earth = 0;
var revolution_earth = function(radius, delta, name){
    var diff = 2 * Math.PI/delta;
    name.position.x = radius * Math.cos(theta_earth) * 1.8;
    name.position.z = radius * Math.sin(theta_earth);
    
    theta_earth+=diff;

}

document.getElementById('info').style.display = 'block';
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event){
    
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    //document.getElementById('info').style.display = 'block';
}

window.addEventListener('click', onMouseMove, false);

var FollowPlanet = function(name){
    //var vector = new THREE.Vector3();
    // var vector = name.localToWorld(name.position);
    // //name.getWorldPosition(vector);
    // console.log('console',vector);
    // console.log('name', name.position);
    

    camera.position.x = name.position.x + 100;
    camera.position.y = name.position.y + 100;
    camera.position.z = name.position.z + 100;
    
    camera.lookAt(name.position);
}
document.addEventListener("keydown", function(event) {
    if(event.keyCode === 27){
       //Esc key was pressed
        console.log('esc working');
        earth_flag=0;
        moon_flag=0;
        document.getElementById('earth_text').style.display = 'none';
        //document.getElementById('earth_box').style.display = 'none';
        
   }
});
const loader = new THREE.FontLoader();

loader.load( 'helvetiker_regular.typeface.json', function ( font ) {

	const geometry = new THREE.TextGeometry( 'Hello three.js!', {
		font: font,
		size: 80,
		height: 5,
		curveSegments: 12,
		bevelEnabled: true,
		bevelThickness: 10,
		bevelSize: 8,
		bevelOffset: 0,
		bevelSegments: 5
	} );
} );
function animate(){
    earth.rotation.y += 0.01;
    revolution_earth(800, 3000, earth);
    theta_m += mtheta;
    moon.rotation.y += 0.01;
    moon.position.x = rad_m * Math.cos(theta_m)*1.2;
    moon.position.z = rad_m * Math.sin(theta_m);

    raycaster.setFromCamera (mouse, camera);
    const intersects = raycaster.intersectObjects ([earth]);
    if (intersects[0]){
        console.log(intersects[0].object.geometry.id);
        switch(intersects[0].object.geometry.id){
            case 6:{
                console.log('earth flag');
                earth_flag=1;
                moon_flag=0;
                break;
            }
            // case 8:{
            //     console.log('moon flag');
            //     moon_flag=1;
            //     earth_flag=0;
            //     break;
            // }
            default:{
                
                earth_flag=0;
                moon_flag=0;
                
            }


        }

    }

    if (earth_flag==1){
        FollowPlanet(earth);
        document.getElementById('earth_text').style.display = 'block'

     }//else if (moon_flag==1){
    //     FollowPlanet(moon);
    //     //console.log(moon.position);
    // }
    else {
        controls.update();
    }

    renderer.render(scene,camera);
    requestAnimationFrame(animate);
}
animate();
