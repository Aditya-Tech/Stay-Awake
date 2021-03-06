/**
 *
 * @project        Motion Detection in JS
 * @file           ImageCompare.js
 * @description    Core functionality.
 * @author         Benjamin Horn
 * @package        MotionDetector
 * @version        -
 *
 */

 var start;
 var started;
 var sound;

 var time = +new Date();
 var curTime;

 var delay;

 var logDisplayed = false;

 $(".btn-group > button.btn").on("click", function(){
     resetDelay();

     if (this.innerHTML.includes("min")) {
       delay = this.innerHTML.split(" min")[0] * 60 * 1000;
     } else {
       delay = this.innerHTML.split(" sec")[0] * 1000;
     }
     // for debugging:
     //delay = 4000;
     this.style.color = "red";
 });

 window.setInterval(function() {
   var elem = document.getElementById('log');
   elem.scrollTop = elem.scrollHeight;
 }, 1000);

function showLog() {
  if (!logDisplayed) {
    logDisplayed = true;
    $("#log").fadeIn(400);
    document.getElementById("log-show").innerHTML = "Hide Log"
  } else {
    logDisplayed = false;
    $("#log").fadeOut(400);
    document.getElementById("log-show").innerHTML = "Show Log"
  }
}


 function resetAlarm() {
   muteAll();
   $("#flash-button").slideUp();
   time = +new Date();
 }

 function resetDelay() {
   document.getElementById("15sec").style.color = "white";
   document.getElementById("30sec").style.color = "white";
   document.getElementById("1min").style.color = "white";
   document.getElementById("2min").style.color = "white";
   document.getElementById("5min").style.color = "white";
   document.getElementById("10min").style.color = "white";
   document.getElementById("15min").style.color = "white";
   document.getElementById("30min").style.color = "white";
 }

 function selectAudio(cur) {
   muteAll();
   sound = cur.innerHTML;
   document.getElementById("sound-dropdown").innerHTML = cur.innerHTML;
 }

 function muteAll() {
   document.getElementById("Analog").muted = true;
   document.getElementById("Ship").muted = true;
   document.getElementById("Rooster").muted = true;
 }

;(function(App) {

	"use strict";

	/*
	 * The core motion detector. Does all the work.
	 *
	 * @return <Object> The initalized object.
	 *
	 */
	App.Core = function() {

		var rendering = false;

		var width = 64;
		var height = 48;

		var webCam = null;
		var imageCompare = null;

		var currentImage = null;
		var oldImage = null;

		var topLeft = [Infinity,Infinity];
		var bottomRight = [0,0];

		var prev;
		var cur;

		var noMovementCount = 0;

		var raf = (function(){
			return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
			function( callback ){
				window.setTimeout(callback, 1000/60);
			};
		})();

		/*
		 * Initializes the object.
		 *
		 * @return void.
		 *
		 */
		function initialize() {
			imageCompare = new App.ImageCompare();
			webCam = new App.WebCamCapture(document.getElementById('webCamWindow'));

			rendering = true;

			main();
		}

		/*
		 * Compares to images and updates the position
		 * of the motion div.
		 *
		 * @return void.
		 *
		 */
		function render() {
			oldImage = currentImage;
			currentImage = webCam.captureImage(false);

			if(!oldImage || !currentImage) {
				return;
			}

			var vals = imageCompare.compare(currentImage, oldImage, width, height);

			topLeft[0] = vals.topLeft[0] * 10;
			topLeft[1] = vals.topLeft[1] * 10;

			bottomRight[0] = vals.bottomRight[0] * 10;
			bottomRight[1] = vals.bottomRight[1] * 10;
			//
			// document.getElementById('movement').style.top = topLeft[1] + 'px';
			// document.getElementById('movement').style.left = topLeft[0] + 'px';
			//
			// document.getElementById('movement').style.width = (bottomRight[0] - topLeft[0]) + 'px';
			// document.getElementById('movement').style.height = (bottomRight[1] - topLeft[1]) + 'px';


			cur = (bottomRight[0] - topLeft[0]) * (bottomRight[1] - topLeft[1]);

      curTime = +new Date();
      console.log("sensitivity: " + sensitivity);
      console.log("delay: " + delay)
			if (cur !== prev) {
        $("#movement-log").append("<p class=text>" + new Date() + " - Movement Detected</p>")
				console.log("He's awake")
        time = +new Date();
				noMovementCount = 0;
			} else {
        console.log(curTime - time)
        $("#movement-log").append("<p class=text>" + new Date() + " - Dormant</p>");
        if (curTime - time > delay) {
          document.getElementById(sound).muted = false;
          $("#flash-button").slideDown();
        }
				console.log("Asleep")
				noMovementCount++;
			}

			if (noMovementCount === 10) {
				console.log("Wake up!");
			}

			prev = cur;

			topLeft = [Infinity,Infinity];
			bottomRight = [0,0]

		}

		/*
		 * The main rendering loop.
		 *
		 * @return void.
		 *
		 */

		function main() {
			try{
				render();
			} catch(e) {
				console.log(e);
				return;
			}

			if(rendering == true) {
				raf(main.bind(this));
			}
		}

    // function playSound(filename){
    //     document.getElementById("sound").innerHTML='<audio autoplay="autoplay"><source src="' + filename + '.mp3" type="audio/mpeg" /><source src="' + filename + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3" /></audio>';
    //         }
		start = function() {

      if (!delay && sound) {
        alert("You must select a time!");
        return;
      } else if (!sound && delay) {
        alert("You must select an alarm sound!")
        return;
      } else if (!sound && !delay) {
        alert("You must select a time and alarm sound!")
        return;
      }

      document.getElementById("header-title").innerHTML = "Alarm is turned on!"
			$("#webCamWindow").slideDown(1000);
      $("#slider-div").fadeIn();
			// document.getElementById("stream").style.visibility = "visible";
			// document.getElementById("stream").style.display = "inline";
			initialize();
		}

	};
})(MotionDetector);
