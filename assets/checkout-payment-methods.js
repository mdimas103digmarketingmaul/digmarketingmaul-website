(function(){
  const ASSET='/assets/payment-methods/';
  const context=window.MauldigitalCheckoutContext || {};
  const PRODUCT_ID=String(context.productId || new URLSearchParams(location.search).get('product') || '').trim();
  const PRODUCT_PRICE=Number(context.amount || 0);
  if(!PRODUCT_ID || !Number.isFinite(PRODUCT_PRICE) || PRODUCT_PRICE<=0) return;

  const METHODS=[
    {category:'qris',id:'qris',name:'QRIS',provider:'midtrans',logo:'qris.webp',fee:{rate:.007,fixed:0},feeId:'0,7%',feeEn:'0.7%'},

    {category:'va',id:'bsi',name:'BSI Virtual Account',provider:'doku',logo:'bsi.webp',fee:{rate:0,fixed:4000},feeId:'Rp4.000',feeEn:'Rp4,000'},
    {category:'va',id:'permata',name:'Permata Virtual Account',provider:'doku',logo:'permata.webp',fee:{rate:0,fixed:4000},feeId:'Rp4.000',feeEn:'Rp4,000'},
    {category:'va',id:'danamon',name:'Danamon Virtual Account',provider:'doku',logo:'danamon.webp',fee:{rate:0,fixed:4000},feeId:'Rp4.000',feeEn:'Rp4,000'},
    {category:'va',id:'mandiri',name:'Mandiri Virtual Account',provider:'doku',logo:'mandiri.webp',fee:{rate:0,fixed:4000},feeId:'Rp4.000',feeEn:'Rp4,000'},
    {category:'va',id:'cimb',name:'CIMB Niaga Virtual Account',provider:'doku',logo:'cimb.webp',fee:{rate:0,fixed:4000},feeId:'Rp4.000',feeEn:'Rp4,000'},
    {category:'va',id:'bni',name:'BNI Virtual Account',provider:'doku',logo:'bni.webp',fee:{rate:0,fixed:4000},feeId:'Rp4.000',feeEn:'Rp4,000'},
    {category:'va',id:'bri',name:'BRI Virtual Account',provider:'doku',logo:'bri.webp',fee:{rate:0,fixed:4000},feeId:'Rp4.000',feeEn:'Rp4,000'},
    {category:'va',id:'bnc',name:'Bank Neo Commerce Virtual Account',provider:'doku',logo:'bnc.webp',fee:{rate:0,fixed:4000},feeId:'Rp4.000',feeEn:'Rp4,000'},
    {category:'va',id:'btn',name:'BTN Virtual Account',provider:'doku',logo:'btn.webp',fee:{rate:0,fixed:4000},feeId:'Rp4.000',feeEn:'Rp4,000'},
    {category:'va',id:'maybank',name:'Maybank Virtual Account',provider:'doku',logo:'maybank.webp',fee:{rate:0,fixed:4000},feeId:'Rp4.000',feeEn:'Rp4,000'},
    {category:'va',id:'sinarmas',name:'Bank Sinarmas Virtual Account',provider:'doku',logo:'sinarmas.webp',fee:{rate:0,fixed:4000},feeId:'Rp4.000',feeEn:'Rp4,000'},
    {category:'va',id:'seabank',name:'SeaBank Virtual Account',provider:'midtrans',logo:'seabank.webp',fee:{rate:0,fixed:4000},feeId:'Rp4.000',feeEn:'Rp4,000'},

    {category:'card',id:'card',name:'Credit / Debit Card',provider:'midtrans',logos:['visa.webp','mastercard.webp','amex.svg','jcb.webp','unionpay.svg'],fee:{rate:.029,fixed:2000},feeId:'2,9% + Rp2.000',feeEn:'2.9% + Rp2,000'},
    {category:'store',id:'alfa',name:'Alfa Group',provider:'doku',logo:'alfa.webp',fee:{rate:0,fixed:5000},feeId:'Rp5.000',feeEn:'Rp5,000'},
    {category:'store',id:'indomaret',name:'Indomaret',provider:'doku',logo:'indomaret.webp',fee:{rate:0,fixed:6500},feeId:'Rp6.500',feeEn:'Rp6,500'},
    {category:'ewallet',id:'gopay',name:'GoPay',provider:'midtrans',logo:'gopay.webp',fee:{rate:.02,fixed:0},feeId:'2%',feeEn:'2%'}
  ];

  const CATEGORIES=[
    {id:'qris',label:'QRIS',method:'qris',preview:['qris.webp']},
    {id:'va',label:'Virtual Accounts',expandable:true,preview:['permata.webp','mandiri.webp','bni.webp','bsi.webp','cimb.webp']},
    {id:'card',label:'Credit / Debit Card',method:'card',preview:['visa.webp','mastercard.webp','amex.svg','jcb.webp','unionpay.svg']},
    {id:'store',label:'Convenience Store',expandable:true,preview:['alfa.webp','indomaret.webp']},
    {id:'ewallet',label:'GoPay',method:'gopay',preview:['gopay.webp']}
  ];

  document.body.classList.add('payment-method-preview-active');
  const root=document.getElementById('payment-method-preview');
  if(!root) return;
  root.hidden=false;

  const trigger=document.getElementById('payment-dropdown-trigger');
  const panel=document.getElementById('payment-dropdown-panel');
  const triggerVisual=document.getElementById('payment-trigger-visual');
  const triggerTitle=document.getElementById('payment-trigger-title');
  const triggerMeta=document.getElementById('payment-trigger-meta');
  const baseValue=document.getElementById('payment-base-value');
  const feeValue=document.getElementById('payment-fee-value');
  const totalValue=document.getElementById('payment-total-value');
  const input=document.getElementById('selected-payment-method');
  const payButton=document.getElementById('pay-button');
  let selected=null;
  let expandedCategory='';

  function money(value){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(value||0));}
  function calculateFee(method){return Math.round(PRODUCT_PRICE*method.fee.rate)+method.fee.fixed;}
  function isEnglish(){return document.documentElement.dataset.language==='en' || document.documentElement.lang==='en';}
  function feeLabel(method){return isEnglish()?method.feeEn:method.feeId;}
  function img(file,cls='payment-method-logo-image',alt=''){return '<img class="'+cls+'" src="'+ASSET+file+'" alt="'+alt.replace(/"/g,'&quot;')+'" loading="lazy">';}
  function methodVisual(method,compact=false){
    if(method.logos){
      return '<span class="payment-card-logos '+(compact?'is-compact':'')+'">'+method.logos.map(function(file){return img(file,'payment-card-logo','');}).join('')+'</span>';
    }
    return '<span class="payment-method-logo-box">'+img(method.logo,'payment-method-logo-image',method.name)+'</span>';
  }
  function previewVisual(files,total,single){
    const max=single?files.length:Math.min(files.length,5);
    const extra=Math.max(total-max,0);
    const logos=files.slice(0,max).map(function(file){return img(file,'payment-preview-logo','');}).join('');
    return '<span class="payment-preview-stack'+(single?' is-single':'')+'">'+logos+(extra?'<span class="payment-preview-more">+'+extra+'</span>':'')+'</span>';
  }
  function placeholder(){
    triggerTitle.textContent=isEnglish()?'Choose payment method':'Pilih metode pembayaran';
    triggerMeta.textContent=isEnglish()?'Choose a payment category first':'Pilih kategori pembayaran terlebih dahulu';
  }
  function groupMethods(categoryId){return METHODS.filter(function(method){return method.category===categoryId;});}
  function renderMethodOption(method,child){
    return '<button type="button" class="payment-method-option'+(child?' is-child':'')+'" role="option" aria-selected="'+String(selected?.id===method.id)+'" data-payment-method="'+method.id+'">'+
      methodVisual(method)+
      '<span class="payment-method-copy"><span class="payment-method-name">'+method.name+'</span></span>'+
      '<span class="payment-method-fee"><span>Service Fee</span><strong>'+feeLabel(method)+'</strong></span></button>';
  }
  function renderPanel(){
    panel.innerHTML=CATEGORIES.map(function(category){
      const methods=category.expandable?groupMethods(category.id):[];
      const directMethod=category.method?METHODS.find(function(m){return m.id===category.method;}):null;
      const expanded=expandedCategory===category.id;
      const total=category.expandable?methods.length:1;
      const visual=category.expandable?previewVisual(category.preview,total,false):previewVisual(category.preview,category.preview.length,true);
      if(category.expandable){
        const children=methods.map(function(method){return renderMethodOption(method,true);}).join('');
        return '<div class="payment-category-group">'+
          '<button type="button" class="payment-category-option" data-payment-category="'+category.id+'" aria-expanded="'+String(expanded)+'">'+
            '<span class="payment-category-copy"><strong>'+category.label+'</strong><span class="payment-category-preview">'+visual+'</span></span>'+
            '<span class="payment-category-chevron" aria-hidden="true">⌄</span></button>'+
          '<div class="payment-category-children" '+(expanded?'':'hidden')+'>'+children+'</div></div>';
      }
      return '<button type="button" class="payment-category-option is-direct" data-payment-method="'+directMethod.id+'" role="option" aria-selected="'+String(selected?.id===directMethod.id)+'">'+
        '<span class="payment-category-copy"><strong>'+category.label+'</strong><span class="payment-category-preview">'+visual+'</span></span>'+
        '<span class="payment-category-arrow" aria-hidden="true">›</span></button>';
    }).join('');
  }
  function selectMethod(method,options){
    const opts=options||{};
    selected=method;
    input.value=method.id;
    triggerVisual.innerHTML=methodVisual(method,true);
    triggerVisual.hidden=false;
    triggerTitle.textContent=method.name;
    triggerMeta.textContent='Service Fee · '+feeLabel(method);
    const fee=calculateFee(method);
    if(baseValue) baseValue.textContent=money(PRODUCT_PRICE);
    feeValue.textContent=money(fee);
    totalValue.textContent=money(PRODUCT_PRICE+fee);
    payButton.disabled=false;
    renderPanel();
    if(opts.close!==false) closePanel();
    if(opts.emit!==false){
      document.dispatchEvent(new CustomEvent('payment-method-change',{detail:{method:method.id,provider:method.provider,fee:fee,total:PRODUCT_PRICE+fee}}));
    }
  }
  function openPanel(){panel.hidden=false;trigger.setAttribute('aria-expanded','true');renderPanel();}
  function closePanel(){panel.hidden=true;trigger.setAttribute('aria-expanded','false');expandedCategory='';}

  trigger.addEventListener('click',function(){panel.hidden?openPanel():closePanel();});
  panel.addEventListener('click',function(event){
    const categoryButton=event.target.closest('[data-payment-category]');
    if(categoryButton){
      const id=categoryButton.dataset.paymentCategory;
      expandedCategory=expandedCategory===id?'':id;
      renderPanel();
      return;
    }
    const button=event.target.closest('[data-payment-method]');
    if(!button)return;
    const method=METHODS.find(function(item){return item.id===button.dataset.paymentMethod;});
    if(method)selectMethod(method);
  });
  document.addEventListener('pointerdown',function(event){if(!root.contains(event.target))closePanel();});
  document.addEventListener('keydown',function(event){if(event.key==='Escape')closePanel();});
  document.addEventListener('commerce-language-change',function(){if(selected)selectMethod(selected,{close:false,emit:false});else{placeholder();renderPanel();}});

  if(baseValue) baseValue.textContent=money(PRODUCT_PRICE);
  feeValue.textContent='—';
  totalValue.textContent=money(PRODUCT_PRICE);
  payButton.disabled=true;
  placeholder();
  renderPanel();

  try{
    const saved=JSON.parse(localStorage.getItem('maulCheckout:'+PRODUCT_ID)||'null');
    const savedMethod=METHODS.find(function(item){return item.id===saved?.payment_method_id;});
    if(savedMethod && saved?.status!=='SUCCESS' && saved?.status!=='EXPIRED') selectMethod(savedMethod,{close:false,emit:false});
  }catch(_){ }

  window.MauldigitalPaymentSelector={
    isActive:true,
    getSelected:function(){return selected;},
    getMethod:function(id){return METHODS.find(function(item){return item.id===id;})||null;},
    selectById:function(id,options){const method=METHODS.find(function(item){return item.id===id;});if(method)selectMethod(method,options);return method||null;},
    calculateFee:calculateFee
  };
})();
