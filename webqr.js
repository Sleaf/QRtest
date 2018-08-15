var gCanvas = null;
var gCtx = null;
var stype = 0;
var gUM = false;
var webkit = false;
var videoDiv = null;
var loading = ['.', '..', '...'];//只是个表示在动的效果
var spanTime = 1000;//采样间隔（ms）

function initCanvas(width, height) {
  gCanvas = document.getElementById("qr-canvas");
  gCanvas.width = width;
  gCanvas.height = height;
  gCtx = gCanvas.getContext("2d");
  gCtx.clearRect(0, 0, width, height);
}


function captureToCanvas() {
  if (stype !== 1) return;
  //获取到设备
  if (gUM) {
    gCtx.drawImage(videoDiv, 0, 0);
    try {
      qrcode.decode();
    }
    catch (e) {
      //解析二维码错误
      document.getElementById("result").innerHTML = "scanning" + loading[Date.now() % 3];
    }
    setTimeout(captureToCanvas, spanTime);
  }
}

function isCanvasSupported() {
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

function setwebcam() {
  var options = true;
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    //获取可用镜头
    try {
      navigator.mediaDevices.enumerateDevices()
        .then(function (devices) {
          devices.forEach(function (device) {
            if (device.kind === 'videoinput') {
              console.log(device);
              if (device.label.toLowerCase().includes("back")) {
                options = {'deviceId': {'exact': device.deviceId}, 'facingMode': 'environment'};
                console.log(options);
              }
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
  document.getElementById("result").innerHTML = "scanning...";
  if (stype === 1) {
    setTimeout(captureToCanvas, spanTime);
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
  setTimeout(captureToCanvas, spanTime);
}

function success(stream) {
  videoDiv.srcObject = stream;
  videoDiv.play();
  gUM = true;
  setTimeout(captureToCanvas, spanTime);
}

function error(error) {
  gUM = false;
}

if (isCanvasSupported() && window.File && window.FileReader) {
  var length = window.innerWidth;
  initCanvas(length, length);
  //采集到数据后的回调
  qrcode.callback = function read(a) {
    var html = "<br>";
    if (a.indexOf("http://") === 0 || a.indexOf("https://") === 0)
      html += "<a target='_blank' href='" + a + "'>" + a + "</a><br>";
    html += "<b>" + a + "</b><br><br>";
    document.getElementById("result").innerHTML = html;
  };
  setwebcam();
}
else {
  alert('QR code scanner for HTML5 capable browsers, sorry your browser is not supported.');
}