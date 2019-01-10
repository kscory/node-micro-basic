'use strict';

const business = require("../mono/monolithic_purchases");
// cluster 적용
const cluster = require("cluster");

class purchases extends require("./server") {
    constructor() {
        super(
            "purchases",
            process.argv[2] ? Number(process.argv[2]) : 9030,
            ["POST/purchases", "GET/purchases"]
        );

        this.connectToDistributor("127.0.0.1", 9000, (data) => {
            console.log("Distributor Notification", data);
        });
    }

    onRead(socket, data) {
        console.log("onRead", socket.remoteAddress, socket.remotePort, data);
        business.onRequest(socket, data.method, data.uri, data.params, (s, packet) => {
            socket.write(JSON.stringify(packet) + '¶');
        });
    }
}

if(cluster.isMaster) {
    // 자식 프로세스 실행
    cluster.fork();

    // exit 이벤트 발생 시 새로운 자식 프로세스 실행
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    new purchases();
}