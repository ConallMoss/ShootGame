//var mongojs = require("mongojs");
var db = null //mongojs('localhost:27017/myGame', ['account', 'progress']);

//db.account.insert({username:"b",password:"bb"});

require('./Entity');

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
})
app.use('/client', express.static(__dirname + '/client'));
serv.listen(process.env.PORT || 2000);
console.log("Sever Started");

const cors = require('cors');
//const { pathToFileURL } = require('url');
app.use(cors());

var SOCKET_LIST = {};
var PLAYER_LIST = {};


Player.onDisconnect = function(socket){
    delete Player.list[socket.id];
    removePack.player.push(socket.id);
}

var USERS = {
    //username:password
    "bob":"asd",
    "bob2":"hjk"
}

var isValidPassword = function(data,cb){
    return cb(true)
    db.account.find({username:data.username, 
    password:data.password}, function(err,res){
        if(res.length > 0){
            cb(true);
        }else{
            cb(false)
        }
    })
};

var isUsernameTaken = function(data,cb){
    return cb(false)
    db.account.find({username:data.username}, function(err,res){
            if(res.length > 0){
                cb(true);
            }else{
                cb(false)
            }
        })
}

var addUser = function(data,cb){
    return cb()
    db.account.insert({username:data.username, 
        password:data.password}, function(err){
            cb();
        });
}

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    socket.on('signIn', function(data){
        isValidPassword(data, function(res){
            if(res){
                Player.onConnect(socket,data.username);
                socket.emit('signInResponse',{success:true});
            } else {
                socket.emit('signInResponse',{success:false});
            }
        })
    })

    socket.on('signUp', function(data){
        isUsernameTaken(data, function(res){
            if(res){
                socket.emit('signUpResponse',{success:false});
            } else {
                addUser(data, function(){
                    socket.emit('signUpResponse',{success:true});
                })
            }
        })
    })

    

    


    console.log('socket connection')

    socket.on('disconnect', function(){
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    })

    

var DEBUG = true

    socket.on('evalServer', function(data){
        if(!DEBUG)
            return;
        var res = eval(data);
        socket.emit('evalAnswer',res)

        
    })
    
});




setInterval(function(){
    var packs = Entity.getFrameUpdateData();

    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('init', packs.initPack);
        socket.emit('update', packs.updatePack);
        socket.emit('remove',packs.removePack);
    }
    
    
    
}, 1000/25)


