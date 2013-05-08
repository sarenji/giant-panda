var container, stats;

var camera, scene, renderer;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var objects = {};
var switches = [];
var faders = [];

var loadCounter = 0;
var loadedCounter = 0;
var mouse = new THREE.Vector2(),
    offset = new THREE.Vector3(),
    INTERSECTED, SELECTED;
var projector;
var plane;


init();
animate();


function Fader(mesh, maxMovement) {
  this.mesh = mesh;

  var value = 0;
  var oldPos = mesh.position.clone();
  maxMovement = maxMovement || 5;

  this.__defineGetter__("value", function() {
    return value;
  });

  this.__defineSetter__("value", function(newValue) {
    newValue = Math.min(1, newValue);
    newValue = Math.max(0, newValue);
    value    = newValue;

    // set coordinates
    var newPoint = oldPos.clone();
    newPoint.z = oldPos.z + value * maxMovement;
    mesh.position.copy( newPoint );

    this.dispatchEvent({ type: "valuechange", content: value });
  });
}

THREE.extend( Fader.prototype, THREE.EventDispatcher.prototype );



function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.y = 10;
  camera.position.z = 20;

  // scene

  projector = new THREE.Projector();
  scene = new THREE.Scene();

  var ambient = new THREE.AmbientLight( 0x101030 );
  scene.add( ambient );

  var directionalLight = new THREE.DirectionalLight( 0xffeedd );
  directionalLight.position.set( 0, 0, 1 ).normalize();
  scene.add( directionalLight );

  // texture
  var texture = new THREE.Texture();

  var loader = new THREE.ImageLoader();
  loader.addEventListener( 'load', function ( event ) {

    texture.image = event.content;
    texture.needsUpdate = true;

  } );
  loader.load( 'textures/brian.jpg' );

  // plane for clicking
  // plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
  // plane.visible = false;
  plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: .5, transparent: false, wireframe: true } ) );
  scene.add( plane );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  // loadModel('control_room', 'obj/control_room.obj', function( child ) {
  //   if ( child instanceof THREE.Mesh ) {
  //     child.material.map = texture;
  //   }
  // });
  makeSwitch(new THREE.Vector3(0, 0, -2.2));
  makeSwitch(new THREE.Vector3(-2, 0, -2.2));
  makeSwitch(new THREE.Vector3(-4, 0, -2.2));
  makeSwitch(new THREE.Vector3(2, 0, -2.2));
  makeSwitch(new THREE.Vector3(4, 0, -2.2));

  // document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mousemove', onSwitchMouseMove, false );
  document.addEventListener( 'mousedown', onSwitchMouseDown, false );
  document.addEventListener( 'mouseup', onSwitchMouseUp, false );

  window.addEventListener( 'resize', onWindowResize, false );

}

function makeSwitch(position) {
  loadModel('switch', 'obj/switch.obj', function(child) {
    if ( child instanceof THREE.Mesh ) {
      switches.push( child );
      child.position.copy( position );
      var fader = new Fader(child, 5);
      faders.push( fader );
      fader.addEventListener( "valuechange", function( event ) {
        console.log("NEW VALUE: " + event.content);
      });
    }
  });
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
    if (loadedCounter == loadCounter) {
      finishLoading();
    }

  });
  loader.load( modelPath );
}

function finishLoading() {
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

var MAX_SLIDER_Z = 5;
var MIN_SLIDER_Z = -5;
var BOARD_HEIGHT = 3;
var BOARD_LENGTH = 3;
var SLOPE_START = 3;
function onSwitchMouseMove() {
  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
  projector.unprojectVector( vector, camera );

  var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
  var intersects = raycaster.intersectObject( plane );
  var newPoint = intersects[ 0 ].point.sub( offset );
  $("#debug").text("x: " + newPoint.x + " y: " + newPoint.y);

  if ( SELECTED ) {
    // var intersects = raycaster.intersectObject( plane );
    // var newPoint = intersects[ 0 ].point.sub( offset );
    // TODO: Mathematically confirm this...
    var maxY = 2.359090960572785;
    var minY = .5128987979644837;
    SELECTED.value = -(newPoint.y - minY) / (maxY - minY);
    return;
  }


  var intersects = raycaster.intersectObjects( switches );

  if ( intersects.length > 0 ) {

    if ( INTERSECTED != intersects[ 0 ].object ) {

      if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
    }

    container.style.cursor = 'pointer';

  } else {

    if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

    INTERSECTED = null;

    container.style.cursor = 'auto';

  }
}

function onSwitchMouseDown( event ) {

  event.preventDefault();

  var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
  projector.unprojectVector( vector, camera );

  var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

  // Check for intersection with the fader objects.
  var intersects = raycaster.intersectObjects( switches );
  if ( intersects.length > 0 ) {
    // Find associated fader object
    for (var i = 0; i < faders.length; i++) {
      if (intersects[0].object == faders[i].mesh) {
        SELECTED = faders[i];
        break;
      }
    }

    var intersects = raycaster.intersectObject( plane );
    offset.copy( intersects[ 0 ].point ).sub( plane.position );

    container.style.cursor = 'move';

  }

}

function onSwitchMouseUp( event ) {

  event.preventDefault();

  // controls.enabled = true;

  if ( INTERSECTED ) {

    SELECTED = null;

  }

  container.style.cursor = 'auto';

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
  plane.lookAt( camera.position );

  renderer.render( scene, camera );

}

function resizeWindow() {
  resize2DRoom();
}

function resize2DRoom() {
  var $image   = $("#room");
  if ($image.length === 0) return;
  var width    = $image.width();
  var height   = $image.height();
  var wWidth   = $(window).width();
  var wHeight  = $(window).height();
  var hRatio   = height / wHeight;
  var top      = 0;
  var left     = (wWidth - width / hRatio) / 2;

  $image.attr({
    width: width / hRatio,
    height: wHeight
  });
  $image.css({
    top: top + "px",
    left: left + "px"
  });
}

$(function() {
  var image = new Image();
  image.id = "room";
  var $image = $(image);
  $image.load(function() {
    $("#background").append($image);
    resizeWindow();
  });
  image.src = "images/room.png";
});

$(window).on('resize', resizeWindow);
