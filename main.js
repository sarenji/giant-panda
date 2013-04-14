var container, stats;

var camera, scene, renderer;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var objects = {};

var loadCounter = 0;
var loadedCounter = 0;


init();
animate();


function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.y = 10;
  camera.position.z = 20;

  // scene

  scene = new THREE.Scene();

  var ambient = new THREE.AmbientLight( 0x101030 );
  scene.add( ambient );

  var directionalLight = new THREE.DirectionalLight( 0xffeedd );
  directionalLight.position.set( 0, 0, 1 ).normalize();
  scene.add( directionalLight );

  // texture
  var texture = new THREE.Texture();

  // var loader = new THREE.ImageLoader();
  // loader.addEventListener( 'load', function ( event ) {

  //   texture.image = event.content;
  //   texture.needsUpdate = true;

  // } );
  // loader.load( 'textures/ash_uvgrid01.jpg' );

  // model

  //

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setFaceCulling(0);
  container.appendChild( renderer.domElement );

  loadModel('control_room', 'obj/control_room.obj');
  loadModel('switch', 'obj/switch.obj');

  // document.addEventListener( 'mousemove', onDocumentMouseMove, false );

  // window.addEventListener( 'resize', onWindowResize, false );

}

function loadModel(name, modelPath, traverseFunc) {
  loadCounter++;
  var loader = new THREE.OBJLoader();
  loader.addEventListener( 'load', function ( event ) {
    var object = event.content;

    if (traverseFunc) {
      object.traverse(traverseFunc);
    }    

    objects[name] = object;
    scene.add( object );
    loadedCounter++;
    console.log(loadedCounter, loadCounter);
    if (loadedCounter == loadCounter) {
      finishLoading();
    }

  });
  loader.load( modelPath );
}

function finishLoading() {
  console.log("Whaaat");
  objects['switch'].position.x = -1;
}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

  mouseX = ( event.clientX - windowHalfX ) / 2;
  mouseY = ( event.clientY - windowHalfY ) / 2;

}

//

function animate() {

  requestAnimationFrame( animate );
  render();

}

function render() {

  // camera.position.x += ( mouseX - camera.position.x ) * .05;
  // camera.position.y += ( - mouseY - camera.position.y ) * .05;
  var pos = scene.position.clone();
  pos.y = 8;

  camera.lookAt( pos );

  renderer.render( scene, camera );

}
