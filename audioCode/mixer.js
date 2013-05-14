var context;
var analyser;
var processor;
var masterVolume;
var tuna;
var tracks = [];
var numberAudioElementsLoaded = 0;
var trackElements;
var isWorking = false;
var freqByteData;
var speakerImages = [];

// call this to begin. Should not be called until all tracks loaded
  function initAudio() {
  try {
    context = new webkitAudioContext(); // make a context for the app
    tuna = new Tuna(context); 
    masterVolume = context.createGainNode();
    trackElements = [document.getElementById("audio1"),
                    document.getElementById("audio2"),
                    document.getElementById("audio3"),
                    document.getElementById("audio4"),
                    document.getElementById("audio5"),
                    document.getElementById("audio6")]; // get the 6 audio tracks
    initTracks();
    StartAll();
    isWorking = true;
    //speakerImages = [document.getElementById("speaker1"),document.getElementById("speaker2")];
    window.setInterval(gainMeter,50);
  }
  catch(e) {
  	// called when in a non-complient browser or when audio fails to load
    alert('This interactive music video is best viewed in Google Chrome.');
    var mainTune = document.getElementById("finalMix");
    mainTune.play();
    isWorking = false;
  }
}

// create the different audio nodes and tuna effects for each track
function initTracks(){
  for (var i=0; i < trackElements.length; i++){
    var trackData = {};
    
    trackData.gainNode = context.createGainNode();
    
    trackData.phaser = new tuna.Phaser( {
      rate: 10,
      depth: 0.9,
      feedback: 0.5,
      stereoPhase: 30,
      baseModulationFrequency: 700,
      bypass: 1
    });

    trackData.reverb = new tuna.Convolver({
      highCut: 22050,
      lowCut: 20,
      dryLevel: 1.0,
      wetLevel: 0.7,
      level: 1.0,
      impulse: "audioCode/impulses/impulse_rev.wav",
      bypass: 1
    });

    trackData.delay = new tuna.Delay({
      feedback: 0.5,   
      delayTime: 150,     
      wetLevel: 1,    
      dryLevel: 1,       
      cutoff: 22050,        
      bypass: 1
            });

    trackData.element = trackElements[i];
    trackData.sourceNode = context.createMediaElementSource(trackData.element);

    // connect everything here
    trackData.sourceNode.connect(trackData.gainNode);
    trackData.gainNode.connect(trackData.phaser.input);
    trackData.phaser.connect(trackData.delay.input);
    trackData.delay.connect(trackData.reverb.input);
    trackData.reverb.connect(masterVolume);
    tracks[i] = trackData;
  }
  analyser = context.createAnalyser();
  analyser.smoothingTimeConstant = 0.5;
  analyser.fftSize = 128;
  freqByteData = new Uint8Array(analyser.frequencyBinCount);
  processor = context.createJavaScriptNode(2048,1,1);
  masterVolume.connect(analyser);
  analyser.connect(context.destination);
  processor.onaudioprocess = gainMeter();
}

/*
* To use the following toggle{Effect} functions just call them 
* with the appropraite trackId to toggle the effect for (0 thr 5)
*/

function toggleDelay(trackId){
	if (isWorking) {
		if (tracks[trackId].delay.bypass){
			tracks[trackId].delay.bypass = 0;
		}
		else {
		 tracks[trackId].delay.bypass = 1; 
		}
	}
}

function toggleReverb(trackId){
  if (isWorking) {
		if (tracks[trackId].reverb.bypass){
			tracks[trackId].reverb.bypass = 0;
		}
		else {
		 tracks[trackId].reverb.bypass = 1; 
		}
	}
}

function togglePhaser(trackId){
 	if (isWorking) {
		if (tracks[trackId].phaser.bypass){
			tracks[trackId].phaser.bypass = 0;
			//tracks[trackId].source.mediaElement.play();
		}
		else {
		 tracks[trackId].phaser.bypass = 1; 
		 //tracks[trackId].element.play();	 
  	}
  }
}

/* Call the 2 change volume functions (regular and master)
* by proiving a value (the height of the fader) and the trackId, 
* for the changeVolume function. Pretty straightforward
*/
function changeVolume(value,trackId){
 	if (isWorking) {
  	tracks[trackId].gainNode.gain.value = 1 - value;
  }
}

function changeMasterVolume(value){
 	if (isWorking) {
  	masterVolume.gain.value = 1 - value;
  }
}

function gainMeter(){
	var values = 0;
	var average = 0;
	var byteDatalength = freqByteData.length;
	analyser.getByteFrequencyData(freqByteData);
	for (var i=0; i< byteDatalength; i++){
		values += freqByteData[i];
	}
	average = (values / byteDatalength) * masterVolume.gain.value;
	//console.log(average);
	for (var j=0; j<speakerImages.length; j++){
		var scale = 10+(average/100); // the speaker height here
		var pos = -1 * scale / 2;
		speakerImages[j].style.width = scale+"%";
		speakerImages[j].style.height = scale+"%";
		speakerImages[j].style.top = pos+"%";
		speakerImages[j].style.left = pos+"%";
	}
	return average;
}