let port = '9999',
    ip = '10.100.31.236';
let http = require('http'),
    net = require('net'),
    url = require('url');
let dom = require('./utils/dom');

/**
 * http请求，走普通的代理方式即可
 * @param cReq
 * @param cRes
 */
function request(cReq, cRes) {
    let u = url.parse(cReq.url);
    console.log(u.href, cReq.method);
    let options = {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.path,
        method: cReq.method,
        headers: cReq.headers
    };

    let pReq = http.request(options, function (pRes) {
        if (u.href.indexOf('.html') > -1) {
            let html = '';
            pRes.setEncoding('utf8');
            pRes
                .on('data', (chunk) => {
                    html += chunk
                })
                .on('end', () => {
                    html = dom.parse(html);
                    cRes.writeHead(pRes.statusCode, pRes.headers);
                    cRes.write(html);
                    cRes.end();
                });
        } else {
            cRes.writeHead(pRes.statusCode, pRes.headers);
            pRes.pipe(cRes);
        }
    }).on('error', function (e) {
        cRes.end();
    });

    cReq.pipe(pReq);
}

/**
 * https请求，走隧道代理的方式，对后续请求数据进行盲转发（本身数据是加密的）
 * @param cReq
 * @param cSock
 */
function connect(cReq, cSock) {
    let u = url.parse('http://' + cReq.url);

    let pSock = net.connect(u.port, u.hostname, function () {
        cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        pSock.pipe(cSock);
    }).on('error', function (e) {
        cSock.end();
    });

    cSock.pipe(pSock);
}

console.info('Listen on ' + ip + ':' + port);
http
    .createServer()
    .on('request', request)
    .on('connect', connect)
    .listen(port, ip);