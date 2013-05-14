var container, stats;

var camera, scene, renderer;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var objects = {};
var faders = [];
var faderMeshes = [];
var buttons = [];
var buttonMeshes = [];

var loadCounter = 0;
var loadedCounter = 0;
var mouse = new THREE.Vector2(),
    offset = new THREE.Vector3(),
    INTERSECTED, SELECTED, INTERSECTED_BUTTON;
var projector;
var plane;

init();
animate();


function Fader(mesh, popupImage, bounds, maxPosition) {
  this.mesh = mesh;
  this.popupImage = popupImage;

  var value = 0;
  this.minPos = mesh.position.clone();
  this.maxPos = maxPosition.clone();
  this.minY = bounds.minY;
  this.maxY = bounds.maxY;

  this.__defineGetter__("value", function() {
    return value;
  });

  this.__defineSetter__("value", function(newValue) {
    newValue = Math.min(1, newValue);
    newValue = Math.max(0, newValue);
    value    = newValue;

    // set coordinates
    var newPoint = this.minPos.clone();
    newPoint.x = (this.maxPos.x - this.minPos.x) * value + this.minPos.x;
    newPoint.y = (this.maxPos.y - this.minPos.y) * value + this.minPos.y;
    newPoint.z = (this.maxPos.z - this.minPos.z) * value + this.minPos.z;
    mesh.position.copy( newPoint );

    this.dispatchEvent({ type: "valuechange", content: value });
  });
}

THREE.extend( Fader.prototype, THREE.EventDispatcher.prototype );

function Button(mesh, tooltipText, callback) {
  this.mesh = mesh;
  this.tooltipText = tooltipText;
  this.callback = callback;
  this.pressed = false;
}

THREE.extend( Button.prototype, THREE.EventDispatcher.prototype );

Button.prototype.toggle = function() {
  this.pressed = !this.pressed;
  var color = this.mesh.material.color.clone();
  if (this.pressed) {
    color.r += .3;
    color.g += .3;
    color.b += .3;
  } else {
    color.r -= .3;
    color.g -= .3;
    color.b -= .3;
  }
  this.mesh.material.color.copy(color);
  this.callback.call(this);
};

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.y = 100;
  camera.position.z = 200;

  // scene

  projector = new THREE.Projector();
  scene = new THREE.Scene();

  var ambient = new THREE.AmbientLight( 0x222222 );
  scene.add( ambient );

  // Front lighting
  var directionalLight = new THREE.DirectionalLight( 0xffeedd );
  directionalLight.position.set( 30, 0, 200 ).normalize();
  scene.add( directionalLight );

  // Back lighting
  var directionalLight = new THREE.DirectionalLight( 0xffeedd );
  directionalLight.position.set( 0, 100, -200 ).normalize();
  directionalLight.intensity = 0.25;
  scene.add( directionalLight );

  // plane for clicking
  plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
  plane.visible = false;
  scene.add( plane );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  // First fader from the left
  // track 0
  makeSwitch("images/icons/bass.png",
    {minY: -45.78, maxY: -63.42},
    new THREE.Vector3(-58, -66, 0),
    new THREE.Vector3(-60, -66, 24.895702365273355),
    function( event ) {
      changeVolume(event.content, 0);
    });
  makeButton("Reverb", 0x1B3C0D, new THREE.Vector3(-49, -66, 3), function() {
    toggleReverb(0);
  });
  makeButton("Delay", 0x7E1D17, new THREE.Vector3(-49.5, -66, 13), function() {
    toggleDelay(0);
  });
  makeButton("Phaser", 0xED9532, new THREE.Vector3(-50, -66, 23), function() {
    togglePhaser(0);
  });

  // Second fader from the left
  // track 1
  makeSwitch("images/icons/drums.png",
    {minY: -46.19, maxY: -63.8},
    new THREE.Vector3(-31, -66, .33),
    new THREE.Vector3(-32, -66, 25.3),
    function( event ) {
      changeVolume(event.content, 1);
    });
  makeButton("Reverb", 0x1B3C0D, new THREE.Vector3(-22, -66, 4), function() {
    toggleReverb(1);
  });
  makeButton("Delay", 0x7E1D17, new THREE.Vector3(-22.5, -66, 14), function() {
    toggleDelay(1);
  });
  makeButton("Phaser", 0xED9532, new THREE.Vector3(-23, -66, 24), function() {
    togglePhaser(1);
  });

  // Third fader from the left
  // track 2
  makeSwitch("images/icons/gtr.png",
    {minY: -46.8, maxY: -64},
    new THREE.Vector3(-4.1, -66, .66),
    new THREE.Vector3(-5.4, -66, 25.7),
    function( event ) {
      changeVolume(event.content, 2);
    });
  makeButton("Reverb", 0x1B3C0D, new THREE.Vector3(4.9, -66, 5), function() {
    toggleReverb(2);
  });
  makeButton("Delay", 0x7E1D17, new THREE.Vector3(4.9, -66, 15), function() {
    toggleDelay(2);
  });
  makeButton("Phaser", 0xED9532, new THREE.Vector3(4.9, -66, 25), function() {
    togglePhaser(2);
  });

  // Fourth fader from the left
  // track 3
  makeSwitch("images/icons/keys.png",
    {minY: -46.4, maxY: -64.4},
    new THREE.Vector3(23.3, -66, 1),
    new THREE.Vector3(23, -66, 26.1),
    function( event ) {
      changeVolume(event.content, 3);
    });
  makeButton("Reverb", 0x1B3C0D, new THREE.Vector3(32.5, -66, 5.5), function() {
    toggleReverb(3);
  });
  makeButton("Delay", 0x7E1D17, new THREE.Vector3(32.5, -66, 15.5), function() {
    toggleDelay(3);
  });
  makeButton("Phaser", 0xED9532, new THREE.Vector3(32.5, -66, 25.5), function() {
    togglePhaser(3);
  });

  // Fifth fader from the left
  // track 4
  makeSwitch("images/icons/vox.png",
    {minY: -46.6, maxY: -65},
    new THREE.Vector3(48.25, -66, 1.33),
    new THREE.Vector3(47.25, -66, 26.5),
    function( event ) {
      changeVolume(event.content, 4);
    });
  makeButton("Reverb", 0x1B3C0D, new THREE.Vector3(57.25, -66, 6), function() {
    toggleReverb(4);
  });
  makeButton("Delay", 0x7E1D17, new THREE.Vector3(57.25, -66, 16), function() {
    toggleDelay(4);
  });
  makeButton("Phaser", 0xED9532, new THREE.Vector3(57.25, -66, 26), function() {
    togglePhaser(4);
  });

  // Master fader
  makeSwitch("images/icons/vol.png",
    {minY: -42.5, maxY: -66},
    new THREE.Vector3(82.2, -66, -5),
    new THREE.Vector3(82.2, -66, 27.2),
    1.5,
    function( event ) {
      changeMasterVolume(event.content);
    });

  // document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mousemove', onSwitchMouseMove, false );
  document.addEventListener( 'mousedown', onSwitchMouseDown, false );
  document.addEventListener( 'mouseup', onSwitchMouseUp, false );

  window.addEventListener( 'resize', onWindowResize, false );

}

function makeSwitch(popupImage, bounds, position, toPosition, scale, callback) {
  if (typeof callback === 'undefined') {
    callback = scale;
    scale = 1;
  }
  loadModel('switch', 'obj/fader.obj', function(child) {
    if ( child instanceof THREE.Mesh ) {
      child.scale.x = child.scale.y = child.scale.z = .10 * scale;
      child.material.color.setHex(0xED9532);
      faderMeshes.push( child );
      child.position.copy( position );
      var fader = new Fader(child, popupImage, bounds, toPosition);
      faders.push( fader );
      fader.addEventListener( "valuechange", callback);
    }
  });
}

function makeButton(tooltipText, color, position, callback) {
  loadModel('switch', 'obj/button.obj', function(child) {
    if ( child instanceof THREE.Mesh ) {
      child.scale.x = child.scale.y = child.scale.z = .05;
      child.position.copy( position );
      child.material.color.setHex(color);
      buttons.push( new Button(child, tooltipText, callback) );
      buttonMeshes.push(child);
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
function onSwitchMouseMove(event) {
  var raycaster, intersects, newPoint;
  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster = getRaycaster();
  intersects = raycaster.intersectObject( plane );
  newPoint = intersects[ 0 ].point;

  if ( SELECTED ) {
    var position = newPoint.sub(offset);
    var minY = SELECTED.minY;
    var maxY = SELECTED.maxY;
    SELECTED.value = (position.y - minY) / (maxY - minY);
    hideTooltips();
    return;
  }

  intersects = raycaster.intersectObjects(faderMeshes);
  if ( intersects.length > 0 ) {
    INTERSECTED = intersects[ 0 ].object;
    container.style.cursor = 'move';
  } else {
    INTERSECTED = null;
  }

  intersects = raycaster.intersectObjects( buttonMeshes );
  if ( intersects.length > 0 ) {
    // Find associated button object
    for (var i = 0; i < buttons.length; i++) {
      if (intersects[0].object == buttons[i].mesh) {
        INTERSECTED_BUTTON = buttons[i];
        break;
      }
    }
    container.style.cursor = 'pointer';
  } else {
    INTERSECTED_BUTTON = null;
  }

  if (!INTERSECTED_BUTTON && !INTERSECTED) {
    container.style.cursor = 'auto';
    hideTooltips();
  } else if (INTERSECTED) {
    // Show fader image
    var fader;
    for (var i = 0; i < faders.length; i++) {
      if (INTERSECTED == faders[i].mesh) {
        fader = faders[i];
        break;
      }
    }
    showImageTooltip(event, fader.popupImage);
  } else if (INTERSECTED_BUTTON) {
    showTextTooltip(event, INTERSECTED_BUTTON.tooltipText);
  }
}

function onSwitchMouseDown( event ) {
  event.preventDefault();

  // Check for intersection with the fader objects.
  var raycaster = getRaycaster();
  var intersects = raycaster.intersectObjects(faderMeshes);
  if ( intersects.length > 0 ) {
    // Find associated fader object
    for (var i = 0; i < faders.length; i++) {
      if (intersects[0].object === faders[i].mesh) {
        SELECTED = faders[i];
        break;
      }
    }

    var intersects = raycaster.intersectObject( plane );
    offset.copy( intersects[ 0 ].point ).sub( plane.position );
    offset.y -= SELECTED.minY;

    container.style.cursor = 'move';

  }

}

function onSwitchMouseUp( event ) {

  event.preventDefault();

  if ( INTERSECTED ) {
    SELECTED = null;
  }

  if ( INTERSECTED_BUTTON ) {
    var intersects = getRaycaster().intersectObjects(buttonMeshes);
    if (intersects.length > 0 && INTERSECTED_BUTTON.mesh === intersects[ 0 ].object) {
      INTERSECTED_BUTTON.toggle();
    }
  }

  container.style.cursor = 'auto';
}

function getRaycaster() {
  var vector, normalized;
  vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
  projector.unprojectVector( vector, camera );
  normalized = vector.sub( camera.position ).normalize();
  return new THREE.Raycaster( camera.position, normalized );
}

function animate() {

  requestAnimationFrame( animate );
  render();

}

function render() {
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
  var $myDIV   = $("#background");
  if ($myDIV.length === 0) return;
  var width    = $myDIV.width();
  var height   = $myDIV.height();
  var wWidth   = $(window).width();
  var wHeight  = $(window).height();
  var hRatio   = height / wHeight;
  var top      = 0;
  var left     = (wWidth - width / hRatio) / 2;

  $myDIV.attr({
    width: width / hRatio,
    height: wHeight
  });
  $myDIV.css({
    top: top + "px",
    left: left + "px"
  });
}

function resizeScreen(elemID){
  var element = document.getElementById("elemID");


}


$(function() {
 // $('#div_video').get(0).play();
  var image = new Image();
  image.id = "room";
  var $image = $(image);
  $image.load(function() {
    $("#background").append($image);
    resizeWindow();
    onWindowResize();
  });
  image.src = "images/room.png";
});



$(window).on('resize', resizeWindow);




$("#tL").click(function(){
var url = "http://giantpanda.cias.rit.edu/videos/v1.webm";
var title = "marchWashington";
changeMovieSource(url, title);
});

$("#mL").click(function(){
var url = "http://giantpanda.cias.rit.edu/videos/v2.webm";
var title = "fanArt";
changeMovieSource(url, title);
});
$("#bL").click(function(){
var url = "http://giantpanda.cias.rit.edu/videos/v3.webm";
var title = "1961";
changeMovieSource(url, title);
});
$("#tR").click(function(){
var url = "http://giantpanda.cias.rit.edu/videos/v4.webm";
var title = "marchPeach";
changeMovieSource(url, title);
});

$("#mR").click(function(){
var url = "http://giantpanda.cias.rit.edu/videos/v5.webm";
var title = "1960s";
changeMovieSource(url, title);
});
$("#bR").click(function(){
var url = "http://giantpanda.cias.rit.edu/videos/v6.webm";
var title = "fanArt2";
changeMovieSource(url, title);
});


var videoChangingPending = false;
function changeMovieSource(url, title){
        var $video = $('#div_video');
        try {
            document.getElementById('div_video').src = url;
        }
        catch (e) {
            alert(e);
        }     

        $video.attr('autoplay', 'true');
        $video.data('currentTitle', title);

        document.getElementById('div_video').load();
        $video.prop('muted', true);
        videoChangingPending = false;
}    



