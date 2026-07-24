// Moteur de calcul Mandati MEN.
// Cette logique reprend les mêmes règles que MainActivity.kt du projet Android.
const base = [
  [275, 300, 326, 351, 377, 402, 428, 456, 484, 512, 0, 0, 0, 564],
  [336, 369, 403, 436, 472, 509, 542, 574, 606, 639, 675, 690, 704, 704],
  [704, 746, 779, 812, 840, 870, 900, 930, 0, 0, 0, 0, 0, 0]
];

const ALL_COMPLEMENT_FUNCTIONS = new Set([
  'Enseignant - Lycée',
  'Directeur - Lycée',
  'Directeur adjoint - Lycée',
  'Censeur',
  "Directeur d'études",
  'Chef de travaux',
  "Surveillant d'internat - Lycée",
  'Enseignant Agrégé',
  'Enseignant Agrégé - Centres',
  'Inspecteur',
  "Conseiller d'Orientation",
  'Fournisseur',
  'Économe'
]);

const VALIDATION_EXCEPTIONS = new Set([
  'Enseignant - Primaire',
  'Enseignant - Collège',
  'Directeur adjoint - Primaire',
  'Assistant Pédagogique'
]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function roundUpToCent(value) {
  return Math.ceil(value * 100) / 100;
}

/**
 * Calcul pur, sans DOM, afin de pouvoir vérifier la parité avec Android.
 */
function calculateMandati({
  echelle = 10,
  echelon = 1,
  nbEnf = 0,
  zone = 'A',
  marie = false,
  fonction = 'Enseignant - Primaire',
  logadm = true,
  mutcr = true
} = {}) {
  const countEch = clamp(Math.trunc(Number(echelle)), 10, 12);
  const a = clamp(Math.trunc(Number(echelon)), 1, 14);
  const countEnf = clamp(Math.trunc(Number(nbEnf)), 0, 6);
  const baseValue = base[countEch - 10][a - 1] || 0;

  // Formule identique à MainActivity.kt.
  const traitBase = (((baseValue - 150) * 50.92 + 9885 + 3981) / 12);
  const indFam = countEnf < 4 ? countEnf * 300 : 900 + (countEnf - 3) * 36;
  const indResidence = traitBase * 0.10;
  const indNonResidence = zone === 'A' ? traitBase * 0.15 : zone === 'B' ? traitBase * 0.05 : 0;

  const adminValues = {
    'Enseignant - Primaire': [0, 0],
    'Enseignant - Collège': [0, 0],
    'Enseignant - Lycée': [0, 0],
    "Directeur d'école - Primaire": [100, 3645],
    'Directeur adjoint - Primaire': [0, 600],
    'Directeur - Collège': [100, 4072],
    'Surveillant d\'externat - Collège': [1000 / 12, 2330],
    'Surveillant d\'internat - Collège': [1000 / 12, 2330],
    'Directeur - Lycée': [1500 / 12, 4671],
    'Directeur adjoint - Lycée': [0, 2380],
    'Censeur': [1350 / 12, 2716],
    "Directeur d'études": [1350 / 12, 2716],
    'Chef de travaux': [100, 2413],
    'Surveillant d\'externat - Lycée': [100, 2363],
    'Surveillant d\'internat - Lycée': [100, 2363]
  };
  const [logAdmValue, charAdm] = adminValues[fonction] || [0, 0];
  const logAdm = logadm ? logAdmValue : 0;

  let allEns = 0;
  let allEncad = 0;
  if (countEch === 10) {
    if (a < 6) allEns = 5741;
    else {
      allEns = 5928;
      allEncad = 700;
    }
  } else if (countEch === 11) {
    if (a < 6) {
      allEns = 7475;
      allEncad = 950;
    } else {
      allEns = 9060;
      allEncad = 3600;
    }
  } else {
    allEns = a < 3 ? 10758 : 12677;
    allEncad = 5500;
  }

  let allComplet = 0;
  const allCompletEnabled = ALL_COMPLEMENT_FUNCTIONS.has(fonction);
  if (allCompletEnabled) {
    allComplet = countEch === 10 ? 646 : countEch === 11 ? 758 : 807;
  }

  if (allCompletEnabled && fonction === 'Enseignant Agrégé') {
    allComplet = countEch === 11 ? 3166 : countEch === 12 ? 3215 : 0;
  } else if (allCompletEnabled && fonction === 'Enseignant Agrégé - Centres') {
    if (countEch === 11) allComplet = a < 6 ? 5272 : 5321;
    else if (countEch === 12) allComplet = 5321;
  } else if (allCompletEnabled && fonction === 'Inspecteur') {
    allComplet = countEch === 11 ? 4145 : countEch === 12 ? 5452 : 0;
  } else if (allCompletEnabled && fonction === "Conseiller d'Orientation") {
    allComplet = countEch === 10 ? (a < 6 ? 1500 : 1568) : 1597;
  } else if (allCompletEnabled && fonction === 'Fournisseur') {
    allComplet = 1113;
  } else if (allCompletEnabled && fonction === 'Économe') {
    allComplet = 923;
  }

  const emoluments = [
    traitBase, logAdm, charAdm, indFam, 1000, indResidence,
    indNonResidence, allEns, allEncad, allComplet
  ];
  const totalEmoluments = emoluments.reduce((sum, value) => sum + value, 0);

  const mutuelle = Math.min(traitBase * 0.018, 50);
  const mutuelleCaisse = mutcr ? 125 : 0;
  const fondationM6 = countEch === 10 ? 40 : countEch === 11 ? 45 : 50;
  const caisseBase = traitBase + 1000 + traitBase * 0.10 + allEns + allEncad;
  const caisseRetraite = caisseBase * 0.14;
  const amo = Math.min(caisseBase * 0.025, 400);

  // Calcul fiscal identique à Android, y compris les seuils utilisés par l'application.
  const nBase = totalEmoluments - indFam;
  const n = Math.min(nBase * 0.25, 2916.6666666666);
  const netImposable = (
    traitBase + logAdm + charAdm + 1000 + traitBase * 0.10 + indNonResidence
    + allEns + allEncad + allComplet - (n + amo + mutuelle + mutuelleCaisse + caisseRetraite)
  );
  const annuel = netImposable * 12;
  let impot = 0;
  if (annuel < 40000) impot = 0;
  else if (40001 < annuel && annuel < 60000) impot = netImposable * 0.1 - 333.3333333334;
  else if (60001 < annuel && annuel < 80000) impot = netImposable * 0.2 - 833.3333333334;
  else if (80001 < annuel && annuel < 100000) impot = netImposable * 0.3 - 1500;
  else if (100001 < annuel && annuel < 180000) impot = netImposable * 0.34 - 1833.3333333334;
  else impot = netImposable * 0.37 - 2283.3333333334;

  const impots = marie && countEnf < 6 ? impot - (countEnf * 30 + 30) : impot - countEnf * 30;
  const retenues = [mutuelle, mutuelleCaisse, impots, fondationM6, caisseRetraite, amo];
  const totalRetenues = retenues.reduce((sum, value) => sum + value, 0);
  const salaireNet = roundUpToCent(totalEmoluments - totalRetenues);

  const warnings = [];
  if (Math.trunc(traitBase) === 519) warnings.push('Vérifier les informations déclarées.');
  if ((baseValue === 675 || baseValue === 690) && !VALIDATION_EXCEPTIONS.has(fonction)) {
    warnings.push('Vérifier la fonction associée à cet échelon.');
  }
  if (countEch === 11 && a === 13 && !VALIDATION_EXCEPTIONS.has(fonction)) {
    warnings.push('Vérifier la fonction associée à l’échelle 11, échelon 13.');
  }
  if (countEch === 11 && a === 14 && VALIDATION_EXCEPTIONS.has(fonction)) {
    warnings.push('Vérifier la fonction associée à l’échelle 11, échelon 14.');
  }

  return {
    emoluments,
    retenues,
    totalEmoluments,
    totalRetenues,
    salaireNet,
    warnings,
    details: { traitBase, indFam, indResidence, indNonResidence, allEns, allEncad, allComplet, impot }
  };
}

function increase(id, max) {
  const input = document.getElementById(id);
  input.value = Math.min(max, parseInt(input.value, 10) + 1);
}

function decrease(id, min) {
  const input = document.getElementById(id);
  input.value = Math.max(min, parseInt(input.value, 10) - 1);
}

// Expose the controls for browsers that still evaluate legacy inline handlers
// in the page context (notably some mobile WebViews).
if (typeof window !== 'undefined') {
  window.increase = increase;
  window.decrease = decrease;
}

function formatAmount(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value));
}

function renderCalculation(result) {
  const emolumentsInputs = document.querySelectorAll('#emoluments tbody .amount');
  const retenuesInputs = document.querySelectorAll('#retenues tbody .amount');
  result.emoluments.forEach((value, index) => { emolumentsInputs[index].value = formatAmount(value); });
  result.retenues.forEach((value, index) => { retenuesInputs[index].value = formatAmount(value); });
  document.getElementById('totalEmoluments').value = formatAmount(result.totalEmoluments);
  document.getElementById('totalRetenues').value = formatAmount(result.totalRetenues);
  document.getElementById('salnet').value = formatAmount(result.salaireNet);

  const notification = document.getElementById('notification');
  notification.textContent = result.warnings.join(' ');
  notification.style.display = result.warnings.length ? 'block' : 'none';
  notification.style.color = result.warnings.length ? '#b42318' : 'green';
}

if (typeof document !== 'undefined') {
  // Bloque le geste de double-appui qui agrandit la page sur mobile, tout en
  // laissant les boutons, cases et sélecteurs recevoir leur clic normal.
  document.addEventListener('dblclick', (event) => event.preventDefault(), { passive: false });

  // Les commandes restent réactives au toucher, même après plusieurs appuis
  // rapides : `touch-action: manipulation` évite que le navigateur interprète
  // le double appui comme un zoom de page.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('.input-group button[data-adjust]');
    if (!button) return;
    event.preventDefault();
    const id = button.dataset.target;
    const limit = Number(button.dataset.limit);
    if (button.dataset.adjust === 'increase') increase(id, limit);
    else decrease(id, limit);
  });
  document.querySelectorAll('.input-group button[data-adjust]').forEach((button) => {
    button.addEventListener('dblclick', (event) => event.preventDefault());
    button.addEventListener('pointerdown', () => button.classList.add('is-pressed'), { passive: true });
    button.addEventListener('pointerup', () => button.classList.remove('is-pressed'), { passive: true });
    button.addEventListener('pointercancel', () => button.classList.remove('is-pressed'), { passive: true });
  });

  const fonctionSelect = document.getElementById('fonction');
  const fonctionCurrent = document.getElementById('fonction-current');
  const syncFonctionLabel = () => { fonctionCurrent.textContent = fonctionSelect.options[fonctionSelect.selectedIndex].text; };
  fonctionSelect.addEventListener('change', syncFonctionLabel);
  syncFonctionLabel();

  document.getElementById('btnCalculer').addEventListener('click', function () {
    const result = calculateMandati({
      echelle: document.getElementById('echelle').value,
      echelon: document.getElementById('echelon').value,
      nbEnf: document.getElementById('nbEnf').value,
      zone: document.getElementById('zone').value,
      marie: document.getElementById('marie').checked,
      fonction: document.getElementById('fonction').value,
      logadm: document.getElementById('logadm').checked,
      mutcr: document.getElementById('mutcr').checked
    });
    renderCalculation(result);
  });
}

// ---------------------------------------------------------------------------
// Calcul de retraite
// ---------------------------------------------------------------------------
// Cette partie est isolée du moteur de salaire ci-dessus : ouvrir la page
// retraite ne réinitialise donc aucun champ du calcul de salaire.
const retirementFunctions = [
  'Enseignant - Primaire', 'Enseignant - Collège', 'Enseignant - Lycée',
  "Directeur d'école - Primaire", 'Directeur adjoint - Primaire', 'Directeur - Collège',
  "Surveillant d'externat - Collège", "Surveillant d'internat - Collège",
  'Directeur - Lycée', 'Directeur adjoint - Lycée', 'Censeur', "Directeur d'études",
  'Chef de travaux', "Surveillant d'externat - Lycée", "Surveillant d'internat - Lycée",
  'Enseignant Agrégé', 'Enseignant Agrégé - Centres', 'Inspecteur',
  "Conseiller d'Orientation", 'Fournisseur', 'Économe', 'Assistant Pédagogique'
];

function dateToIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isoToDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

function addYearsIso(value, years) {
  const date = isoToDate(value);
  if (!date) return '';
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return dateToIso(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addYearsMonthsDays(startValue, endValue) {
  const start = isoToDate(startValue);
  const end = isoToDate(endValue);
  if (!start || !end || end < start) return '0A 0M 0J';

  let years = end.getUTCFullYear() - start.getUTCFullYear();
  let months = end.getUTCMonth() - start.getUTCMonth();
  let days = end.getUTCDate() - start.getUTCDate();
  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 0));
    days += previousMonth.getUTCDate();
  }
  if (months < 0) { years -= 1; months += 12; }
  return `${years}A ${months}M ${days}J`;
}

function calculateRetirementPercent(recruitmentValue, radiationValue) {
  const recruitment = isoToDate(recruitmentValue);
  const radiation = isoToDate(radiationValue);
  const reference = new Date(Date.UTC(2017, 0, 1));
  if (!recruitment || !radiation || radiation < recruitment) return 0;

  const days = 86400000;
  let before2017 = 0;
  let adjustment = 0;
  if (recruitment <= reference) {
    const years = (reference - recruitment) / days / 365;
    const rounded = Math.ceil(years * 2) / 2;
    before2017 = rounded * 2.5;
    adjustment = rounded - years;
  }

  const afterYears = Math.max(0, (radiation - reference) / days / 365 - adjustment);
  const roundedAfter = Math.ceil(afterYears * 2) / 2;
  return Math.max(0, before2017 + roundedAfter * 2);
}

if (typeof document !== 'undefined') {
  const salaryView = document.getElementById('salaryView');
  const retirementView = document.getElementById('retirementView');
  const appTitle = document.getElementById('appTitle');
  const appBack = document.querySelector('.app-back');
  const menuButton = document.getElementById('appMenuButton');
  const menuPanel = document.getElementById('appMenuPanel');
  const retirementMenuItem = document.getElementById('retirementMenuItem');

  const retirementFonction = document.getElementById('retirementFonction');
  if (retirementFonction) {
    retirementFunctions.forEach((name) => retirementFonction.add(new Option(name, name)));
  }

  const birth = document.getElementById('retirementBirth');
  const recruitment = document.getElementById('retirementRecruitment');
  const radiation = document.getElementById('retirementRadiation');
  const ageLimit = document.getElementById('retirementAgeLimit');
  const historyDates = [1, 2, 3].map((n) => document.getElementById(`retDate${n}`));
  const scaleValues = ['10', '11', 'HE'];
  const scales = ['10', '11', 'HE'];
  const levels = [1, 1, 1];
  let retirementInitialized = false;

  const updateRetirementOutputs = () => {
    const duration = document.getElementById('retirementDuration');
    const percent = document.getElementById('retirementPercent');
    if (duration) duration.textContent = addYearsMonthsDays(recruitment.value, radiation.value);
    if (percent) percent.textContent = `${calculateRetirementPercent(recruitment.value, radiation.value).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
  };

  const initializeRetirement = () => {
    // The menu can be opened repeatedly. Keep the user's entries and avoid
    // registering duplicate listeners each time the view is shown.
    if (retirementInitialized) {
      updateRetirementOutputs();
      return;
    }
    retirementInitialized = true;
    const now = new Date();
    const year = now.getFullYear();
    birth.value = `${year - 63}-01-01`;
    recruitment.value = `${year - 40}-09-02`;
    historyDates.forEach((input) => { input.value = `${year - 8}-09-02`; });
    const updateRadiation = () => {
      const birthDate = isoToDate(birth.value);
      if (!birthDate) return;
      const birthYear = birthDate.getUTCFullYear();
      const beforeSeptember = birthDate < new Date(Date.UTC(birthYear, 8, 1));
      const retirementDate = new Date(Date.UTC(birthYear + (beforeSeptember ? 63 : 64), 7, 31));
      radiation.value = dateToIso(new Date(retirementDate.getUTCFullYear(), retirementDate.getUTCMonth(), retirementDate.getUTCDate()));
      radiation.disabled = ageLimit.checked;
      updateRetirementOutputs();
    };
    updateRadiation();
    birth.addEventListener('change', () => {
      recruitment.value = addYearsIso(birth.value, 22).replace(/-\d{2}-\d{2}$/, '-09-02');
      updateRadiation();
    });
    recruitment.addEventListener('change', updateRetirementOutputs);
    radiation.addEventListener('change', updateRetirementOutputs);
    ageLimit.addEventListener('change', () => {
      if (ageLimit.checked) updateRadiation();
      else radiation.disabled = false;
      updateRetirementOutputs();
    });
    document.querySelectorAll('[data-ret-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const row = Number(button.dataset.retRow) - 1;
        const action = button.dataset.retAction;
        if (action === 'level-up') levels[row] = Math.min(13, levels[row] + 1);
        if (action === 'level-down') levels[row] = Math.max(1, levels[row] - 1);
        if (action === 'scale-up') scales[row] = scaleValues[Math.min(scaleValues.length - 1, scaleValues.indexOf(scales[row]) + 1)];
        if (action === 'scale-down') scales[row] = scaleValues[Math.max(0, scaleValues.indexOf(scales[row]) - 1)];
        document.getElementById(`retScale${row + 1}`).textContent = scales[row];
        document.getElementById(`retLevel${row + 1}`).textContent = levels[row];
      });
    });
    document.getElementById('retirementCalculate').addEventListener('click', () => {
      updateRetirementOutputs();
      document.getElementById('retirementNotification').textContent = 'Calcul effectué à titre informatif.';
    });
    updateRetirementOutputs();
  };

  const showRetirement = () => {
    initializeRetirement();
    salaryView.hidden = true;
    retirementView.hidden = false;
    appTitle.textContent = 'Calcul de Retraite';
    appBack.setAttribute('aria-label', 'Retour au calcul de salaire');
    appBack.dataset.retirement = 'true';
    menuPanel.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  };

  const showSalary = () => {
    retirementView.hidden = true;
    salaryView.hidden = false;
    appTitle.textContent = 'Calcul de Salaire';
    appBack.setAttribute('aria-label', 'Retour à l’accueil');
    delete appBack.dataset.retirement;
  };

  menuButton.addEventListener('click', (event) => {
    event.stopPropagation();
    menuPanel.hidden = !menuPanel.hidden;
    menuButton.setAttribute('aria-expanded', String(!menuPanel.hidden));
  });
  retirementMenuItem.addEventListener('click', showRetirement);
  document.addEventListener('click', (event) => {
    if (!menuPanel.hidden && !menuPanel.contains(event.target) && event.target !== menuButton) {
      menuPanel.hidden = true;
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });
  appBack.addEventListener('click', (event) => {
    if (appBack.dataset.retirement === 'true') {
      event.preventDefault();
      showSalary();
    }
  });
}

if (typeof module !== 'undefined') {
  module.exports = {
    calculateMandati,
    calculateRetirementPercent,
    addYearsMonthsDays
  };
}
