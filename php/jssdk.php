<?php
/*
 * 微信公众号后台里获取appId和appSecret，并在公众号后台=>安全中心=>IP白名单中设置当前页面服务器的IP，如果是负载均衡则需将每台子服务器IP都设置上，否则不能获取token
 */
class Jssdk {
     // 公众号的appId
    private $appId = 'wx59c8a7c065ad68a8';
    // 公众号的appSecret
    private $appSecret = '553a924695fda79e8d321ff0c83eb927';
    
    // 获取签名等信息，本方法内容可做微信分享接口用
    public function getInfo() {
        // 获取最新可用ticket
        $jsapiTicket = $this->getJsApiTicket ();
        // 注意 URL 一定要动态获取，不能 hardcode.
        $protocol = (! empty ( $_SERVER ['HTTPS'] ) && $_SERVER ['HTTPS'] !== 'off' || $_SERVER ['SERVER_PORT'] == 443) ? "https://" : "http://";
        // 获取当前页面的url
        // $url = "$protocol$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
        // 如果方法作为接口，则无法将当前页面访问路径作为分享url，需要访问接口的前端页面通过 window.location.href 获取页面url传过来
        $url = $_POST ['url'] ? $_POST ['url'] : "$protocol$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
        
        $timestamp = time ();
        $nonceStr  = $this->createNonceStr ();
        
        // 这里参数的顺序要按照 key 值 ASCII 码升序排序
        $string = "jsapi_ticket=$jsapiTicket&noncestr=$nonceStr&timestamp=$timestamp&url=$url";
        
        $signature = sha1 ( $string );
        
        $signPackage = array (
                "appId"     => $this->appId,
                "nonceStr"  => $nonceStr,
                "timestamp" => $timestamp,
                "url"       => $url,
                "signature" => $signature,
                "rawString" => $string 
        );
        //如果是接口，这里则是 echo json_encode($signPackage);
        return $signPackage;
    }
    // 创建获取随机字符串
    private function createNonceStr($length = 16) {
        $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        $str = "";
        for($i = 0; $i < $length; $i ++) {
            $str .= substr ( $chars, mt_rand ( 0, strlen ( $chars ) - 1 ), 1 );
        }
        return $str;
    }
    // 获取ticket
    private function getJsApiTicket() {
        // jsapi_ticket 应该全局存储与更新，以下代码以写入到文件中做示例，实际应存在数据库中
        $data = json_decode ( $this->get_php_file ( "jsapi_ticket.php" ) );
        //获取没过期的ticket，过期则重新获取
        if ($data->expire_time < time ()) {
            // 获取最新可用token，ticket需要通过token获取
            $accessToken = $this->getAccessToken ();
            // 如果是企业号用以下 URL 获取 ticket
            // $url = "https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=$accessToken";
            $url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=$accessToken";
            $res = json_decode ( $this->httpGet ( $url ) );
            $ticket = $res->ticket;
            if ($ticket) {
                //将有效时间设置成将来的7000秒内
                $data->expire_time = time () + 7000;
                $data->jsapi_ticket = $ticket;
                $this->set_php_file ( "jsapi_ticket.php", json_encode ( $data ) );
            }
        } else {
            $ticket = $data->jsapi_ticket;
        }
        
        return $ticket;
    }
    // 获取token
    private function getAccessToken() {
        // access_token 应该全局存储与更新，以下代码以写入到文件中做示例，实际应存在数据库中
        $data = json_decode ( $this->get_php_file ( "access_token.php" ) );
        //获取没过期的token，过期则重新获取
        if ($data->expire_time < time ()) {
            // 如果是企业号用以下URL获取access_token
            // $url = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=$this->appId&corpsecret=$this->appSecret";
            $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$this->appId&secret=$this->appSecret";
            $res = json_decode ( $this->httpGet ( $url ) );
            $access_token = $res->access_token;
            if ($access_token) {
                //将有效时间设置成将来的7000秒内
                $data->expire_time = time () + 7000;
                $data->access_token = $access_token;
                $this->set_php_file ( "access_token.php", json_encode ( $data ) );
            }
        } else {
            $access_token = $data->access_token;
        }
        return $access_token;
    }
    // curl访问返回数据
    private function httpGet($url) {
        $curl = curl_init ();
        curl_setopt ( $curl, CURLOPT_RETURNTRANSFER, true );
        curl_setopt ( $curl, CURLOPT_TIMEOUT, 500 );
        // 为保证第三方服务器与微信服务器之间数据传输的安全性，所有微信接口采用https方式调用，必须使用下面2行代码打开ssl安全校验。
        // 如果在部署过程中代码在此处验证失败，请到 http://curl.haxx.se/ca/cacert.pem 下载新的证书判别文件。
        curl_setopt ( $curl, CURLOPT_SSL_VERIFYPEER, 1 );
        curl_setopt ( $curl, CURLOPT_SSL_VERIFYHOST, 2 );//CURLOPT_SSL_VERIFYHOST 设置为 1 是检查服务器SSL证书中是否存在一个公用名(common name)。注：公用名(Common Name)一般来讲就是填写将要申请SSL证书的域名 (domain)或子域名(sub domain)。 设置成 2，会检查公用名是否存在，并且是否与提供的主机名匹配。 在生产环境中，这个值应该是 2（默认值）
        curl_setopt ( $curl, CURLOPT_URL, $url );
        
        $res = curl_exec ( $curl );
        curl_close ( $curl );
        
        return $res;
    }
    // 读取文件
    private function get_php_file($filename) {
        return trim ( substr ( file_get_contents ( $filename ), 15 ) );
    }
    // 写入文件
    private function set_php_file($filename, $content) {
        $fp = fopen ( $filename, "w" );
        fwrite ( $fp, "<?php exit();?>" . $content );
        fclose ( $fp );
    }
}
