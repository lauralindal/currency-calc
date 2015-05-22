<?php
   header('Content-type: application/json');
   header('Cache-Control: no-cache');

   $callback = isset($_GET['callback']) ? $_GET['callback'] : 'callback';
   $content = file_get_contents('data.json');

   echo "$callback($content);";
