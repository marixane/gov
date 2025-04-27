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
    const echelon = parseInt(document.getElementById('echelon').value);
    const nbEnf = parseInt(document.getElementById('nbEnf').value);
    const zone = document.getElementById('zone').value;
    const marie = document.getElementById('marie').checked;
    const allcomp = document.getElementById('allcomp').checked;
    const logadm = document.getElementById('logadm').checked;
    const mutcr = document.getElementById('mutcr').checked;
  
    const emolumentsInputs = document.querySelectorAll('#emoluments tbody input[type="number"]');
    const retenuesInputs = document.querySelectorAll('#retenues tbody input[type="number"]');
  
    let traitementBase = (echelle * echelon * 50.92 + 9885 + 3981) / 12;
    emolumentsInputs[0].value = traitementBase.toFixed(2);
  
    emolumentsInputs[1].value = logadm ? 100 : 0;
    emolumentsInputs[2].value = 0;
    emolumentsInputs[3].value = nbEnf <= 3 ? nbEnf * 300 : 900 + (nbEnf - 3) * 36;
    emolumentsInputs[4].value = 1000;
    emolumentsInputs[5].value = (traitementBase * 0.10).toFixed(2);
    emolumentsInputs[6].value = (zone === 'A' ? traitementBase * 0.15 : zone === 'B' ? traitementBase * 0.05 : 0).toFixed(2);
    emolumentsInputs[7].value = 5741;
    emolumentsInputs[8].value = 0;
    emolumentsInputs[9].value = allcomp ? 646 : 0;
  
    let totalEmoluments = 0;
    emolumentsInputs.forEach(input => { totalEmoluments += parseFloat(input.value) || 0; });
    document.getElementById('totalEmoluments').value = totalEmoluments.toFixed(2);
  
    let mutuelle = Math.min(traitementBase * 0.018, 50);
    retenuesInputs[0].value = mutuelle.toFixed(2);
  
    retenuesInputs[1].value = mutcr ? 125 : 0;
    retenuesInputs[2].value = Math.max(0, (traitementBase * 0.1) - (marie ? (nbEnf * 30 + 30) : (nbEnf * 30))).toFixed(2);
    retenuesInputs[3].value = 40;
    retenuesInputs[4].value = (traitementBase * 0.14).toFixed(2);
    retenuesInputs[5].value = Math.min((traitementBase + 1000 + traitementBase * 0.1) * 0.025, 400).toFixed(2);
  
    let totalRetenues = 0;
    retenuesInputs.forEach(input => { totalRetenues += parseFloat(input.value) || 0; });
    document.getElementById('totalRetenues').value = totalRetenues.toFixed(2);
  
    document.getElementById('salnet').value = (totalEmoluments - totalRetenues).toFixed(2);
  
    const notification = document.getElementById('notification');
    notification.innerText = `Calcul terminé ✅ Salaire Net : ${(totalEmoluments - totalRetenues).toFixed(2)} DH`;
    notification.style.display = 'block';
    setTimeout(() => { notification.style.display = 'none'; }, 4000);
  });