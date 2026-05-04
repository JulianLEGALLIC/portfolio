<?php
    // Vous pouvez ici ajouter des fonctionnalités PHP, mais pour ce cas précis, on laisse le code HTML inchangé
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Société Lafleur</title>
    <link rel="stylesheet" href="stylesC.css">
</head>
<body>
    <div class="header">
        <h1>Société Lafleur</h1>
        <p>Fleurs d'ornement pour jardins</p>
    </div>
    <div class="main-content">
        <div class="menu">
            <ul>
                <li><a href="#">Accueil</a></li>
                <li><a href="contact.html">Nous Contacter</a></li>
                <li>Nos produits
                    <ul>
                        <li><a href="bulbes.html">Bulbes</a></li>
                        <li><a href="massifs.html">Plantes à massifs</a></li>
                        <li><a href="rosiers.html">Rosiers</a></li>
                    </ul>
                </li>
            </ul>
        </div>
        <div class="page">
            <form action="form01_traite.php" method="post">
                prénom :
                <input type="text" name="prenom" size="20">
            <br><br>
                nom :
                <input type="text" name="nom" size="20">
            <br><br>
                addresse-mail :
                <input type="text" name="admail" size="20">
            <br><br>
                message :
                <input type="text" name="msg" size="20">
            <br>
            <br>
            <br>
            <input type="submit" name="envoyer" value="Envoyer">
            <input type="reset" name="annuler" value="Annuler">
            </form>
        </div>
    </div>
    <div class="footer">
        <a href="#">Mentions légales</a>
    </div>
</body>
</html>
