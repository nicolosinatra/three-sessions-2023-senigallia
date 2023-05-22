// By @fupete (c) 2023 | MIT License
//
// Credits: the base keyboard VJ engine idea is inspired and builded upon the works: 
// RBVJ by George Gally Radarboy https://github.com/GeorgeGally/rbvj/ 
// P5-VJ by Salil Parekh https://github.com/burnedsap/p5-vj 
//
// HELP:
// [0-9] changeSet
// [A-Z] changeSketch
// [\] toggleMouse
// [F6] toggleFullscreen
// [mouse] orbit controls + depends on the sketch (testing)
// 
// SCENES:
// 0 - GRID [status: 1st draft]
// 1 - SPHERES [status: nd ]
// 2 - COLUMNS [status: nd]
// 3 - CLOUDS [status: 1st draft]
// 4 - LAVA [status: nd]
// 5 - ...
// 6 - SOCRATES [status: nd]
// 7 - IMAGES [status: nd]
// 
// COMING UP: 
// - Web Audio API support
// - ...
// - TouchOSC support

import "./init"
import * as THREE from 'three'
import * as GUI from 'dat.gui'
global.THREE = THREE
global.GUI = GUI

let myThree
const artFolder = "sketch"
let current_sketch = 0
let current_set = 0
let isFullscreen = false
let showCursor = false
global.canvas3D = document.getElementById("canvas3D") // global canvas3D

// CHANGE SET & SKETCH
const changeSet = (set) => {
	current_set = set
	changeSketch(0)
}
const changeSketch = (sketch) => {
	current_sketch = sketch
	const loc = current_set + '/' + current_sketch
	const sketchName = loc + '.js'
	loadSketch(sketchName)
	document.location.hash = loc
}
const loadSketch = async (sketchName) => {
	if (myThree?.dispose()) {
		myThree.dispose()
		myThree = {}
	}
	canvas3D.replaceChildren()
	myThree = await import(`../sketch/${sketchName}`)
	myThree.sketch() // LET'S ROCK
}
const map = (value, min1, max1, min2, max2) => {
	const returnvalue = ((value - min1) / (max1 - min1) * (max2 - min2)) + min2
	return returnvalue
}

// UI
const onKeyDown = (event) => {
	var keyCode = event.keyCode
	if (keyCode >= 65 && keyCode <= 90)
		changeSketch(keyCode - 65) // a-z
	else if (keyCode >= 48 && keyCode <= 57) { // 0-9
		changeSet(keyCode - 48)
	} else if (keyCode == 220) toggleMouse() // \
	else if (keyCode == 117) toggleFullscreen() // F6
	else if (keyCode == 222) initAudio() // 
}
window.addEventListener('keydown', function (e) {
	if (typeof onKeyDown == 'function') onKeyDown(e);
})
const toggleMouse = () => {
	showCursor = !showCursor
	if (showCursor) window.document.body.style.cursor = 'crosshair'
	else window.document.body.style.cursor = 'none'
}
const toggleFullscreen = () => {
	isFullscreen = false
	if (document.fullscreenElement == null) {
		canvas3D.requestFullscreen()
		isFullscreen = true
	} else {
		document.exitFullscreen()
		isFullscreen = false
	}
}

// INIT
const init = () => {
	window.document.body.style.cursor = 'none'
	changeSketch(0)
	// setTimeout(() => {
	// 	toggleFullscreen();
	//   }, 5000);
	// ...
}
window.addEventListener('load', init)