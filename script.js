// Table des bases salariales par échelle et échelon
const base = [
  [275, 300, 326, 351, 377, 402, 428, 456, 484, 512, 0, 0, 0, 564], // Echelle 10
  [336, 369, 403, 436, 472, 509, 542, 574, 606, 639, 675, 690, 704, 704], // Echelle 11
  [704, 746, 779, 812, 840, 870, 900, 930, 0, 0, 0, 0, 0, 0] // Echelle 12
];

// Fonction pour augmenter un champ
function increase(id, max) {
  const input = document.getElementById(id);
  if (parseInt(input.value) < max) {
    input.value = parseInt(input.value) + 1;
  }
}

// Fonction pour diminuer un champ
function decrease(id, min) {
  const input = document.getElementById(id);
  if (parseInt(input.value) > min) {
    input.value = parseInt(input.value) - 1;
  }
}

// Écouteur du bouton "Calculer"
document.getElementById('btnCalculer').addEventListener('click', function() {
  const echelle = parseInt(document.getElementById('echelle').value); // 10, 11 ou 12
  const echelon = document.getElementById('fonction').selectedIndex + 1; // De 1 à 22 (pour les fonctions listées)

  const emolumentsInputs = document.querySelectorAll('#emoluments tbody input[type="number"]');

  if (echelle >= 10 && echelle <= 12) {
    const rowIndex = echelle - 10; // 10 -> 0, 11 -> 1, 12 -> 2
    const echelonIndex = echelon - 1;

    let baseValue = base[rowIndex][echelonIndex];
    if (!baseValue) baseValue = 0;

    // Formule de calcul du traitement de base
    let traitementBase = (((baseValue - 150) * 50.92 + 9885 + 3981) / 12);

    // Met à jour le champ "Trait. de base"
    emolumentsInputs[0].value = traitementBase.toFixed(2);
  }

  // Tu peux ajouter ici les calculs pour :
  // - Ind. Logement
  // - Ind. Familiale
  // - Ind. Résidence
  // etc... comme ton Kotlin le fait.

});