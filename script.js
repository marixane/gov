const base = [
  [275, 300, 326, 351, 377, 402, 428, 456, 484, 512, 0, 0, 0, 564],
  [336, 369, 403, 436, 472, 509, 542, 574, 606, 639, 675, 690, 704, 704],
  [704, 746, 779, 812, 840, 870, 900, 930, 0, 0, 0, 0, 0, 0]
];

function increase(id, max) {
  const input = document.getElementById(id);
  if (parseInt(input.value) < max) {
    input.value = parseInt(input.value) + 1;
  }
}

function decrease(id, min) {
  const input = document.getElementById(id);
  if (parseInt(input.value) > min) {
    input.value = parseInt(input.value) - 1;
  }
}

document.getElementById('btnCalculer').addEventListener('click', function() {
  const echelle = parseInt(document.getElementById('echelle').value);
  const echelon = document.getElementById('fonction').selectedIndex + 1;
  const nbEnf = parseInt(document.getElementById('nbEnf').value);
  const zone = document.getElementById('zone').value;
  const marie = document.getElementById('marie').checked;

  const emolumentsInputs = document.querySelectorAll('#emoluments tbody input[type="number"]');
  const retenuesInputs = document.querySelectorAll('#retenues tbody input[type="number"]');
  
  if (echelle >= 10 && echelle <= 12) {
    const rowIndex = echelle - 10;
    const echelonIndex = echelon - 1;

    let baseValue = base[rowIndex][echelonIndex] || 0;
    let traitementBase = (((baseValue - 150) * 50.92 + 9885 + 3981) / 12);

    emolumentsInputs[0].value = traitementBase.toFixed(2); // Traitement de base
    emolumentsInputs[3].value = (nbEnf <= 3 ? nbEnf * 300 : 900 + (nbEnf - 3) * 36); // Indemnité familiale
    emolumentsInputs[5].value = (traitementBase * 0.10).toFixed(2); // Indemnité de résidence

    let indNR = 0;
    if (zone === 'A') {
      indNR = traitementBase * 0.15;
    } else if (zone === 'B') {
      indNR = traitementBase * 0.05;
    } else {
      indNR = 0;
    }
    emolumentsInputs[6].value = indNR.toFixed(2); // Indemnité Non Résidence

    emolumentsInputs[4].value = 1000; // Sujetion

    // Calcul Total Emoluments
    let totalEmoluments = 0;
    emolumentsInputs.forEach(input => {
      totalEmoluments += parseFloat(input.value) || 0;
    });
    document.getElementById('totalEmoluments').value = totalEmoluments.toFixed(2);

    // Calcul Mutuelle
    let mutuelle = Math.min(traitementBase * 0.018, 50);
    retenuesInputs[0].value = mutuelle.toFixed(2);

    // Calcul Caisse de Retraite
    let caisseRetraite = (traitementBase + 1000 + traitementBase * 0.10) * 0.14;
    retenuesInputs[4].value = caisseRetraite.toFixed(2);

    // Calcul AMO
    let amo = Math.min((traitementBase + 1000 + traitementBase * 0.10) * 0.025, 400);
    retenuesInputs[5].value = amo.toFixed(2);

    // Fondation M6 fixe 40 DH
    retenuesInputs[3].value = 40;

    // Mutuelle Caisse Retraite
    retenuesInputs[1].value = 125; // valeur fixe comme dans Kotlin

    // Calcul Impôts (simple approximation, à affiner si besoin)
    let baseImposable = totalEmoluments;
    let impot = Math.max(0, (traitementBase * 0.10) - (marie ? (nbEnf * 30 + 30) : (nbEnf * 30)));
    retenuesInputs[2].value = impot.toFixed(2);

    // Calcul Total Retenues
    let totalRetenues = 0;
    retenuesInputs.forEach(input => {
      totalRetenues += parseFloat(input.value) || 0;
    });
    document.getElementById('totalRetenues').value = totalRetenues.toFixed(2);

    // Salaire Net
    document.getElementById('salnet').value = (totalEmoluments - totalRetenues).toFixed(2);
  }
});