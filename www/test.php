<?php

$hash = "$2y$10$5Zmdm3n8F37EIHa1vgVoWuQjV5Mu43U3C2ijNFgoD9HKyOBJnEFci";
$email = "a@a.cz";

$options = [
    'cost' => 12,
];

$postdata = file_get_contents("php://input");
$request = json_decode($postdata);
$request->password_hash = password_hash($request->password, PASSWORD_BCRYPT, $options);

if (password_verify($request->password, $hash) && $request->email == $email) {
	$request->success = true;
}
else
	$request->success = false;

print_r(json_encode($request));

?>
