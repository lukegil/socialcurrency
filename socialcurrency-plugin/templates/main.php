<?php




$html = <<<EOS

<div id="scrr-question">

EOS;
$html .= include dirname(__FILE__) . "screen-one.php";
$html .= include dirname(__FILE__) . "never-again.php";
$html .= include dirname(__FILE__) . "success-screen.php";

$html .= <<<EOS
</div>
EOS;
?>
