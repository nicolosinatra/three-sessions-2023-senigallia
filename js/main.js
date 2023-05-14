import * as THREE from 'three'

let myThree

const artFolder = "sketch"
let current_file = 0
let current_set = 0
let current_bank = 0

function setup() {
  changeFile(0)
}

function changeFile(file) {
  reset()
  current_file = file
  const loc = current_set + '/' + current_bank + '/' + current_file;
  const filename = artFolder + '/' + loc + '.js'
  loadJS(filename)
  console.log("changeFile: " + filename)
  document.location.hash = loc
}

function changeSet(set) {
  current_set = set
  current_bank = 0
  console.log("changeSet: " + current_bank)
  changeFile(0)
}

function changeBank(bank) {
  current_bank = bank
  console.log("changeBank: " + current_bank)
  changeFile(0)
}

async function loadJS(filename) {
  document.getElementById("canvas3D").replaceChildren()
  myThree = await import(`/${filename}`)
  myThree.stage(THREE)
}

window.addEventListener('load', setup)

// KEYPRESS

/*
Code taken from: https://github.com/GeorgeGally/rbvj George Gally
*/

function onKeyDown(event) {

  //console.log(event.keyCode);
  var keyCode = event.keyCode

  // CHANGE FILE // keys a-z
  if (keyCode >= 65 && keyCode <= 90) {
    changeFile(keyCode - 65)

    // CHANGE SET AND BANK // keys 0-9
  } else if (keyCode >= 48 && keyCode <= 57) {

    if(event.shiftKey) {
      changeSet(keyCode-48)
    } else {
      changeBank(keyCode-48)
    }

    // ~ SHOW MOUSE
  } else if (keyCode == 192) {
    showMouse()
  }

}

window.addEventListener('keydown', function(e) {
  if (typeof onKeyDown == 'function') onKeyDown(e);
})


// CANVAS


// allows me global access to canvas and it’s width and height properties
var w, width, h, height;
var canvas;

width = w = window.innerWidth;
height = h = window.innerHeight;

	// this enables me to have many canvases all positioned on top of eachother at 100% width and height of page

function createCanvas(_canvas_name){
	// var ww = _w || window.innerWidth;
	// var hh = _h || window.innerHeight;
	canvas = document.createElement('canvas');
	var body = document.querySelector('body');
	canvas.setAttribute("id", _canvas_name);
	canvas.style.position = "absolute";
	canvas.style.left = "0px";
	canvas.style.top = "0px";
	// canvas.style.width = ww;
	// canvas.style.height = hh;

	body.appendChild(canvas);
	var ctx = canvas.getContext('2d');

		resize();
		window.addEventListener("resize", resize, false);

	return ctx;
}

function createMultipleCanvases(num){
	var contexts = []
	for (var i = 0; i < num; i++) {
		contexts[i] = createCanvas("canvas" + (i+1));
	}
	return contexts;
}

function createGLCanvas(canvas_name){
	canvas = document.createElement('canvas');
	var body = document.querySelector('body');
	canvas.setAttribute("id", canvas_name);
	canvas.style.position = "absolute";
	canvas.style.left = "0px";
	canvas.style.top = "0px";
	body.appendChild(canvas);
	var gl = canvas.getContext('webgl');
	if (!gl) var gl = canvas.getContext('webgl') || canvas.getContext("experimental-webgl");
	resize(canvas_name);
	window.addEventListener("resize", resize, false);
	return gl;
}

function reFitCanvas(_w, _h){
	canvas.width = width = w = _w;
	canvas.height = height = h = _h;
}


function resize(w, h){
	var c = document.getElementsByTagName('canvas');
	width = w = window.innerWidth;
	height = h = window.innerHeight;
	for(var i = 0; i < c.length; i++) {
		c[i].width = width;
		c[i].height = height;
	}
	//console.log("resize: " + w +":" + h);
}

function createHiddenCanvas(canvas_name){
	var ctx = createCanvas(canvas_name)
	canvas.style.left = -w+"px";
	return ctx;
}
