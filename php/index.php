<?php
/*
 * 前端页面，这里是直接包含了获取签名的页面，实际可将获取签名页面写成接口，前端通过ajax获取
*/
require_once "jssdk.php";
$jssdk = new Jssdk();
$info = $jssdk->getInfo();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body>


<hr/>
appId:  <?php echo $info["appId"];?>  <br/>
timestamp: <?php echo $info["timestamp"];?>  <br/>
nonceStr: <?php echo $info["nonceStr"];?> <br/>
signature: <?php echo $info["signature"];?> <br/>
</body>
</html>