//обработчики событий
$('#playAudio').click(function(){
	switch (ObjPlayer.pp){
		case 0: $("#playAudio").css("background-image","url(image/play.png)"); ObjPlayer.pp = 1; break
		case 1: $("#playAudio").css("background-image","url(image/pause.png)"); ObjPlayer.pp = 0; break
	} 

	if (ObjPlayer.playing === false) {
		if(ObjPlayer.currenttrack){
			playaudio(ObjPlayer.currenttrack);
		}else{
			playaudio(ObjPlayer.trackList[0],0);
		}    
	}else{
		switch (ObjPlayer.pp){
			case 0: audioparams(4); break
			case 1: audioparams(3); break
		} 	
	}
});

$('#stop').click(function(){
	stopaudio();
	ObjPlayer.pp = 1;	
	$("#playAudio").css("background-image","url(image/play.png)"); 
});

$('#next').click(function(){
	next_prewAudio(0);
});

$('#prew').click(function(){
	next_prewAudio(1);
});

$('.tabs').dblclick(function(){
	var index = $('.tabs').index(this);
	ObjPlayer.currenttrack = $('.trackname:eq('+index+')').html();
	//$('.plays:eq('+index+')').attr('checked', true);	
	playaudio(ObjPlayer.currenttrack, index, 1);
		ObjPlayer.pp = 0;	
	$("#playAudio").css("background-image","url(image/pause.png)"); 

})

$('.tabs').click(function(){
	var index = $('.tabs').index(this);
	$('.plays:eq('+index+')').attr('checked', true);
	ObjPlayer.currenttrack = $('.trackname:eq('+index+')').html();
})