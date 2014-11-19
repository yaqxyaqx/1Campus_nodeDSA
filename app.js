var nodexml = require('nodexml');
var request = require('request');
module.exports.open = function (accessPoint, token) {
    if (!!!accessPoint) {
        throw "accessPoint is empty";
    }
    if (!!!token) {
        throw "token is empty";
    }

    // 取得dsns
    var _accessPoint = accessPoint || '';
    var dsnsName = '';
    if (_accessPoint.indexOf("://") < 0) {
        var index = _accessPoint.indexOf("/");
        if (index > 0) {
            dsnsName = _accessPoint.substring(0, index);
        }
        else {
            dsnsName = _accessPoint;
        }
    }
    else {
        if (_accessPoint.substring(0, 17) == 'http://1know.net/') dsnsName = '1know';
    }

    // 1know 不處理
    // 非1know 用dsns
    if (dsnsName == '1know') {
        var result = {
            send: function (req) {
                req.service = req.service || '';
                req.body = req.body || {};
                req.result = req.result ||
                function (resp, errorInfo, XMLHttpRequest) {// errorInfo=null||{'loginError': null,'dsaError': null,'networkError': null,'ajaxException': null}
                };

                var contents = [];
                for (key in req.body) {
                    contents.push(key + ':' + req.body[key]);
                }
                request.get({
                    url: "http://dsns.1campus.net/1know/sakura/" + req.service + "?stt=PassportAccessToken&AccessToken=" + token
                        +(contents.length ? '&parser=spliter&content=' + contents.join('&') : ''),
                    rejectUnauthorized: false
                },
                function (error, response, data) {
                    if (error) {
                        req.result(null, error, null);
                    }
                    else {
                        var resp = nodexml.xml2obj(data);
                        if (resp.Body) {
                            req.result(resp.Body || {}, null, response, resp);
                        }
                        else {
                            //Service Faild
                            req.result(null, error, response, resp);
                        }
                    }
                });
            }
        };
        return result;
    } else {
        return require('nodedsa').open(accessPoint, token);
    }
};