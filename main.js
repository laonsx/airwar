
enchant();


var SCREEN_WIDTH    = 320;  
var SCREEN_HEIGHT   = 320;  

var PLAYER_WIDTH    = 32;   
var PLAYER_HEIGHT   = 32;   
var PLAYER_SPEED    = 8;    

var BULLET_WIDTH    = 8;    
var BULLET_HEIGHT   = 16;   
var BULLET_SPEED    = 12;   

var ENEMY_WIDTH     = 32;   
var ENEMY_HEIGHT    = 32;   
var ENEMY_SPEED     = 4;    
var ENEMY_CREATE_INTERVAL = 15; 

var PLAYER_IMAGE        = "http://www.shoeisha.co.jp/book/shuchu/enchantsample/chapter04/player.png";
var ENEMY_IMAGE         = "http://www.shoeisha.co.jp/book/shuchu/enchantsample/chapter04/enemy.png";
var BULLET_IMAGE        = "http://www.shoeisha.co.jp/book/shuchu/enchantsample/chapter04/bullet.png";

var ASSETS = [
    PLAYER_IMAGE, BULLET_IMAGE, ENEMY_IMAGE
];


var game        = null;
var player      = null;
var bulletList  = null;
var enemyList   = null;
var scoreLabel  = null;

var toolTipFactory = (function () {
    var enemyPool = [];  
	var bulletPool = [];
    return{
        createEnemy: function () {
            if(enemyPool.length == 0){           
                var enemy = new Enemy(); 
                return enemy;
            } else {  
				var enemy =	enemyPool.shift();
				enemy.destroy = false;
                return enemy
            }
        },

        recoverEnemy: function (enemy) {              
            return enemyPool.push(enemy);
        },
		
		createBullet: function () {
            if(bulletPool.length == 0){           
                var bullet = new Bullet(); 
                return bullet;
            } else {                            
                var bullet =	bulletPool.shift();
				bullet.destroy = false;
                return bullet
            }
        },

        recoverBullet: function (bullet) {              
            return bulletool.push(bullet);
        }
    }
})();

Array.prototype.erase = function(elm) {
    var index = this.indexOf(elm);
    this.splice(index, 1);
    return this;
};

var randfloat = function(min, max) {
    return Math.random()*(max-min)+min;
};


window.onload = function() {
    
    game = new Game(SCREEN_WIDTH, SCREEN_HEIGHT);
    
    game.preload(ASSETS);
    
    game.onload = function() {
        var scene = game.rootScene;
        scene.backgroundColor = "#8cc"; 
        
        var pad = new Pad();
        pad.moveTo(10, SCREEN_HEIGHT-100);
        pad._element.style.zIndex = 100;
        scene.addChild(pad);
        
        player = new Player();
        player.moveTo(SCREEN_WIDTH/2-PLAYER_WIDTH/2, SCREEN_HEIGHT-PLAYER_HEIGHT);
        scene.addChild(player);
        
        bulletList = [];
        
        enemyList = [];
        
        scoreLabel = new ScoreLabel(10, 10);
        scoreLabel.score = 0;
        scoreLabel._element.style.zIndex = 100;
        scene.addChild(scoreLabel);
        
        scene.onenterframe = function() {
            
            if (game.frame%30 < 20 && game.frame % 5 == 0) {
                var bullet = toolTipFactory.createBullet();
                bullet.moveTo(player.x+PLAYER_WIDTH/2-BULLET_WIDTH/2, player.y-20);
                bulletList.push(bullet);
                scene.addChild(bullet);
            }
            
            if (game.frame % ENEMY_CREATE_INTERVAL == 0) {
                var enemy = toolTipFactory.createEnemy();
                var x = randfloat(0, SCREEN_WIDTH-ENEMY_WIDTH);
                var y = -20;
                enemy.moveTo(x, y)
                enemyList.push(enemy);
                scene.addChild(enemy);
            }
            
            for (var i=0,len=enemyList.length; i<len; ++i) {
                var enemy = enemyList[i];
                if (enemy.intersect(player)) {
                    
                    var score = scoreLabel.score;
                    var msg   = scoreLabel.score;
                    alert(score + ',' + msg);
                    scene.onenterframe = null;
                }
            }
            
            for (var i=0,len=enemyList.length; i<len; ++i) {
                var enemy = enemyList[i];
                
                if (enemy.destroy === true) continue ;
                
                for (var j=0,len2=bulletList.length; j<len2; ++j) {
                    var bullet = bulletList[j];
                    
                    if (bullet.intersect(enemy) == true) {
                        enemy.destroy = true;
                        bullet.destroy = true;
                        
                        scoreLabel.score += 100;
                        break;
                    }
                }
            }
        };
    };
    
    game.start();
};


var Player = Class.create(Sprite, {
    initialize: function() {
        Sprite.call(this, PLAYER_WIDTH, PLAYER_HEIGHT);
        this.image = game.assets[PLAYER_IMAGE];
        this.frame = 0;
    },
    onenterframe: function() {
        var input = game.input;
        var vx = 0, vy = 0;
        
        if (input.left == true) {
            vx = -PLAYER_SPEED;
            this.frame = 1;
        }
        else if (input.right == true) {
            vx =  PLAYER_SPEED;
            this.frame = 2;
        }
        else {
            this.frame = 0;
        }
        
        if      (input.up    === true) vy = -PLAYER_SPEED;
        else if (input.down  === true) vy =  PLAYER_SPEED;
        
        if (vx !== 0 && vy !== 0) {
            var length = Math.sqrt(vx*vx + vy*vy);  
            vx /= length; vy /= length;             
            vx *= PLAYER_SPEED; vy *= PLAYER_SPEED; 
        }
        
        this.moveBy(vx, vy);
        
        var left    = 0;
        var right   = SCREEN_WIDTH-this.width;
        var top     = 0;
        var bottom  = SCREEN_HEIGHT-this.height;
        
        if      (this.x < left)     this.x = left;
        else if (this.x > right)    this.x = right;
        if      (this.y < top)      this.y = top;
        else if (this.y > bottom)   this.y = bottom;

    }
});


var Bullet = Class.create(Sprite, {
    
    initialize: function() {
        Sprite.call(this, BULLET_WIDTH, BULLET_HEIGHT);
        this.image = game.assets[BULLET_IMAGE];
        this.destroy = false;
    },
    
    onenterframe: function() {
        this.y -= BULLET_SPEED;
        
        if (this.y < -20 || this.destroy === true) {
            this.parentNode.removeChild(this);
            bulletList.erase(this);
			toolTipFactory.recoverBullet(this);
        }
    },
});


var Enemy = Class.create(Sprite, {
    
    initialize: function() {
        Sprite.call(this, ENEMY_WIDTH, ENEMY_HEIGHT);
        this.image = game.assets[ENEMY_IMAGE];
        this.destroy = false;
    },
    
    onenterframe: function() {
        
        this.y += ENEMY_SPEED;
        
        if (this.y > SCREEN_HEIGHT || this.destroy === true) {
            this.parentNode.removeChild(this);
            enemyList.erase(this);
			toolTipFactory.recoverEnemy(this);
        }
    },
});