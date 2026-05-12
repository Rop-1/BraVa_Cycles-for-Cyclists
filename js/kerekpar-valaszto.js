var currentStep = 1, totalSteps = 5
var answers = { usage: null, level: null, height: 170, budget: 800000 }
var stepLabels = ['Használat', 'Szint', 'Magasság', 'Büdzsé', 'Összefoglalás']
var frameSize = { 150:'XS / 48', 155:'XS / 49', 160:'S / 51', 165:'S / 52', 170:'M / 54', 175:'M / 56', 180:'L / 57', 185:'L / 58', 190:'XL / 60', 195:'XL / 61', 200:'XXL / 62' }

function getFrameSize(h) {
    var keys = Object.keys(frameSize).map(Number).sort(function(a,b){return a-b})
    return frameSize[keys.reduce(function(p,c){return Math.abs(c-h)<Math.abs(p-h)?c:p})]
}

function updateSliderBg($el) {
    var min=parseFloat($el.attr('min')), max=parseFloat($el.attr('max')), val=parseFloat($el.val())
    var pct=((val-min)/(max-min))*100
    $el.css('background','linear-gradient(to right,var(--accent-color) '+pct+'%,var(--border-color) '+pct+'%)')
}

function buildStepBar() {
    var $bar=$('#stepBar').empty()
    for(var i=1;i<=totalSteps;i++){
        var cls='step'+(i===currentStep?' active':'')+(i<currentStep?' completed':'')
        $bar.append('<div class="'+cls+'"><div class="step-circle fw-bold small">'+(i<currentStep?'<i class="bi bi-check"></i>':i)+'</div><span class="step-label small fw-medium">'+stepLabels[i-1]+'</span></div>')
    }
}

function buildProgressDots() {
    var $d=$('#progressDots').empty()
    for(var i=1;i<=totalSteps;i++) $d.append('<div class="progress-dot'+(i<currentStep?' done':'')+'"></div>')
}

function isStepValid() {
    if(currentStep===1) return answers.usage!==null
    if(currentStep===2) return answers.level!==null
    return true
}

function updateNav() {
    $('#backBtn').toggleClass('invisible',currentStep<=1)
    var $n=$('#nextBtn')
    if(currentStep===totalSteps) $n.html('Találatok <i class="bi bi-search ms-2"></i>')
    else if(currentStep===totalSteps+1) $n.html('<i class="bi bi-arrow-counterclockwise me-2"></i>Újrakezdem')
    else $n.html('Következő <i class="bi bi-arrow-right ms-2"></i>')
    $n.prop('disabled',!isStepValid())
}

function showStep(n) {
    $('.wizard-step-content').removeClass('active')
    $('#wizardStep'+n).addClass('active')
    buildStepBar(); buildProgressDots(); updateNav()
}

function buildSummary() {
    var uM={orszaguti:'Országút',mtb:'Mountain bike',gravel:'Gravel',varos:'Városi'}
    var lM={kezdo:'Kezdő',kozepes:'Haladó',profi:'Profi'}
    var r=function(ic,lbl,val){return '<div class="d-flex align-items-center gap-3 p-3 rounded-3" style="background:var(--bg-secondary)"><i class="bi '+ic+' fs-4 nari"></i><div><div class="text-secondary small">'+lbl+'</div><div class="fw-bold">'+val+'</div></div></div>'}
    $('#summaryContent').html(r('bi-bicycle','Felhasználás',uM[answers.usage]||'-')+r('bi-person-check','Tapasztalat',lM[answers.level]||'-')+r('bi-rulers','Magasság / Vázméret',answers.height+' cm → '+getFrameSize(answers.height))+r('bi-cash-stack','Büdzsé',formatPrice(answers.budget)))
}

function showResults() {
    var tM={orszaguti:'orszaguti',mtb:'mtb',gravel:'gravel',varos:'orszaguti'}
    var filtered=products.filter(function(p){return p.category==='kerekpar'&&p.price<=answers.budget&&(tM[answers.usage]?p.type===tM[answers.usage]:true)})
    filtered.sort(function(a,b){return b.price-a.price})
    var top3=filtered.slice(0,3)
    if(!top3.length){filtered=products.filter(function(p){return p.category==='kerekpar'&&p.price<=answers.budget});filtered.sort(function(a,b){return b.price-a.price});top3=filtered.slice(0,3)}
    $('#resultSubtitle').text(top3.length+' kerékpárt találtunk a preferenciáid alapján')
    var $g=$('#resultGrid').empty()
    top3.forEach(function(p,i){$g.append('<div class="col-md-4"><div class="result-card" onclick="goToProduct('+p.id+')"><img src="'+p.images[0]+'" alt="'+p.name+'"><div class="result-body"><div class="d-flex align-items-center gap-2 mb-2"><div class="result-rank small">'+(i+1)+'</div><span class="small text-secondary">'+p.brand+'</span></div><div class="fw-bold mb-1">'+p.name+'</div><div class="nari fw-bold">'+formatPrice(p.price)+'</div></div></div></div>')})
    if(!top3.length) $g.html('<div class="col-12 text-center py-4"><p class="text-secondary">Nem találtunk terméket a megadott feltételekkel. Próbálj magasabb büdzsét beállítani!</p></div>')
}

$(document).ready(function() {
    buildStepBar(); buildProgressDots(); updateNav()
    updateSliderBg($('#heightSlider')); updateSliderBg($('#budgetSlider'))

    $('#heightSlider').on('input',function(){
        answers.height=parseInt($(this).val())
        $('#heightVal').text(answers.height+' cm'); $('#frameSizeVal').text(getFrameSize(answers.height)); $('#inseamVal').text(Math.round(answers.height*0.47)+' cm')
        updateSliderBg($(this))
    })
    $('#budgetSlider').on('input',function(){
        answers.budget=parseInt($(this).val()); $('#budgetVal').text(formatPrice(answers.budget)); $('#wizardStep4 .option-card').removeClass('selected'); updateSliderBg($(this))
    })
    $(document).on('click','#wizardStep1 .option-card',function(){$('#wizardStep1 .option-card').removeClass('selected');$(this).addClass('selected');answers.usage=$(this).data('value');updateNav()})
    $(document).on('click','#wizardStep2 .option-card',function(){$('#wizardStep2 .option-card').removeClass('selected');$(this).addClass('selected');answers.level=$(this).data('value');updateNav()})
    $(document).on('click','#wizardStep4 .option-card',function(){
        $('#wizardStep4 .option-card').removeClass('selected');$(this).addClass('selected')
        answers.budget=parseInt($(this).data('value'));$('#budgetSlider').val(answers.budget);$('#budgetVal').text(formatPrice(answers.budget));updateSliderBg($('#budgetSlider'))
    })
    $('#nextBtn').on('click',function(){
        if(currentStep===totalSteps+1){
            currentStep=1; answers={usage:null,level:null,height:170,budget:800000}
            $('#wizardStep1 .option-card,#wizardStep2 .option-card,#wizardStep4 .option-card').removeClass('selected')
            $('#heightSlider').val(170);$('#heightVal').text('170 cm');$('#frameSizeVal').text(getFrameSize(170))
            $('#budgetSlider').val(800000);$('#budgetVal').text(formatPrice(800000))
            updateSliderBg($('#heightSlider'));updateSliderBg($('#budgetSlider'));showStep(1);return
        }
        if(currentStep===totalSteps){showResults();currentStep=totalSteps+1;showStep(6);$('#progressDots').hide();return}
        if(currentStep===totalSteps-1) buildSummary()
        currentStep++;showStep(currentStep)
    })
    $('#backBtn').on('click',function(){
        if(currentStep===totalSteps+1){currentStep=totalSteps;$('#progressDots').show();showStep(currentStep);return}
        currentStep--;showStep(currentStep)
    })
})