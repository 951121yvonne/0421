// 變數設定
let capture;
let mode = "1"; // 預設模式
let data = [];  // 儲存追蹤到的顏色資料
let noiseTexture; // 材質圖

const density = 'Ñ@#W$9876543210?!abc;:+=-,._ ';
const txt = "一二三四五田雷電龕龘";

function preload() {
  // 如果你有準備材質圖，可以在這裡讀取
  // noiseTexture = loadImage('noise.jpg');
}

function setup() {
  createCanvas(640, 480);
  
  // 1. 設定攝影機
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.id("myVideo");
  capture.hide(); // 隱藏原始 HTML 影片

  // 2. 載入 Tracking.js (透過程式動態加入)
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/tracking.js/1.1.3/tracking-min.js";
  document.head.appendChild(s);

  // 待 Script 載入後啟動顏色追蹤
  s.onload = function() {
    const colors = new tracking.ColorTracker(['yellow', 'magenta', 'cyan']);
    tracking.track("#myVideo", colors);
    colors.on('track', function(event) {
      data = event.data;
    });
  };
}

function draw() {
  background(0);
  
  // 計算間隔大小：隨滑鼠 X 軸移動 (5 到 40 之間)
  let span = map(mouseX, 0, width, 10, 40, true);
  
  // 3. 修正攝影機左右相反問題
  push();
  translate(width, 0);
  scale(-1, 1);
  
  // 處理像素
  capture.loadPixels();
  
  for (let x = 0; x < capture.width; x += span) {
    for (let y = 0; y < capture.height; y += span) {
      // 取得當前像素顏色
      let pixel = capture.get(x, y);
      let r = pixel[0];
      let g = pixel[1];
      let b = pixel[2];
      let bk = (r + g + b) / 3; // 取得亮度
      
      fill(pixel);
      noStroke();

      // 4. 根據 mode 產生不同效果
      if (mode == "1") {
        // 基本方塊 (間隔 0.9 產生黑縫隙)
        rect(x, y, span * 0.9);
      } 
      else if (mode == "2") {
        // 亮度影響方塊大小
        let w = map(bk, 0, 255, 2, span);
        ellipse(x + span/2, y + span/2, w);
      } 
      else if (mode == "3") {
        // 文字雲模式
        let bkId = int(map(bk, 0, 255, txt.length - 1, 0));
        textSize(span);
        textAlign(CENTER, CENTER);
        text(txt[bkId], x + span/2, y + span/2);
      }
      else if (mode == "4") {
        // ASCII 字元模式
        let bkId = int(map(bk, 0, 255, density.length - 1, 0));
        fill(255); // ASCII 通常用白色呈現
        textSize(span);
        text(density[bkId], x, y);
      }
    }
  }
  
  // 5. 繪製 Tracking 顏色框 (如果偵測到特定顏色)
  if (data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      noFill();
      stroke(data[i].color);
      strokeWeight(4);
      rect(data[i].x, data[i].y, data[i].width, data[i].height);
    }
  }
  pop();

  // 6. 加入材質效果 (Noise)
  if (noiseTexture) {
    push();
    blendMode(MULTIPLY);
    image(noiseTexture, 0, 0, width, height);
    pop();
  }
}

// 按鍵切換模式
function keyPressed() {
  if (key == '1' || key == '2' || key == '3' || key == '4') {
    mode = key;
  }
}