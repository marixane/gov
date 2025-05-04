// Ton tableau de base : indices bruts
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
  const fonctionText = document.getElementById('fonction').value;

  const emolumentsInputs = document.querySelectorAll('#emoluments tbody input[type="number"]');
  const retenuesInputs = document.querySelectorAll('#retenues tbody input[type="number"]');

  if (echelle >= 10 && echelle <= 12) {
    const rowIndex = echelle - 10;
    const echelonIndex = echelon - 1;

    // *** Correction : Prendre baseValue directement et multiplier ***
    let baseValue = base[rowIndex][echelonIndex] || 0;
    let traitementBase = (baseValue * 50.92) / 12; // ✅ Formule correcte

    emolumentsInputs[0].value = traitementBase.toFixed(2); // Traitement de base
    emolumentsInputs[3].value = (nbEnf <= 3 ? nbEnf * 300 : 900 + (nbEnf - 3) * 36); // Indemnité familiale
    emolumentsInputs[5].value = (traitementBase * 0.10).toFixed(2); // Indemnité résidence

    // Indemnité non résidence
    let indNR = 0;
    if (zone === 'A') {
      indNR = traitementBase * 0.15;
    } else if (zone === 'B') {
      indNR = traitementBase * 0.05;
    }
    emolumentsInputs[6].value = indNR.toFixed(2);

    emolumentsInputs[4].value = 1000; // Sujetion

    // --- Traitement All. Ens., All. Encadrement, All. Complém, etc ---
    let logAdm = 0, charAdm = 0, allEns = 0, allEncad = 0, allComplet = 0;

    if (fonctionText.includes("Directeur") || fonctionText.includes("Surveillant") || fonctionText.includes("Chef de travaux") || fonctionText.includes("Censeur") || fonctionText.includes("Inspecteur")) {
      logAdm = 100;
    }

    if (fonctionText.includes("Directeur")) {
      charAdm = 4000;
    } else if (fonctionText.includes("Censeur") || fonctionText.includes("Directeur adjoint")) {
      charAdm = 2300;
    } else if (fonctionText.includes("Surveillant")) {
      charAdm = 2300;
    }

    if (echelle == 10) {
      allEns = 5741;
      allEncad = (echelon <= 5) ? 0 : 700;
    } else if (echelle == 11) {
      allEns = 7475;
      allEncad = (echelon <= 5) ? 950 : 3600;
    } else if (echelle == 12) {
      allEns = 10758;
      allEncad = 5500;
    }

    // Traitement spécial All. Complém.
    if (fonctionText.includes("Inspecteur")) {
      if (echelle == 11) allComplet = 4145;
      else if (echelle == 12) allComplet = 5452;
    } else if (fonctionText.includes("Enseignant Agrégé")) {
      if (echelle == 11) allComplet = 3166;
      else if (echelle == 12) allComplet = 3215;
    } else if (fonctionText.includes("Conseiller d'Orientation")) {
      if (echelle == 10 && echelon <= 5) allComplet = 1500;
      else if (echelle == 10) allComplet = 1568;
      else if (echelle == 11 || echelle == 12) allComplet = 1597;
    } else if (fonctionText.includes("Fournisseur")) {
      allComplet = 1113;
    } else if (fonctionText.includes("Économe")) {
      allComplet = 923;
    } else if (fonctionText.includes("Assistant Pédagogique")) {
      allComplet = 170;
    } else {
      if (echelle == 10) allComplet = 646;
      else if (echelle == 11) allComplet = 758;
      else if (echelle == 12) allComplet = 807;
    }

    emolumentsInputs[1].value = logAdm.toFixed(2);
    emolumentsInputs[2].value = charAdm.toFixed(2);
    emolumentsInputs[7].value = allEns.toFixed(2);
    emolumentsInputs[8].value = allEncad.toFixed(2);
    emolumentsInputs[9].value = allComplet.toFixed(2);

    // --- Total Emoluments ---
    let totalEmoluments = 0;
    emolumentsInputs.forEach(input => {
      totalEmoluments += parseFloat(input.value) || 0;
    });
    document.getElementById('totalEmoluments').value = totalEmoluments.toFixed(2);

    // --- Retenues ---
    let mutuelle = Math.min(traitementBase * 0.018, 50);
    retenuesInputs[0].value = mutuelle.toFixed(2);

    retenuesInputs[1].value = 125;
    retenuesInputs[3].value = 40;

    let caisseRetraite = (traitementBase + 1000 + traitementBase * 0.10) * 0.14;
    retenuesInputs[4].value = caisseRetraite.toFixed(2);

    let amo = Math.min((traitementBase + 1000 + traitementBase * 0.10) * 0.025, 400);
    retenuesInputs[5].value = amo.toFixed(2);

    let baseImposable = totalEmoluments;
    let impots = Math.max(0, (traitementBase * 0.10) - (marie ? (nbEnf * 30 + 30) : (nbEnf * 30)));
    retenuesInputs[2].value = impots.toFixed(2);

    // --- Total Retenues ---
    let totalRetenues = 0;
    retenuesInputs.forEach(input => {
      totalRetenues += parseFloat(input.value) || 0;
    });
    document.getElementById('totalRetenues').value = totalRetenues.toFixed(2);

    // --- Salaire Net ---
    document.getElementById('salnet').value = (totalEmoluments - totalRetenues).toFixed(2);
  }
});