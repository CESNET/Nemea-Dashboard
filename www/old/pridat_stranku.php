<!DOCTYPE html>

<html lang="cs">
<head>
    <meta charset="utf-8">
    <title>Mee Nee RS | Vytvořit stránku</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <!-- Bootstrap -->
    <link href="css/bootstrap.min.css" rel="stylesheet" media="screen">
    <link href="css/style.css" rel="stylesheet" media="screen">
        
        <!-- skripty -->
    <script src="http://code.jquery.com/jquery.js"></script>
    <script src="js/bootstrap.min.js"></script>
</head>

<body>
   <menu>
    <ul>
        <li><a href="#">Hlavni strana</a></li>
        <li><a href="#" class="active">Prehled stranek</a></li>
    </ul>
   </menu> 
   <div class="container">
    <h2>Vytvořit novou stránku</h2> 
    <form>
    	<fieldset>
    		<legend>Region #1</legend>
    		<label for="nazev">Název:</label><input type="text" placeholder="název" id="nazev">
    		<label for="url">URL adresa:</label><input type="text" placeholder="/sudy" id="url">
    		<textarea placeholder="sem napište obsah">
    		</textarea>
    	</fieldset>
    	<fieldset>
    		<legend>Kategorie</legend>
    		<select>
    			<option value="kat1">kategorie 1</option>
    		</select>
    	<input type="button" class="btn-submit" name="Potvrdit">
   </div>
   </div>



</body>
</html>
