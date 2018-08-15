var gCanvas = null;
var gCtx = null;
var stype = 0;
var gUM = false;
var webkit = false;
var videoDiv = null;

function initCanvas(w, h) {
  gCanvas = document.getElementById("qr-canvas");
  gCanvas.style.width = w + "px";
  gCanvas.style.height = h + "px";
  gCanvas.width = w;
  gCanvas.height = h;
  gCtx = gCanvas.getContext("2d");
  gCtx.clearRect(0, 0, w, h);
}


function captureToCanvas() {
  if (stype !== 1)
    return;
  if (gUM) {
    try {
      gCtx.drawImage(videoDiv, 0, 0);
      try {
        qrcode.decode();
      }
      catch (e) {
        console.log(e);
        setTimeout(captureToCanvas, 500);
      }
    }
    catch (e) {
      console.log(e);
      setTimeout(captureToCanvas, 500);
    }
  }
}

function isCanvasSupported() {
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}


function load() {
  if (isCanvasSupported() && window.File && window.FileReader) {
    initCanvas(800, 600);
    qrcode.callback = function read(a) {
      var html = "<br>";
      if (a.indexOf("http://") === 0 || a.indexOf("https://") === 0)
        html += "<a target='_blank' href='" + a + "'>" + a + "</a><br>";
      html += "<b>" + a + "</b><br><br>";
      document.getElementById("result").innerHTML = html;
    };
    document.getElementById("mainbody").style.display = "inline";
    setwebcam();
  }
  else {
    document.getElementById("mainbody").style.display = "inline";
    document.getElementById("mainbody").innerHTML = '<p id="mp1">QR code scanner for HTML5 capable browsers</p><br>' +
      '<br><p id="mp2">sorry your browser is not supported</p><br><br>' +
      '<p id="mp1">try <a href="http://www.mozilla.com/firefox"><img src="firefox.png"/></a> or <a href="http://chrome.google.com"><img src="chrome_logo.gif"/></a> or <a href="http://www.opera.com"><img src="Opera-logo.png"/></a></p>';
  }
}

function setwebcam() {
  var options = true;
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    try {
      navigator.mediaDevices.enumerateDevices()
        .then(function (devices) {
          devices.forEach(function (device) {
            if (device.kind === 'videoinput') {
              if (device.label.toLowerCase().search("back") > -1)
                options = {'deviceId': {'exact': device.deviceId}, 'facingMode': 'environment'};
            }
            console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
          });
          setwebcam2(options);
        });
    }
    catch (e) {
      console.log(e);
    }
  }
  else {
    console.log("no navigator.mediaDevices.enumerateDevices");
    setwebcam2(options);
  }

}

function setwebcam2(options) {
  console.log('options：', options);
  document.getElementById("result").innerHTML = "- scanning -";
  if (stype === 1) {
    setTimeout(captureToCanvas, 500);
    return;
  }
  videoDiv = document.getElementById("videoDiv");


  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({video: options, audio: false}).then(function (stream) {
      success(stream);
    }).catch(function (error) {
      error(error)
    });
  }
  else if (navigator.getUserMedia) {
    webkit = true;
    navigator.getUserMedia({video: options, audio: false}, success, error);
  }
  else if (navigator.webkitGetUserMedia) {
    webkit = true;
    navigator.webkitGetUserMedia({video: options, audio: false}, success, error);
  }

  stype = 1;
  setTimeout(captureToCanvas, 500);
}

function success(stream) {
  videoDiv.srcObject = stream;
  videoDiv.play();
  gUM = true;
  setTimeout(captureToCanvas, 500);
}

function error(error) {
  gUM = false;
}