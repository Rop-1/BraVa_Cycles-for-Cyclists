var szurtTermekek = products.slice()
var aktívSzurok = { categories: [], brands: [], minPrice: null, maxPrice: null, inStock: false }

$(document).ready(function() {
    renderProducts()
    setupScrollToTop()
})

function renderProducts() {
    var $grid = $('#productGrid').empty()
    if (szurtTermekek.length === 0) { $grid.html('<div class="col-12 text-center py-5"><h3>Nincs találat a szűrési feltételeknek megfelelően</h3></div>'); return }
    $.each(szurtTermekek, function(i, termek) {
        if (i > 0 && i % 4 === 0 && promoCards.length > 0)
            $grid.append(createPromoCard(promoCards[Math.floor(Math.random() * promoCards.length)]))
        $grid.append(createProductCard(termek))
    })
}

function createProductCard(termek) {
    var badge = termek.stock
        ? '<span class="badge badge-stock"><i class="bi bi-check-circle me-1"></i>Raktáron</span>'
        : '<span class="badge badge-out-of-stock"><i class="bi bi-x-circle me-1"></i>Nincs raktáron</span>'
    return $('<div class="col-lg-4 col-md-6">').append(
        $('<div class="product-card-shop">').on('click', function() { goToProduct(termek.id) }).append(
            $('<p class="bg-white">').append($('<img>').attr({ src: termek.images[0], alt: termek.name })),
            $('<div class="card-body">').append(
                $('<h5 class="fw-bold mb-2">').text(termek.name),
                $('<p class="mb-3">').text(termek.shortDesc),
                $(badge),
                $('<div class="price d-flex justify-content-between align-items-center mt-3">').append(
                    $('<span class="nari fw-bold fs-5">').text(formatPrice(termek.price)),
                    $('<div class="d-flex gap-2">').append(
                        $('<button class="btn i-web rounded-circle" title="Kosárba">').on('click', function(e) {
                            e.stopPropagation()
                            if (!termek.stock) { showCartToast(termek.name, false); return }
                            addToCart(termek)
                        }).append($('<i class="bi bi-cart-plus">')),
                        $('<button class="btn i-web rounded-circle" title="Részletek">').on('click', function(e) { e.stopPropagation(); goToProduct(termek.id) }).append($('<i class="bi bi-arrow-right">'))
                    )
                )
            )
        )
    )
}

function createPromoCard(promo) {
    return $('<div class="col-lg-4 col-md-6">').append(
        $('<div class="promo-card rounded-3">').on('click', function() { window.location.href = promo.link }).append(
            $('<img class="w-100 h-100 rounded-3">').attr({ src: promo.image, alt: promo.title }).css('object-fit', 'cover')
        )
    )
}

function applyFilters() {
    aktívSzurok.categories = []
    aktívSzurok.brands = []
    aktívSzurok.minPrice = $('#minPrice').val() ? parseInt($('#minPrice').val()) : null
    aktívSzurok.maxPrice = $('#maxPrice').val() ? parseInt($('#maxPrice').val()) : null
    aktívSzurok.inStock = $('#inStock').is(':checked')
    $('.form-check-input[id^="cat"]:checked').each(function() { aktívSzurok.categories.push($(this).val()) })
    $('.form-check-input[id^="brand"]:checked').each(function() { aktívSzurok.brands.push($(this).val()) })
    szurtTermekek = products.filter(function(p) {
        if (aktívSzurok.categories.length && !aktívSzurok.categories.includes(p.category)) return false
        if (aktívSzurok.brands.length && !aktívSzurok.brands.includes(p.brand)) return false
        if (aktívSzurok.minPrice && p.price < aktívSzurok.minPrice) return false
        if (aktívSzurok.maxPrice && p.price > aktívSzurok.maxPrice) return false
        if (aktívSzurok.inStock && !p.stock) return false
        return true
    })
    renderProducts(); showActiveFilters()
}

function clearFilters() {
    $('.form-check-input').prop('checked', false)
    $('#minPrice, #maxPrice').val('')
    aktívSzurok = { categories: [], brands: [], minPrice: null, maxPrice: null, inStock: false }
    szurtTermekek = products.slice()
    renderProducts(); $('#activeFilters').empty()
}

function showActiveFilters() {
    var $c = $('#activeFilters').empty()
    var van = false
    $.each(aktívSzurok.categories, function(_, kat) {
        van = true
        $c.append($('<span class="filter-badge rounded-pill m-1 p-2">').text(kat === 'kerekpar' ? 'Kerékpárok' : 'Alkatrészek').append($('<i class="bi bi-x">').on('click', function() { removeFilter('category', kat) })))
    })
    $.each(aktívSzurok.brands, function(_, brand) {
        van = true
        $c.append($('<span class="filter-badge rounded-pill m-1 p-2">').text(brand).append($('<i class="bi bi-x">').on('click', function() { removeFilter('brand', brand) })))
    })
    if (aktívSzurok.minPrice || aktívSzurok.maxPrice) {
        van = true
        $c.append($('<span class="filter-badge rounded-pill m-1 p-2">').text((aktívSzurok.minPrice||0)+' - '+(aktívSzurok.maxPrice||'∞')+' Ft').append($('<i class="bi bi-x">').on('click', function() { removeFilter('price') })))
    }
    if (aktívSzurok.inStock) {
        van = true
        $c.append($('<span class="filter-badge rounded-pill m-1 p-2">').text('Csak raktáron').append($('<i class="bi bi-x">').on('click', function() { removeFilter('stock') })))
    }
    if (van) $c.append($('<button class="btn btn-sm btn-outline-secondary">').text('Összes törlése').on('click', clearFilters))
}

function removeFilter(tipus, ertek) {
    if (tipus === 'category') { aktívSzurok.categories.splice(aktívSzurok.categories.indexOf(ertek), 1); $('input[value="'+ertek+'"][id^="cat"]').prop('checked', false) }
    else if (tipus === 'brand') { aktívSzurok.brands.splice(aktívSzurok.brands.indexOf(ertek), 1); $('input[value="'+ertek+'"][id^="brand"]').prop('checked', false) }
    else if (tipus === 'price') { aktívSzurok.minPrice = null; aktívSzurok.maxPrice = null; $('#minPrice, #maxPrice').val('') }
    else if (tipus === 'stock') { aktívSzurok.inStock = false; $('#inStock').prop('checked', false) }
    applyFilters()
}