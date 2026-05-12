var HONAP_ROVID = ['Jan','Feb','Már','Ápr','Máj','Jún','Júl','Aug','Szep','Okt','Nov','Dec']
var HONAP_TELJES = ['január','február','március','április','május','június','július','augusztus','szeptember','október','november','december']

function getTurak() { return JSON.parse(localStorage.getItem('brava_rides') || '[]') }
function saveTurak(t) { localStorage.setItem('brava_rides', JSON.stringify(t)) }

function formatDatum(iso) {
    var d = new Date(iso)
    return d.getFullYear() + '. ' + HONAP_TELJES[d.getMonth()] + ' ' + d.getDate() + '.'
}

function formatIdo(perc) {
    if (perc >= 60) { var h = Math.floor(perc/60), m = perc%60; return m > 0 ? h+'ó '+m+'p' : h+' óra' }
    return perc + ' perc'
}

function atlagSebesseg(km, perc) {
    return (!perc || perc <= 0) ? 0 : Math.round((km / (perc/60)) * 10) / 10
}

function showRideToast(uzenet, siker) {
    if (siker === undefined) siker = true
    if (!$('#cartToastContainer').length) $('body').append('<div id="cartToastContainer" class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:9999"></div>')
    var $t = $('<div class="toast align-items-center border-0 text-white" role="alert" aria-atomic="true" style="background-color:' + (siker ? 'var(--success)' : 'var(--error)') + '"><div class="d-flex"><div class="toast-body"><i class="bi ' + (siker ? 'bi-check-circle-fill' : 'bi-x-circle-fill') + ' me-2"></i>' + uzenet + '</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>')
    $('#cartToastContainer').append($t)
    var toast = new bootstrap.Toast($t[0], { delay: 2500 })
    toast.show()
    $t[0].addEventListener('hidden.bs.toast', function() { $t.remove() })
}

function renderTurak() {
    var turak = getTurak().sort(function(a,b) { return new Date(b.date) - new Date(a.date) })
    var $tbody = $('#rideTable tbody').empty()
    if (turak.length === 0) { $('#rideEmpty').removeClass('d-none').show(); $('#rideTable').addClass('d-none'); return }
    $('#rideEmpty').addClass('d-none'); $('#rideTable').removeClass('d-none')
    turak.forEach(function(r) {
        var s = atlagSebesseg(r.km, r.min)
        $tbody.append('<tr><td data-label="Dátum">' + formatDatum(r.date) + '</td><td data-label="Táv"><strong>' + r.km + ' km</strong></td><td data-label="Idő">' + formatIdo(r.min) + '</td><td data-label="Átlag" class="ride-speed">' + s + ' km/h</td><td class="text-end"><button class="ride-del-btn" data-id="' + r.id + '" title="Törlés"><i class="bi bi-trash3"></i></button></td></tr>')
    })
}

function renderStatisztika() {
    var turak = getTurak()
    var most = new Date(), honapIndex = most.getMonth(), ev = most.getFullYear()
    var eTurak = turak.filter(function(r) { var d = new Date(r.date); return d.getMonth() === honapIndex && d.getFullYear() === ev })
    var osszkm = eTurak.reduce(function(s,r) { return s+r.km }, 0)
    var ossperc = eTurak.reduce(function(s,r) { return s+r.min }, 0)
    var atlag = atlagSebesseg(osszkm, ossperc)

    $('#statTotalKm').text(osszkm.toFixed(1)+' km')
    $('#statRideCount').text(eTurak.length)
    $('#statTotalTime').text(formatIdo(ossperc))
    $('#statAvgSpeed').text(atlag+' km/h')

    var evTurak = turak.filter(function(r) { return new Date(r.date).getFullYear() === ev })
    var evKm = evTurak.reduce(function(s,r) { return s+r.km }, 0)
    $('#heroYearKm').text(evKm.toFixed(0)); $('#heroYearRides').text(evTurak.length); $('#heroMonthKm').text(osszkm.toFixed(0))

    var leghosszabb = turak.length ? Math.max.apply(null, turak.map(function(r) { return r.km })) : 0
    var leggyorsabb = turak.length ? Math.max.apply(null, turak.map(function(r) { return atlagSebesseg(r.km, r.min) })) : 0
    $('#statLongest').text(leghosszabb+' km'); $('#statFastest').text(leggyorsabb+' km/h')

    var $chart = $('#chartBars').empty()
    var honapok = []
    for (var i = 5; i >= 0; i--) { var d = new Date(ev, honapIndex-i, 1); honapok.push({ ev: d.getFullYear(), h: d.getMonth() }) }
    var honapKmek = honapok.map(function(m) {
        return turak.filter(function(r) { var rd = new Date(r.date); return rd.getMonth() === m.h && rd.getFullYear() === m.ev }).reduce(function(s,r) { return s+r.km }, 0)
    })
    var maxKm = Math.max.apply(null, honapKmek.concat([1]))
    honapok.forEach(function(m, idx) {
        var km = honapKmek[idx], pct = Math.max(4, (km/maxKm)*100)
        var aktualis = idx === honapok.length-1
        var szin = aktualis ? 'linear-gradient(180deg,var(--accent-color),var(--accent-hover))' : 'linear-gradient(180deg,var(--border-color),#c8c8c8)'
        $chart.append('<div class="chart-col"><div class="chart-bar" style="height:'+pct+'%;background:'+szin+'">'+(km > 0 ? '<span class="bar-val">'+km.toFixed(0)+'</span>' : '')+'</div><div class="chart-label">'+HONAP_ROVID[m.h]+'</div></div>')
    })
}

$(document).ready(function() {
    var ma = new Date().toISOString().slice(0,10)
    $('#rideDate').val(ma).attr('max', ma)

    function elonezet() {
        var km = parseFloat($('#rideKm').val()) || 0, perc = parseInt($('#rideMin').val()) || 0
        var s = atlagSebesseg(km, perc)
        $('#ridePreviewSpeed').text(s > 0 ? s+' km/h' : '— km/h')
    }
    $('#rideKm, #rideMin').on('input', elonezet)

    $('#rideForm').on('submit', function(e) {
        e.preventDefault()
        var datum = $('#rideDate').val(), km = parseFloat($('#rideKm').val()), perc = parseInt($('#rideMin').val())
        if (!datum || !km || !perc || km <= 0 || perc <= 0) { showRideToast('Hibás adatok – ellenőrizd a mezőket', false); return }
        var turak = getTurak()
        turak.push({ id: Date.now(), date: datum, km: km, min: perc })
        saveTurak(turak)
        $('#rideKm, #rideMin').val('')
        elonezet()
        renderTurak(); renderStatisztika()
        showRideToast('Túra elmentve: '+km+' km')
    })

    $(document).on('click', '.ride-del-btn', function() {
        var id = parseInt($(this).data('id'))
        saveTurak(getTurak().filter(function(r) { return r.id !== id }))
        renderTurak(); renderStatisztika()
    })

    $(document).on('click', '.repair-head', function() { $(this).closest('.repair-card').toggleClass('open') })

    $(document).on('click', '.garage-fix-btn', function() {
        new bootstrap.Tab(document.querySelector('#tab-repair')).show()
        $('html, body').animate({ scrollTop: $('#tab-content-repair').offset().top - 100 }, 400)
    })

    renderTurak(); renderStatisztika()
})