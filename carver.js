window.url="image.jpg";
window.scaleGif=false;
window.otherBtn=function(btn){return [...document.querySelectorAll("button")].filter(v=>v!=btn)[0];};
window.wait=1;
window.tempCanvas=document.createElement("CANVAS");
window.tempCtx=window.tempCanvas.getContext('2d');
async function getGifFrames(gifURL){
	console.log("a");
	await new Promise(r=>{
		var oReq=new XMLHttpRequest();
		oReq.open("GET",gifURL,true);
		oReq.responseType="arraybuffer";
		oReq.onload=function(oEvent){
			if(oReq.response)window.gifFrames=(new GIFuct(oReq.response)).decompressFrames(true);
			r();
		};
		oReq.send(null);
	});
	console.log("b");
	return window.gifFrames;
}
async function doGIF(btn,url){
	//disable input GIF animation because it isn't supported rn
	window.scaleGif=false;
	window.url=url;
	window.wait=1;
	window.gif=new GIF({workers:5});
	var img=document.getElementById("i");
	img.src="";
	img.onload=function(){img.onload=function(){};window.gif.addFrame(img,{delay:50});}
	img.src=url;
	for(var i=1;i<21;i++){
		doEverything(btn,i,window.url,function(url){window.url=url;window.wait=0;});
		while(window.wait){await new Promise(sleep=>setTimeout(sleep,0));}
		window.gif.addFrame(window.memvas,{delay:50});
		window.wait=1;
	}
	window.gif.on('finished',function(blob){document.querySelector("progress").value=0;var url=window.URL.createObjectURL(blob);document.getElementById("r").src=url;document.getElementById("res").href=url;document.getElementById("res").download="aware.gif";document.getElementById("res").style.display="";});
	window.gif.render();
	btn.removeAttribute("disabled");
	window.otherBtn(btn).removeAttribute("disabled");
	document.querySelectorAll('input[type=checkbox]')[1].removeAttribute("disabled");
	document.querySelector('#input').removeAttribute("disabled");
}
			function drawPatch(frame,gifcb){
				console.log("d"+window.gifFrames.indexOf(frame));
				var dims=frame.dims;
				if(!window.frameImageData||dims.width!=window.frameImageData.width||dims.height!=window.frameImageData.height){
					window.tempCanvas.width=dims.width;
					window.tempCanvas.height=dims.height;
					window.frameImageData=window.tempCtx.createImageData(dims.width,dims.height);
				}
				window.frameImageData.data.set(frame.patch);
				window.tempCtx.putImageData(window.frameImageData,0,0);
				window.tempCanvas.toBlob(function(blob){
					console.log("e"+window.gifFrames.indexOf(frame));
					gifcb(window.URL.createObjectURL(blob));
				});
			}
async function doEverything(btn,gif,url,cb){
	btn.setAttribute('disabled','disabled');
	window.otherBtn(btn).setAttribute('disabled','disabled');
	document.querySelector('#input').setAttribute('disabled','disabled');
	document.querySelectorAll('input[type=checkbox]')[1].setAttribute('disabled','disabled');
	var img=document.getElementById('i');
	document.getElementById("res").style.display="none";
	if(window.scaleGif){
		await new Promise(r=>{
			window.giff=new GIF({workers:5});
			r(getGifFrames(url));
		});
		console.log(window.gifFrames.length);
		await new Promise(async r=>{
			window.scaleGif=false;
			for(var frm=0;frm<window.gifFrames.length;frm++){
				console.log("c"+frm);
				console.log(Math.floor(100*frm/window.gifFrames.length)+"% complete");
					await new Promise(rr=>drawPatch(window.gifFrames[frm],function(b){
						console.log("f"+frm);
						doEverything(btn,gif,b,function(ur){
							console.log("g"+frm);
							var iimg=document.createElement("IMG");
							iimg.onload=function(){
								window.giff.addFrame(iimg,{delay:50});
							};
							iimg.src=ur;
							if(frm+1==window.gifFrames.length){
								cb(ur,[btn]);
								window.giff.on('finished',function(blob){var url=window.URL.createObjectURL(blob);document.getElementById("r").src=url;document.getElementById("res").href=url;document.getElementById("res").download="aware.gif";document.getElementById("res").style.display="";});
								window.giff.render();
								console.log("h");
							}
							rr();
						});
					}));
			}
			r();
		});
		return;
	}
	img.src="";
	img.onload=function(){img.onload=function(){};doCarve(this.src,gif,cb,[btn]);}
	img.src=url;
}
async function doCarve(url, gif, callback, callbackvars){try{
	window.memvas=document.createElement('canvas');
	window.memtext=window.memvas.getContext('2d');
	window.c=new Carver("c",url);
	while(typeof window.c.img==="undefined"){await new Promise(sleep=>setTimeout(sleep,0));}
	window.c.canvas.style.display="";
	document.querySelector("progress").max=window.c.canvas.width;
	while(window.c.w>window.c.canvas.width*(gif?0.95:0.5)){
		window.c.shrink();
		document.querySelector("progress").value=((gif?(0.95+(gif*0.05)):1)*window.c.canvas.width)-window.c.w;
		await new Promise(sleep=>setTimeout(sleep,document.querySelector('input[type=checkbox]').checked?0:100));
	}
	var imgc=new Image();
	imgc.src=window.c.canvas.toDataURL("image/png");
	imgc.onload=async function(){
	if(document.querySelectorAll("input[type=checkbox]")[1].checked){
		window.memvas.width=window.c.h;
		window.memvas.height=window.c.w;
		window.memtext.save();
		window.memtext.translate(window.memvas.width,0);
		window.memtext.rotate(Math.PI/2);
		window.memtext.drawImage(imgc,0,0);
		window.memtext.restore();
	}else{
		window.memvas.width=window.c.w;
		window.memvas.height=window.c.h;
		window.memtext.drawImage(imgc,0,0);
	}
	window.c.canvas.style.display="none";
	if(!document.querySelectorAll("input[type=checkbox]")[1].checked){
		if(!gif){document.querySelector("progress").value=0;}
		callback(window.memvas.toDataURL("image/png"),callbackvars);
		return;
	}
	window.d=new Carver("d",window.memvas.toDataURL("image/png"));
	while(typeof window.d.img==="undefined"){await new Promise(sleep=>setTimeout(sleep,0));}
	window.d.canvas.style.display="";
	document.querySelector("progress").max=window.d.canvas.width;
	while(window.d.w>window.d.canvas.width*(gif?0.95:0.5)){
		window.d.shrink();
		document.querySelector("progress").value=((gif?(0.95+((gif+0.5)*0.05)):1.5)*window.d.canvas.width)-window.d.w;
		await new Promise(sleep=>setTimeout(sleep,document.querySelector('input[type=checkbox]').checked?0:100));
	}
	var imgd=new Image();
	imgd.src=window.d.canvas.toDataURL("image/png");
	imgd.onload=async function(){
	window.memvas.width=window.c.canvas.width;
	window.memvas.height=window.d.canvas.width;
	window.memtext.save();
	window.memtext.translate(0,window.memvas.height);
	window.memtext.scale(gif?1.05:2,gif?1.05:2);
	window.memtext.rotate(Math.PI/-2);
	window.memtext.drawImage(imgd,0,0);
	window.memtext.restore();
	window.c.canvas.style.display=window.d.canvas.style.display="none";
	if(!gif){document.querySelector("progress").value=0;}
	callback(window.memvas.toDataURL("image/png"),callbackvars);
	}
	}
}catch(e){alert(e);}}
function Carver(canvasId, url) {
	// create canvas & drawing context
	this.canvas = document.getElementById(canvasId);
	this.context = this.canvas.getContext('2d');
	var carver = this;
	// load image
	var img = new Image();
	img.onload = function() {
		var w = this.width;
		var h = this.height;
		if (document.querySelectorAll("input[type=checkbox]")[2].checked && (w > 512 || h > 512)) {
			var ratio = Math.min(512 / w, 512 / h, 0.5);
			// tinyhack: if any side is > 512. Let's implement it as a 0.5 scale factor if > 512.
			// scaling 50% smaller. = faster operation
			var scale = 0.5;
			w = Math.floor(w * scale);
			h = Math.floor(h * scale);
		}
		carver.canvas.width = w;
		carver.canvas.height = h;
		carver.context.drawImage(img,0,0,w,h);
		carver.w = w;
		carver.h = h;
		carver.img=img;
	};
	img.src = url; // trigger image loading
	this.shrink = function() {
		// get raw data
		var raw = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		// difference between two pixels (color vector distance)
		var pixel_diff = function(x0,y0, x1,y1) {
			var offset0 = 4 * (carver.canvas.width * y0 + x0);
			var r0 = raw.data[offset0];
			var g0 = raw.data[offset0 + 1];
			var b0 = raw.data[offset0 + 2];
			var offset1 = 4 * (carver.canvas.width * y1 + x1);
			var r1 = raw.data[offset1];
			var g1 = raw.data[offset1 + 1];
			var b1 = raw.data[offset1 + 2];
			return Math.sqrt(Math.pow(r0 - r1, 2) +
				Math.pow(g0 - g1, 2) +
				Math.pow(b0 - b1, 2));
		};
		var lowest_score = null;
		var lowest_points = null;
		for(i = 0; i < this.w; ++i) { // for each column
			var score = 0;	// column score
			var x = i; // starting from i, look around.
			var path = new Array(); // storing the points to be removed.
			for(j = 0; j < this.h; j++) {
				var lots = Math.pow(10, 30);
				var delta_left = lots, delta_here = lots, delta_right = lots;
				path.push([x, j]);
				if(j == this.h - 1) {
					break;
				}
				// comparison between the current pixel and the one under
				delta_here = pixel_diff(x, j, x, j+1);

				// if there is a pixel on the left, check how different it is.
				if(x != 0) {
					delta_left = pixel_diff(x, j, x-1, j+1);
				}
				// if there is a pixel on the right, check how different it is.
				if(x != this.w-1) {
					delta_right = pixel_diff(x, j, x+1, j+1);
				}
				// check which way we're going next.
				if(delta_left < delta_here && delta_left < delta_right) {
					x--; // go down left
					score += delta_left;
				} else if(delta_right < delta_here && delta_right < delta_left) {
					x++; // go down right
					score += delta_right;
				} else { // go down
					score += delta_here;
				}
				if(lowest_score != null && score > lowest_score) {
					break; // no point continuing
				}
			}
			// save the path with the lowest score
			if(lowest_score == null || score < lowest_score) {
				lowest_score = score;
				lowest_points = path;
			}
		}
		// remove the squiggly “line” of points with the lowest score, row by row.
		for(p = 0; p < lowest_points.length; p++) {
			var x = lowest_points[p][0];
			var y = lowest_points[p][1];
			// shifts all pixels on the right of the selected path one position to the left.
			for(i = x; i < this.w-1; i++) {
				var offset = 4 * (this.canvas.width * y + i);
				raw.data[offset] = raw.data[offset+4];
				raw.data[offset+1] = raw.data[offset+5];
				raw.data[offset+2] = raw.data[offset+6];
				raw.data[offset+3] = raw.data[offset+7];
			}
			// add a single white pixel to the right of the row
			/*
			offset = 4 * (this.canvas.width * y + this.w-1);
			raw.data[offset] = 255;
			raw.data[offset+1] = 255;
			raw.data[offset+2] = 255;
			*/
		}
		this.context.putImageData(raw, 0, 0);
		// now dealing with one less column
		this.w--;
	};
}
document.querySelector('#input').onchange=function(){
	var file=document.querySelector('#input').files[0];
	var reader=new FileReader();
	reader.addEventListener("load",function(){
		window.url=reader.result;
		window.scaleGif=file.type.toLowerCase()=="image/gif";
		document.getElementById("i").src=window.url;
	},false);
	if(file)reader.readAsDataURL(file);
};
