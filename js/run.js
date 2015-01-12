(function(){
    // for apple touchmove window
    document.addEventListener("touchmove",function(e){
        e.preventDefault();  
    })
    window.requestAnimationFrame = (function(){
        return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element){
          window.setTimeout(callback, 1000 / 60);
        };
      })();
    imgUrl = "http://fedev.baidu.com/~chenjinya/webgame/tucao/img/bear.png";
    lineLink = "http://fedev.baidu.com/~chenjinya/webgame/tucao/index.html";
    descContent = '吐槽';
    shareTitle = '吐槽贴';
    appid = '';
    var Game = function(){
        this.constuctor();
        //this.eraseDone();
    };
    Game.prototype={
        x:0,
        y:0,
        timeLimit:300,
        caoX:0,
        caoY:0,
        caoW:50,
        caoH:50,
        location:[],
        restTime:0,
        runTime:0,
        keepTime:10,
        startFlag:false,
        runIn:0,
        piuStack:[],
        imageArray:[
            "img/baozou/bao1.png",
            "img/baozou/bao1.png",
            "img/baozou/bao2.png",
            "img/baozou/bao3.png",
            "img/baozou/bao4.png",
            "img/baozou/bao5.png",
            "img/baozou/bao6.png"
        ],
        imageArrayIndex:0,
        imageStack:[],
        imageStackIndex:0,
        tuH:50,
        tuW:50,
        constuctor:function(){


            this.stage = $("#gameStage");
            this.timeCounter = $("#leftCounter");
            this.rightCounter = $("#rightCounter")
            this.dialog = $("#dialog");
            this.context = this.stage[0].getContext("2d");
            this.init();
        },
        init:function(){

            this.fullWindow();
            this.bindEvent();

            this.initImage();
        },
        fullWindow:function(){
            this.windowWidth = $(document).width();
            this.windowHeight = $(window).height();
            $("#container").width(this.windowWidth).height(this.windowHeight);
            //不能用.width.height，否则比例拉伸
            this.stage[0].width = this.windowWidth;
            this.stage[0].height = this.windowHeight;

           
        },
        bindEvent:function(){
            var self = this;
            this.stage.on("touchstart",function(e){
                //console.warn("touch start")
                var t = e.touches[0];
                //console.log(t.pageX, t.pageY);
                //console.log(self.runIntoCheck(t.pageX, t.pageY))
                if(self.runIntoCheck(t.pageX,t.pageY)){
                   if(self.startFlag) self.runIn ++;

                    self.piuStack.push({x: t.pageX,y: t.pageY});
                    self.rightCounter.html( "吐槽:"+self.runIn);
                    self.drawPiu(t.pageX,t.pageY)
                }
                self.piuTip();
            }).on("touchmove",function(e){
                var target = e.touches[0];
                self.drawEraserLine(self.x,self.y,target.pageX,target .pageY)
                //self.drawEraserPointer(target .pageX,target .pageY)
                self.x = target.pageX;
                self.y = target.pageY;
                self.restTime =1;


            }).on("touchend",function(e){
                var target = e;
                self.x = target.pageX;
                self.y = target.pageY;
                self.restTime = 0 ;
                //console.warn(e)

            });
            $("#container").on("click","#startGame",function(){

                    self.start();
                    $("#info").hide();
                });
           /* $("#rightCounter").on("click","#caoBtn",function(){

                self.start();
                $("#info").hide();
            });*/
            this.dialog.on("click","#restartGame",function(){
                self.start();
                self.dialog.hide();
            }).on("click","#shareGame",function(){
                    shareTimeline()
                })

        },
        initDraw:function(){


            this.drawBackgournd();
            this.drawPius();

            //this.drawTu();
            this.randomCao();


        },
        drawLoading:function(){
            var context = this.context;
           // context.font="16px Georgia";
            context.fillStyle = "rbg(0,0,0)";
           // context.fillText("加载中...",this.windowWidth/2-50,this.windowHeight/2)

            context.drawImage(this.tuImage,this.windowWidth/2-60,10)
            context.drawImage(this.caoImage,this.windowWidth/2-15,10,50,50)
        },
        loadDone:function(){
            this.timeCounter.html("计时:"+this.timeLimit/10);
            clearInterval(this.loadingInterval);

            this.drawLoading();
            this.infoDialog();
        },

        initImage:function(){
            var self = this;
            this.loadingIndex = 0
            this.loadingInterval = setInterval(function(){
                self.timeCounter.append("么");
                self.loadingIndex ++;
                if(self.loadingIndex > 10){
                    self.timeCounter.html("网速太慢啦！骚等哦!")
                    clearInterval(self.loadingIndex)
                }
            },500);

            this.loadImg("img/bear/front.png",function(image){
                self.tuImage = image;
                self.loadImg("img/piu.gif",function(image){
                    self.piuImage = image;
                    if (self.imageStack.length ==0 ){
                        self.loadImg(self.imageArray[0],function(img){
                            self.imageStack.push(img);
                            self.imageStackIndex=0;


                        });

                        for(var i =1; i< self.imageArray.length; i++){
                            self.loadImg(self.imageArray[i],function(img){
                                self.imageStack.push(img);

                            });
                        }

                    }
                    self.loadImg("img/cao.png",function(image){
                        self.caoImage = image;
                        self.loadDone();



                    })

                });


            });

        },

        drawCao:function(x,y){
            var context = this.context;
            //context.rect(this.caoX,this.caoY,this.caoW,this.caoH)
           // context.fillStyle = "rgb(34,78,200)";//填充背景色
           // context.fillRect( x,y,this.caoW,this.caoH);
            context.drawImage(this.caoImage, x, y,this.caoW, this.caoH);

        },
        randomCao:function(){
            console.log(this.tuH)
            //this.location = [0,0, this.windowWidth,this.windowHeight - this.caoH  ];

            var seed = [ Math.floor(Math.random()* (this.windowWidth-this.caoW)) , Math.floor( Math.random() * (this.windowHeight - this.tuH-10  )) ];
            console.log("seed:",this.tuW,this.tuH)
            this.caoX = seed[0];
            this.caoY = seed[1];
            this.drawCao(seed[0],seed[1]);
        },
        drawTu:function(){
           var image = this.tuImage;
            var scale = image.width/image.height;
            image.width =this.windowWidth/3;
            image.height =image.width/scale;
            var self =this;
            var context = this.context;
            var imglocatX = (self.windowWidth-image.width)/2;
            var imglocatY = self.windowHeight - image.height;;
            //console.log(self.windowWidth,imglocatX,image.width)
            //self.eraserRange=[imglocatX,imglocatY,image.width,image.height];
            //console.log(self.er)
            // console.log(self.eraserRange)
            this.tuH = image.height;
            this.tuW = image.width;
            context.drawImage(image, imglocatX, imglocatY,image.width, image.height);



        },
        drawPius:function(){
            for ( var i =0; i <this.piuStack.length; i++){
                this.drawPiu(this.piuStack[i].x,this.piuStack[i].y);
                console.log(this.piuStack.length)
            }
            console.log(this.piuStack.length)

        },
        draw:function(){

            this.initDraw();

        },
        loadImg:function(src,callback){
            var image = new Image();
            image.src = src;
            image.onload = function() {

                callback(image);
            }
        },
        drawBackgournd:function(){
            var context = this.context;
            context.fillStyle = "rgb(255,255,255)";

            context.fillRect( 0, 0,this.windowWidth, this.windowHeight);
            context.drawImage(this.imageStack[this.imageStackIndex],this.windowWidth/2 -100,this.windowHeight /2 -100);
            this.imageStackIndex++;
            if(this.imageStackIndex >= this.imageStack.length){
                this.imageStackIndex =0;
            }
        },
        drawPiu:function(x,y){
            var image = this.piuImage;
            var scale = image.width/image.height;
            image.width =this.windowWidth/3;
            image.height =image.width/scale;
            var self =this;
            var context = this.context;

            context.drawImage(image, x - image.width/2, y - image.height/2,image.width, image.height);
        },

        runIntoCheck:function(x,y){
           // console.log(x,x > this.caoX,this.caoX+this.caoW,this.caoY,this.caoH+this.caoH)
            if(x> this.caoX && x < this.caoX+ this.caoW && y > this.caoY && y < this.caoY + this.caoH ){
                return true;
            }
            return false;
        },
        start:function(){
            this.startFlag = true;
            this.runTime =0;
            this.restTime=0;
            this.initDraw();
           // this.animate()
            this.rightCounter.html("计数:0");
            this.timeCounterGo();

        },

        timeCounterGo:function(){
            var self = this;

            this.timeInterval = setInterval(function(){
                self.runTime++;
                self.timeCounter.html("计时:"+(30-self.runTime/10).toFixed(1));
                if(self.startFlag && !(self.runTime % self.keepTime) ){

                    self.draw()
                    if(self.runTime > 200){
                        self.keepTime = 5;
                    }else if(self.runTime > 100){
                        self.keepTime = 8;
                    }
                }
                if(self.startFlag && !(self.runTime % 10) ){

                    self.piuStack.pop()
                    //self.keepTime -=0.5;
                }


                if( self.runTime >= self.timeLimit){
                    self.done();

                }

            },100);
        },

       done:function(num){
            //console.warn("it;s clear")
            //this.context.closePath();
            self.startFlag = false;

            clearInterval(this.timeInterval);

            var html = ' <div><p>吐槽'+this.runIn+'了个贴吧熊</p>'+'</div>'+
                '<div class="btn_wrapper"> <div id="shareGame" class="btn">右上角分享</div>'+
                '<div id="restartGame" class="btn">重新开始</div><p><a class="contact" href="http://tieba.baidu.com?fr=washbear" >百度贴吧，为兴趣而生</a></p>' +
                '<p><a class="contact" href="http://www.chenjinya.cn" >about</a></div>';
            if (this.eraseCount == 0){
                html = ' <div><p>真遗憾</p><p>你没有吐槽技能</p></div>'+
                    '<div class="btn_wrapper"> <div id="shareGame" class="btn">右上角分享</div>'+
                    '<div id="restartGame" class="btn">重新开始</div><p ><a class="contact" href="http://tieba.baidu.com?fr=washbear" >百度贴吧，为兴趣而生</a></p>' +
                    '<p><a class="contact" href="http://www.chenjinya.cn" >about</a></p></div>';
            }

            shareTitle = '我成功吐槽了'+this.runIn+'个贴吧熊'
            this.startFlag = false;
            this.showDialog(html);
        },
        piuTip:function(){
           var context = this.context;
            context.fillStyle="#333"
            context.font ="40px Arial";
            var seed = [ Math.floor(Math.random()* (this.windowWidth-100)) , Math.floor( Math.random() * (this.windowHeight - 100  )) ];

            context.fontcolor = "#333";
            var textArray = ["呸!!","噗!!"]
            context.fillText(textArray[Math.floor(seed[0])%2],seed[0],seed[1]);
        },
        infoDialog:function(){
           /* var html = ' <div><p>吐槽贴吧熊</p><p>30秒看你能吐槽几个？</p></div>'+
                '<div class="btn_wrapper"> <div id="startGame" class="btn">开始</div><div id="shareGame" class="btn">右上角分享</div><p><a class="contact" href="http://tieba.baidu.com?fr=washbear" >百度贴吧，为兴趣而生</a></p>'+
                '</div>';
            this.showDialog(html);
            this.dialog.addClass("white_b")*/
            var html =  '<div id="info" class="info">'+
                '  <div><p>游戏中,点击”槽“</p><p>吐槽贴吧熊</p><p>30秒看你能吐槽几个？</p></div>'+
            ' <div class="btn_wrapper"> <div id="startGame" class="btn">开始</div><div id="shareGame" class="btn">右上角分享</div><p><a class="contact" href="http://tieba.baidu.com?fr=washbear" >百度贴吧，为兴趣而生</a></p>'+
            '  </div>'+
            ' </div>';
            console.log(1)
            $("#container").append(html);
        },
        showDialog:function(html){
            var html =' <div class="dialog_container">'+html+
            '</div>';
            this.dialog.html(html);

            this.dialog.show();
        },
        animate:function(){
            var self = this;
            requestAnimationFrame(function(){
                self.animate()
                //console.log(3)
            });
            this.draw();


        }
        


    };

    window.Game =new Game();
})();
//=============weixin
    