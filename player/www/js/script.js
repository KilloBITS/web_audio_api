//переменные и объекты
var intervalID;
var ObjPlayer = new Object();
var timer = new Object();


//audio api
var context = new window.AudioContext();
var gainNode = context.createGain();
var filterNode = context.createBiquadFilter();
var analyser = context.createAnalyser();
var waveform = new Float32Array(analyser.frequencyBinCount);
gainNode.connect(analyser)
analyser.getFloatTimeDomainData(waveform)

var buffer, source, destination; 

var loadSoundFile = function(url) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'arraybuffer'; 
	xhr.onload = function(e) {
		context.decodeAudioData(this.response, function(decodedArrayBuffer) {
			buffer = decodedArrayBuffer;
		}, function(e) {
			console.log('Error', e);
		});
	};
xhr.send();
}
//canvas animation
;(function updateWaveform() {
  requestAnimationFrame(updateWaveform);
  analyser.getFloatTimeDomainData(waveform);
})();

const scopeCanvas = document.getElementById('oscilloscope');
const scopeContext = scopeCanvas.getContext('2d');

;(function drawOscilloscope() {
  requestAnimationFrame(drawOscilloscope)
  scopeContext.clearRect(0, 0, scopeCanvas.width, scopeCanvas.height)
  scopeContext.beginPath()
  for (let i = 0; i < waveform.length; i++) {
    const x = i
    const y = (0.5 + waveform[i] / 2) * scopeCanvas.height;
    if (i == 0) {
      scopeContext.moveTo(x, y)
    } else {
      scopeContext.lineTo(x, y)
    }
  }
  scopeContext.stroke()
})();

//functions play/stop
var play = function(){
	source = context.createBufferSource();
	source.buffer = buffer;
	destination = context.destination;
	/*
	gainNode.connect(destination);
	filterNode.connect(gainNode);
	source.connect(filterNode);
	*/
	gainNode.connect(destination);
	source.connect(gainNode);
	source.start(0);	
}

var stop = function(){
	source.stop(0);
}

var pause = function(){
	context.suspend(0);
	timer.started = 0;
}

var resume = function(){
	context.resume(0);
	timer.started = 1;
}



//загрузка
$( window ).load(function() {
	refresh();
	buffer = 1;
	ObjPlayer.pp = 1;
	ObjPlayer.playing = false;

	timer.interval = 1000;
	timer.started = 0;
});

function refresh(){
var len = $('.trackname').size();
var t = [];
  for (var i = 0; i < len; i++) {
  	var res = $('.trackname:eq('+i+')').html();
  	t.push(res);
  }
ObjPlayer.trackList = t;
}

//рабочие функции
function audioparams(sig){	
	setTimeout(function(){
		switch (sig){		
			case 1: play(); break
			case 2: stop(); break
			case 3: pause(); break
			case 4: resume(); break
		} 
	},100)	
}



function playaudio(track, point){
	if (buffer != 1){
		audioparams(2);
	}

	if (ObjPlayer.playing === false) {
		ObjPlayer.playing = true;
		//ObjPlayer.currenttrack = track;
		loadSoundFile('media/'+ track +'.mp3');
		$('#name-track').html(track);
		if (point != 'undefined') {
			$('.plays:eq('+point+')').attr('checked', true);
		}
		timeload = setTimeout(function(){
			audioparams(1);
			trackline(1);	
			timer.started = 1;	
		}, 3000);
	}
}


function stopaudio(){
	audioparams(2);
	ObjPlayer.playing = false;
	clearInterval(intervalID);
	$('#progress-track-line').css({'width': 0+'%'});
}



function next_prewAudio(dat){
var count = 0;
var a = $('.plays').size();
	while (count < a) {
		if ($('.plays:eq('+count+')').attr('checked')){
			switch (dat){
				case 0: var next = count+1; break
				case 1: var next = count-1; break
			}	        
	        stopaudio();	
	        playaudio(ObjPlayer.trackList[next]);	
	        ObjPlayer.currenttrack = ObjPlayer.trackList[next];
	        $('.plays:eq('+next+')').attr('checked', true);
			count = a + 1;
	    }else{
	 		count++;
	    }
	}
}

function trackline(){
var tracktime = parseInt(buffer.duration);
	sec = tracktime/tracktime;
	procent = 100/tracktime;
	start = 0;

	intervalID = setInterval(function(){
		if(timer.started == 1){	
			var inp = start += procent;
			if (inp <= 100) {					
				$('#progress-track-line').css({'width': inp+'%'});
			}else{
				$('#progress-track-line').css({'width': 0+'%'});
				clearInterval(intervalID);
				next_prewAudio(0);
			}
		}
	},1000);	
}

//управление громкостью
function audiovolume(v){
	if (v <= 9) {
		var volume = '0.0'+ v;
	}else if (v <= 99) {
		var volume = '0.'+ v;
	}else{
		var volume = '1.0';
	}	
	gainNode.gain.value = parseFloat(volume);
}

$(function() {
var slider  = $('#slider'), tooltip = $('.tooltip');
tooltip.hide();
slider.slider({
range: "min",
min: 0,
value: 50,
start: function(event,ui) {
    tooltip.fadeIn('fast');},
slide: function(event, ui) {
var value  = slider.slider('value'),
	volume = $('.volume');
tooltip.css('left', value).text(ui.value);
audiovolume(ui.value);
		if(value <= 5) { 
			volume.css('background-position', '0 0');
		} 
		else if (value <= 25) {
			volume.css('background-position', '0 -25px');
		} 
		else if (value <= 75) {
			volume.css('background-position', '0 -50px');
		} 
		else {
			volume.css('background-position', '0 -75px');
		};
	},
	stop: function(event,ui) {
	    	tooltip.fadeOut('fast');
		},
	});
});



/*

 var $rangeVert = $("#rangeVert");
$rangeVert
.on("slidechange", function( event, ui ) {
    $("#amountVert").text(
        $rangeVert.slider("value")
    );
})
.on("slide", function( event, ui ) {
    $("#amountVert").text(
        $rangeVert.slider("value")
    );
});



function equalizer(type){
	var t;
	switch (type){
		case 1: t = "lowpass"; break
		case 2: t = "highpass"; break
		case 3: t = "bandpass"; break
	}
	filterNode.type = t; // High-pass filter (Тип фильтра)
	filterNode.frequency.value = parseInt($('#ranone').val()); // Cutoff to 1kHZ (Базовая частота)
	filterNode.frequency.Q = 1; // Quality factor (Добротность)
}



*/

