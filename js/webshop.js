var filteredProducts = products.slice()
var activeFilters = {
    categories: [],
    brands: [],
    minPrice: null,
    maxPrice: null,
    inStock: false
}
$(document).ready(function() {
    renderProducts()
    setupScrollToTop()
})
function formatPrice(price) {
    return new Intl.NumberFormat('hu-HU', {
        style: 'currency',
        currency: 'HUF',
        minimumFractionDigits: 0
    }).format(price)
}
function renderProducts() {
    var $grid = $('#productGrid')
    $grid.empty()
    if (filteredProducts.length === 0) {
        $grid.html('<div class="col-12 text-center py-5"><h3>Nincs találat a szűrési feltételeknek megfelelően</h3></div>')
        return
    }
    $.each(filteredProducts, function(index, product) {
        if (index > 0 && index % 4 === 0 && promoCards.length > 0) {
            $grid.append(createPromoCard(promoCards[Math.floor(Math.random() * promoCards.length)]))
        }
        $grid.append(createProductCard(product))
    })
}
function createProductCard(product) {
    var stockBadge = product.stock
        ? '<span class="badge badge-stock"><i class="bi bi-check-circle me-1"></i>Raktáron</span>'
        : '<span class="badge badge-out-of-stock"><i class="bi bi-x-circle me-1"></i>Nincs raktáron</span>'
    return $('<div class="col-lg-4 col-md-6">').append(
        $('<div class="product-card-shop">').on('click', function() { goToProduct(product.id) }).append(
            $('<p class="bg-white">').append($('<img>').attr({ src: product.images[0], alt: product.name })),
            $('<div class="card-body">').append(
                $('<h5 class="fw-bold mb-2">').text(product.name),
                $('<p class="mb-3">').text(product.shortDesc),
                $(stockBadge),
                $('<div class="price d-flex justify-content-between align-items-center mt-3">').append(
                    $('<span class="nari fw-bold fs-5">').text(formatPrice(product.price)),
                    $('<button class="btn i-web rounded-circle">').on('click', function(e) {
                        e.stopPropagation()
                        goToProduct(product.id)
                    }).append($('<i class="bi bi-arrow-right">'))
                )
            )
        )
    )
}
function createPromoCard(promo) {
    return $('<div class="col-lg-4 col-md-6">').append(
        $('<div class="promo-card">').on('click', function() { window.location.href = promo.link }).append(
            $('<img class="w-100 h-100 rounded-3">').attr({ src: promo.image, alt: promo.title }).css('object-fit', 'cover')
        )
    )
}
function applyFilters() {
    activeFilters.categories = []
    activeFilters.brands = []
    activeFilters.minPrice = $('#minPrice').val() ? parseInt($('#minPrice').val()) : null
    activeFilters.maxPrice = $('#maxPrice').val() ? parseInt($('#maxPrice').val()) : null
    activeFilters.inStock = $('#inStock').is(':checked')
    $('.form-check-input[id^="cat"]:checked').each(function() { activeFilters.categories.push($(this).val()) })
    $('.form-check-input[id^="brand"]:checked').each(function() { activeFilters.brands.push($(this).val()) })
    filteredProducts = products.filter(function(p) {
        if (activeFilters.categories.length && !activeFilters.categories.includes(p.category)) 
            return false
        if (activeFilters.brands.length && !activeFilters.brands.includes(p.brand)) 
            return false
        if (activeFilters.minPrice && p.price < activeFilters.minPrice) 
            return false
        if (activeFilters.maxPrice && p.price > activeFilters.maxPrice) 
            return false
        if (activeFilters.inStock && !p.stock) 
            return false
        return true
    })
    renderProducts()
    showActiveFilters()
}
function clearFilters() {
    $('.form-check-input').prop('checked', false)
    $('#minPrice, #maxPrice').val('')
    activeFilters = { categories: [], brands: [], minPrice: null, maxPrice: null, inStock: false }
    filteredProducts = products.slice()
    renderProducts()
    $('#activeFilters').empty()
}
function showActiveFilters() {
    var $container = $('#activeFilters')
    $container.empty()
    var hasFilters = false
    $.each(activeFilters.categories, function(_, cat) {
        hasFilters = true
        $container.append(
            $('<span class="filter-badge">').text(cat === 'kerekpar' ? 'Kerékpárok' : 'Alkatrészek').append(
                $('<i class="bi bi-x">').on('click', function() { removeFilter('category', cat) })
            )
        )
    })
    $.each(activeFilters.brands, function(_, brand) {
        hasFilters = true
        $container.append(
            $('<span class="filter-badge">').text(brand).append(
                $('<i class="bi bi-x">').on('click', function() { removeFilter('brand', brand) })
            )
        )
    })
    if (activeFilters.minPrice || activeFilters.maxPrice) {
        hasFilters = true
        $container.append(
            $('<span class="filter-badge">').text((activeFilters.minPrice || 0) + ' - ' + (activeFilters.maxPrice || '∞') + ' Ft').append(
                $('<i class="bi bi-x">').on('click', function() { removeFilter('price') })
            )
        )
    }
    if (activeFilters.inStock) {
        hasFilters = true
        $container.append(
            $('<span class="filter-badge">').text('Csak raktáron').append(
                $('<i class="bi bi-x">').on('click', function() { removeFilter('stock') })
            )
        )
    }
    if (hasFilters) {
        $container.append(
            $('<button class="btn btn-sm btn-outline-secondary">').text('Összes törlése').on('click', clearFilters)
        )
    }
}
function removeFilter(type, value) {
    if (type === 'category') {
        activeFilters.categories.splice(activeFilters.categories.indexOf(value), 1)
        $('input[value="' + value + '"][id^="cat"]').prop('checked', false)
    } else if (type === 'brand') {
        activeFilters.brands.splice(activeFilters.brands.indexOf(value), 1)
        $('input[value="' + value + '"][id^="brand"]').prop('checked', false)
    } else if (type === 'price') {
        activeFilters.minPrice = null
        activeFilters.maxPrice = null
        $('#minPrice, #maxPrice').val('')
    } else if (type === 'stock') {
        activeFilters.inStock = false
        $('#inStock').prop('checked', false)
    }
    applyFilters()
}