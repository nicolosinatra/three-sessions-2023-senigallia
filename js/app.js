import * as THREE from 'three'

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
const canvas3D = document.getElementById("canvas3D")

// CHANGE SKETCH
const reset = () => {
	console.log('reset if need, init')
	// ...
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
const changeSet = (set) => {
	current_set = set
	// console.log("changeBank: " + current_set)
	changeSketch(0)
}
const loadSketch = async (sketchName) => {
	canvas3D.replaceChildren()
	myThree = await import(`/${sketchName}`)
	myThree.sketch(canvas3D, THREE) // LET'S ROCK
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