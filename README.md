# Site vitrine R&A

Site statique (HTML/CSS/JS vanilla, sans build) pour R&A, société spécialisée
dans le dépannage de câbles chauffants (planchers chauffants) en PACA et
Rhône-Alpes.

## Structure

```
index.html   Toutes les sections (hero, à propos, services, équipe, contact)
style.css    Styles (tokens de couleurs en haut de fichier)
script.js    Nav, slider avant/après, formulaire, mosaïque du hero
asset/       Images et vidéo
```

## Lancer le site

Aucune dépendance, aucun build. Ouvrir `index.html` directement dans un
navigateur, ou servir le dossier avec n'importe quel serveur statique.

## Mosaïque du hero

La section `#hero` (là où se trouve le titre) affiche une mosaïque animée :
une grille de tuiles recompose un seul média plein cadre (photo ou vidéo),
qui bascule vers le média suivant toutes les 5 secondes via une vague de
tuiles décalées en diagonale.

Le code vit dans `script.js`, bloc `heroMosaic` :

- **`slides`** : liste ordonnée des médias affichés en boucle
  (`{ type: 'image', src: '...' }` ou `{ type: 'video' }`). Pour changer les
  photos/vidéos du hero, modifier ce tableau.
- **`TILE_SIZE`** (~110px) : taille cible d'une tuile ; le nombre de
  colonnes/lignes est recalculé à l'écran et au resize.
- **Images** : chaque tuile a deux calques (`front`/`back`) en
  `background-image`, positionnés en pourcentage pour reconstruire l'image
  complète, et crossfadent en CSS (`opacity` + `transition`).
- **Vidéo** : une seule balise `<video>` cachée (muette, en boucle) sert de
  source ; chaque tuile la dessine sur un `<canvas>` via
  `drawImage` à chaque frame (`requestAnimationFrame`), avec un léger
  dézoom (`VIDEO_ZOOM_OUT`, actuellement 0.9) pour ne pas trop cadrer serré.
- **Filtre visuel** : contraste/saturation/luminosité légèrement relevés en
  CSS sur les tuiles pour unifier le rendu entre les différentes sources.

## Images `asset/landscape`

Photos en 1024×1024 (`antennes.png`, `montagne.png`, `flanc_montagne.png`,
`cern.png`), référencées directement dans `slides` (`script.js`). Pour
changer une photo du hero, remplacer le fichier et/ou son chemin dans
`slides` — pas de traitement supplémentaire nécessaire à cette résolution.

### Résolution idéale pour la mosaïque

- **Photos** : au moins **1600–1920 px** sur le plus petit côté pour rester
  net en plein écran sur desktop, format libre (le recadrage `cover` gère
  tous les ratios).
- **Vidéo** : **1920×1080 (Full HD, 16:9)** est le meilleur compromis —
  assez net derrière l'overlay sombre et le texte, sans alourdir le
  chargement. Encoder en H.264, quelques secondes en boucle, débit
  ~5–8 Mbps (fichier de quelques Mo). Un 4K est inutile ici : la vidéo est
  découpée en petites tuiles et assombrie par l'overlay, le gain de netteté
  ne justifie pas le poids supplémentaire.
