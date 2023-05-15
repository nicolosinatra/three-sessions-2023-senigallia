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
// COMING UP: 
// - TouchOSC support
// - Web Audio API support
// - ...

import "./init"

import * as THREE from 'three'
global.THREE = THREE // global THREE

let myThree
const artFolder = "sketch"
let current_sketch = 0
let current_set = 0
let isFullscreen = false
let showCursor = false

const init = () => {
	window.document.body.style.cursor = 'none'
	changeSketch(0)
	// setTimeout(() => {
	// 	toggleFullscreen();
	//   }, 5000);
	// ...
}
window.addEventListener('load', init)
global.canvas3D = document.getElementById("canvas3D") // global canvas3D

// CHANGE SET & SKETCH
const changeSet = (set) => {
	current_set = set
	// console.log("changeSet: " + current_set)
	changeSketch(0)
}
const changeSketch = (sketch) => {
	reset()
	current_sketch = sketch
	const loc = current_set + '/' + current_sketch
	const sketchName = artFolder + '/' + loc + '.js'
	loadSketch(sketchName)
	// console.log("changeSketch: " + sketchName)
	document.location.hash = loc
}
const reset = () => {
	console.log('reset if need, init')
	// ...
}
const loadSketch = async (sketchName) => {
	if (myThree?.dispose()) {
		myThree.dispose()
		myThree = {}
	}
	canvas3D.replaceChildren()
	myThree = await import(`/${sketchName}`)
	myThree.sketch() // LET'S ROCK
}

// UI
const onKeyDown = (event) => {
	// console.log(event.keyCode)
	var keyCode = event.keyCode
	if (keyCode >= 65 && keyCode <= 90)
		changeSketch(keyCode - 65) // CHANGE SKETCH // keys a-z
	else if (keyCode >= 48 && keyCode <= 57) { // CHANGE SET // keys 0-9
		changeSet(keyCode - 48)
	} else if (keyCode == 220) toggleMouse() // \
	else if (keyCode == 117) toggleFullscreen() // F6
}
window.addEventListener('keydown', function (e) {
	if (typeof onKeyDown == 'function') onKeyDown(e);
})
const toggleMouse = () => {
	console.log("toggleMouse")
	showCursor = !showCursor
	if (showCursor) window.document.body.style.cursor = 'crosshair'
	else window.document.body.style.cursor = 'none'
}
const toggleFullscreen = () => {
	console.log("toggleFullscreen")
	isFullscreen = false
	if (document.fullscreenElement == null) {
		canvas3D.requestFullscreen()
		isFullscreen = true
	} else {
		document.exitFullscreen()
		isFullscreen = false
	}
}