var ws = require("nodejs-websocket");
console.log("开始建立连接...");
//当前在线人数
var onlineCount=0;

var conns = new Array();
var sendcount=function(obj){
	onlineCount.count=obj.length;// 推送用户数量
		for(var i=0; i<obj.length; i++){
			obj[i].sendText(JSON.stringify(onlineCount)); 
		}
	}
var server = ws.createServer(function(conn){
	// conn为接入的对象,放在一个组里
	conns.push(conn);
	conn.nickname = null;	// 初始化昵称
	
	// 当客户端触发ws.send,接受send的值
	conn.on("text", function (obj) {
		sobj = JSON.parse(obj);

		if(sobj.metype=="login"){
			onlineCount++;
			if (conn.nickname === null) {
				conn.nickname = sobj.username;
			}
			var uobj={username:conn.nickname,count:onlineCount,wstype:"count",action:"login"};
			broadcast(JSON.stringify(uobj));
		}else if(sobj.metype=="user"){
			sobj.wstype="users";
			var newboj = JSON.stringify(sobj)
			// 把接收到的信息，返回给所有客户端
			for(var i=0; i<conns.length; i++){
				conns[i].sendText(newboj); 
			}
		}	
	});
	conn.on("close", function (code, reason) {
        console.log("关闭连接");
		onlineCount--;
		var uobj={username:conn.nickname,count:onlineCount,wstype:"count",action:"loginout"};
		broadcast(JSON.stringify(uobj));
		
    });
    conn.on("error", function (code, reason) {
        console.log("异常关闭");
		/*onlineCount--;
		var uobj={username:conn.nickname,count:onlineCount,wstype:"count",action:"loginout"};
		broadcast(JSON.stringify(uobj));
		*/
    });
}).listen(5050);

function broadcast(str) {
	server.connections.forEach(function (connection) {
		connection.sendText(str)
	})
}

console.log("websocket 连接完成！");