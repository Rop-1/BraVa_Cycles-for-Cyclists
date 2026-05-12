/* ============================================================
   PROFILE.JS - Edzésnapló, statisztika, szerelés akkordion
   localStorage-ban tárolt adatok, dinamikus számítások
   ============================================================ */

var MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec']
var MONTH_NAMES_FULL = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december']

function getRides() {
    return JSON.parse(localStorage.getItem('brava_rides') || '[]')
}

function saveRides(rides) {
    localStorage.setItem('brava_rides', JSON.stringify(rides))
}

function formatDate(iso) {
    var d = new Date(iso)
    return d.getFullYear() + '. ' + MONTH_NAMES_FULL[d.getMonth()] + ' ' + d.getDate() + '.'
}

function formatDuration(min) {
    if (min >= 60) {
        var h = Math.floor(min / 60)
        var m = min % 60
        return m > 0 ? h + 'ó ' + m + 'p' : h + ' óra'
    }
    return min + ' perc'
}

function avgSpeed(km, min) {
    if (!min || min <= 0) return 0
    return Math.round((km / (min / 60)) * 10) / 10
}

function renderRides() {
    var rides = getRides().sort(function(a, b) { return new Date(b.date) - new Date(a.date) })
    var $tbody = $('#rideTable tbody').empty()
    var $empty = $('#rideEmpty')

    if (rides.length === 0) {
        $empty.show()
        $('#rideTable').hide()
        return
    }
    $empty.hide()
    $('#rideTable').show()

    rides.forEach(function(r) {
        var speed = avgSpeed(r.km, r.min)
        $tbody.append(
            '<tr>' +
            '<td data-label="Dátum">' + formatDate(r.date) + '</td>' +
            '<td data-label="Táv"><strong>' + r.km + ' km</strong></td>' +
            '<td data-label="Idő">' + formatDuration(r.min) + '</td>' +
            '<td data-label="Átlag" class="ride-speed">' + speed + ' km/h</td>' +
            '<td class="text-end"><button class="ride-del-btn" data-id="' + r.id + '" title="Törlés"><i class="bi bi-trash3"></i></button></td>' +
            '</tr>'
        )
    })
}

function renderStats() {
    var rides = getRides()
    var now = new Date()
    var curMonth = now.getMonth()
    var curYear = now.getFullYear()

    var thisMonth = rides.filter(function(r) {
        var d = new Date(r.date)
        return d.getMonth() === curMonth && d.getFullYear() === curYear
    })

    var totalKm = thisMonth.reduce(function(s, r) { return s + r.km }, 0)
    var totalMin = thisMonth.reduce(function(s, r) { return s + r.min }, 0)
    var rideCount = thisMonth.length
    var avg = avgSpeed(totalKm, totalMin)

    $('#statTotalKm').text(totalKm.toFixed(1) + ' km')
    $('#statRideCount').text(rideCount)
    $('#statTotalTime').text(formatDuration(totalMin))
    $('#statAvgSpeed').text(avg + ' km/h')

    // Top stat (hero) - összes idei kilométer
    var thisYear = rides.filter(function(r) { return new Date(r.date).getFullYear() === curYear })
    var yearKm = thisYear.reduce(function(s, r) { return s + r.km }, 0)
    var yearRides = thisYear.length
    $('#heroYearKm').text(yearKm.toFixed(0))
    $('#heroYearRides').text(yearRides)
    $('#heroMonthKm').text(totalKm.toFixed(0))

    // Csúcsadatok
    var longest = rides.length ? Math.max.apply(null, rides.map(function(r) { return r.km })) : 0
    var fastest = rides.length ? Math.max.apply(null, rides.map(function(r) { return avgSpeed(r.km, r.min) })) : 0
    $('#statLongest').text(longest + ' km')
    $('#statFastest').text(fastest + ' km/h')

    // Havi grafikon (utolsó 6 hónap)
    var $chart = $('#chartBars').empty()
    var months = []
    for (var i = 5; i >= 0; i--) {
        var d = new Date(curYear, curMonth - i, 1)
        months.push({ year: d.getFullYear(), month: d.getMonth() })
    }
    var monthKms = months.map(function(m) {
        return rides.filter(function(r) {
            var rd = new Date(r.date)
            return rd.getMonth() === m.month && rd.getFullYear() === m.year
        }).reduce(function(s, r) { return s + r.km }, 0)
    })
    var maxKm = Math.max.apply(null, monthKms.concat([1]))

    months.forEach(function(m, idx) {
        var km = monthKms[idx]
        var pct = maxKm > 0 ? Math.max(4, (km / maxKm) * 100) : 4
        var isCurrent = idx === months.length - 1
        var color = isCurrent ? 'linear-gradient(180deg, var(--accent-color), var(--accent-hover))' : 'linear-gradient(180deg, var(--border-color), #c8c8c8)'
        $chart.append(
            '<div class="chart-col">' +
            '<div class="chart-bar" style="height:' + pct + '%; background:' + color + '">' +
            (km > 0 ? '<span class="bar-val">' + km.toFixed(0) + '</span>' : '') +
            '</div>' +
            '<div class="chart-label">' + MONTH_NAMES_SHORT[m.month] + '</div>' +
            '</div>'
        )
    })
}

function refreshAll() {
    renderRides()
    renderStats()
}

$(document).ready(function() {
    // Mai dátum alapértelmezetten
    var today = new Date().toISOString().slice(0, 10)
    $('#rideDate').val(today).attr('max', today)

    // Élő átlagsebesség előnézet
    function previewSpeed() {
        var km = parseFloat($('#rideKm').val()) || 0
        var min = parseInt($('#rideMin').val()) || 0
        var s = avgSpeed(km, min)
        $('#ridePreviewSpeed').text(s > 0 ? s + ' km/h' : '— km/h')
    }
    $('#rideKm, #rideMin').on('input', previewSpeed)

    $('#rideForm').on('submit', function(e) {
        e.preventDefault()
        var date = $('#rideDate').val()
        var km = parseFloat($('#rideKm').val())
        var min = parseInt($('#rideMin').val())
        if (!date || !km || !min || km <= 0 || min <= 0) {
            showCartToast('Hibás adatok – ellenőrizd a mezőket', false)
            return
        }
        var rides = getRides()
        rides.push({
            id: Date.now(),
            date: date,
            km: km,
            min: min
        })
        saveRides(rides)
        $('#rideKm').val('')
        $('#rideMin').val('')
        previewSpeed()
        refreshAll()
        showCartToast('Túra elmentve: ' + km + ' km')
    })

    $(document).on('click', '.ride-del-btn', function() {
        var id = $(this).data('id')
        var rides = getRides().filter(function(r) { return r.id !== id })
        saveRides(rides)
        refreshAll()
    })

    // Szerelési akkordion
    $(document).on('click', '.repair-head', function() {
        $(this).closest('.repair-card').toggleClass('open')
    })

    // Garázs - "Szerelési útmutató" gomb scrollol a Szerelés tabra
    $(document).on('click', '.garage-fix-btn', function() {
        new bootstrap.Tab(document.querySelector('#tab-repair')).show()
        $('html, body').animate({ scrollTop: $('#tab-content-repair').offset().top - 100 }, 400)
    })

    refreshAll()
})
