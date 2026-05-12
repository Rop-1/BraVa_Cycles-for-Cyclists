var aktualisTermek = null
var kepIndex = 0

$(document).ready(function() {
    var id = parseInt(new URLSearchParams(window.location.search).get('id'))
    aktualisTermek = products.find(function(p) { return p.id === id })
    if (aktualisTermek) { renderTermek(); setupScrollToTop() }
    else window.location.href = 'webshop.html'

    $('#addToCartBtn').on('click', function() {
        if (!aktualisTermek.stock) { showCartToast(aktualisTermek.name, false); return }
        addToCart(aktualisTermek)
    })
})

function renderTermek() {
    $('#productName').text(aktualisTermek.name)
    $('#productBrand').text(aktualisTermek.brand)
    $('#productPrice').text(formatPrice(aktualisTermek.price))
    $('#productShortDesc').text(aktualisTermek.shortDesc)
    $('#productLongDesc').text(aktualisTermek.longDesc)
    $('#breadcrumbProduct').text(aktualisTermek.name)
    $('#mainImage').attr('src', aktualisTermek.images[0])
    $('#stockStatus').html(aktualisTermek.stock
        ? '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Raktáron</span>'
        : '<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>Nincs raktáron</span>')
    renderThumbs(); renderSpecs()
}

function renderThumbs() {
    var $c = $('#thumbnails').empty()
    $.each(aktualisTermek.images, function(i, kep) {
        $c.append($('<p class="bg-white">').append(
            $('<img>').attr({ src: kep, alt: 'Termék kép '+(i+1), class: 'thumbnail'+(i===0?' active':'') }).on('click', function() { kepCsere(i) })
        ))
    })
}

function renderSpecs() {
    var $t = $('#specsTable tbody').empty()
    $.each(aktualisTermek.specs, function(k, v) {
        $t.append($('<tr>').append($('<td class="fw-bold" style="width:40%">').text(k), $('<td>').text(v)))
    })
}

function kepCsere(i) {
    kepIndex = i
    $('#mainImage').attr('src', aktualisTermek.images[i])
    $('.thumbnail').removeClass('active').eq(i).addClass('active')
}

function openLightbox(i) {
    kepIndex = i
    $('#lightboxImage').attr('src', aktualisTermek.images[i])
    kepSzamlalo(); $('#lightboxModal').modal('show')
}

function changeLightboxImage(irany) {
    kepIndex = (kepIndex + irany + aktualisTermek.images.length) % aktualisTermek.images.length
    $('#lightboxImage').attr('src', aktualisTermek.images[kepIndex])
    kepSzamlalo()
}

function kepSzamlalo() { $('#imageCounter').text((kepIndex+1)+' / '+aktualisTermek.images.length) }