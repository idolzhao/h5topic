<?php
/*
 * ΢�Ź��ںź�̨���ȡappId��appSecret�����ڹ��ںź�̨=>��ȫ����=>IP�����������õ�ǰҳ���������IP������Ǹ��ؾ������轫ÿ̨�ӷ�����IP�������ϣ������ܻ�ȡtoken
 */
class Jssdk {
    // ���ںŵ�appId
    private $appId = 'wx6665e88319f88a18';
    // ���ںŵ�appSecret
    private $appSecret = '4fbff80ee7cc45d31a971a2b39a7ee38';
    
    // ��ȡǩ������Ϣ�����������ݿ���΢�ŷ���ӿ���
    public function getInfo() {
        // ��ȡ���¿���ticket
        $jsapiTicket = $this->getJsApiTicket ();
        // ע�� URL һ��Ҫ��̬��ȡ������ hardcode.
        $protocol = (! empty ( $_SERVER ['HTTPS'] ) && $_SERVER ['HTTPS'] !== 'off' || $_SERVER ['SERVER_PORT'] == 443) ? "https://" : "http://";
        // ��ȡ��ǰҳ���url
        // $url = "$protocol$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
        // ���������Ϊ�ӿڣ����޷�����ǰҳ�����·����Ϊ����url����Ҫ���ʽӿڵ�ǰ��ҳ��ͨ�� window.location.href ��ȡҳ��url������
        $url = $_POST ['url'] ? $_POST ['url'] : "$protocol$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
        
        $timestamp = time ();
        $nonceStr  = $this->createNonceStr ();
        
        // ���������˳��Ҫ���� key ֵ ASCII ����������
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
        //����ǽӿڣ��������� echo json_encode($signPackage);
        return $signPackage;
    }
    // ������ȡ����ַ���
    private function createNonceStr($length = 16) {
        $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        $str = "";
        for($i = 0; $i < $length; $i ++) {
            $str .= substr ( $chars, mt_rand ( 0, strlen ( $chars ) - 1 ), 1 );
        }
        return $str;
    }
    // ��ȡticket
    private function getJsApiTicket() {
        // jsapi_ticket Ӧ��ȫ�ִ洢����£����´�����д�뵽�ļ�����ʾ����ʵ��Ӧ�������ݿ���
        $data = json_decode ( $this->get_php_file ( "jsapi_ticket.php" ) );
        //��ȡû���ڵ�ticket�����������»�ȡ
        if ($data->expire_time < time ()) {
            // ��ȡ���¿���token��ticket��Ҫͨ��token��ȡ
            $accessToken = $this->getAccessToken ();
            // �������ҵ�������� URL ��ȡ ticket
            // $url = "https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=$accessToken";
            $url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=$accessToken";
            $res = json_decode ( $this->httpGet ( $url ) );
            $ticket = $res->ticket;
            if ($ticket) {
                //����Чʱ�����óɽ�����7000����
                $data->expire_time = time () + 7000;
                $data->jsapi_ticket = $ticket;
                $this->set_php_file ( "jsapi_ticket.php", json_encode ( $data ) );
            }
        } else {
            $ticket = $data->jsapi_ticket;
        }
        
        return $ticket;
    }
    // ��ȡtoken
    private function getAccessToken() {
        // access_token Ӧ��ȫ�ִ洢����£����´�����д�뵽�ļ�����ʾ����ʵ��Ӧ�������ݿ���
        $data = json_decode ( $this->get_php_file ( "access_token.php" ) );
        //��ȡû���ڵ�token�����������»�ȡ
        if ($data->expire_time < time ()) {
            // �������ҵ��������URL��ȡaccess_token
            // $url = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=$this->appId&corpsecret=$this->appSecret";
            $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$this->appId&secret=$this->appSecret";
            $res = json_decode ( $this->httpGet ( $url ) );
            $access_token = $res->access_token;
            if ($access_token) {
                //����Чʱ�����óɽ�����7000����
                $data->expire_time = time () + 7000;
                $data->access_token = $access_token;
                $this->set_php_file ( "access_token.php", json_encode ( $data ) );
            }
        } else {
            $access_token = $data->access_token;
        }
        return $access_token;
    }
    // curl���ʷ�������
    private function httpGet($url) {
        $curl = curl_init ();
        curl_setopt ( $curl, CURLOPT_RETURNTRANSFER, true );
        curl_setopt ( $curl, CURLOPT_TIMEOUT, 500 );
        // Ϊ��֤��������������΢�ŷ�����֮�����ݴ���İ�ȫ�ԣ�����΢�Žӿڲ���https��ʽ���ã�����ʹ������2�д����ssl��ȫУ�顣
        // ����ڲ�������д����ڴ˴���֤ʧ�ܣ��뵽 http://curl.haxx.se/ca/cacert.pem �����µ�֤���б��ļ���
        curl_setopt ( $curl, CURLOPT_SSL_VERIFYPEER, 1 );
        curl_setopt ( $curl, CURLOPT_SSL_VERIFYHOST, 2 );//CURLOPT_SSL_VERIFYHOST ����Ϊ 1 �Ǽ�������SSL֤�����Ƿ����һ��������(common name)��ע��������(Common Name)һ������������д��Ҫ����SSL֤������� (domain)��������(sub domain)�� ���ó� 2�����鹫�����Ƿ���ڣ������Ƿ����ṩ��������ƥ�䡣 �����������У����ֵӦ���� 2��Ĭ��ֵ��
        curl_setopt ( $curl, CURLOPT_URL, $url );
        
        $res = curl_exec ( $curl );
        curl_close ( $curl );
        
        return $res;
    }
    // ��ȡ�ļ�
    private function get_php_file($filename) {
        return trim ( substr ( file_get_contents ( $filename ), 15 ) );
    }
    // д���ļ�
    private function set_php_file($filename, $content) {
        $fp = fopen ( $filename, "w" );
        fwrite ( $fp, "<?php exit();?>" . $content );
        fclose ( $fp );
    }
}