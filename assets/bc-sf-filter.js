// Override Settings
var bcSfFilterSettings = {
    general: {
        limit: 30,
        /* Optional */
        // loadProductFirst: true,
      	showLimitList: '30,60'
    },
  	selector: {
      	bottomShowLimit: '#bc-sf-filter-bottom-show-limit'
    }
};


// Declare Templates
var bcSfFilterTemplate = {
    'soldOutClass': 'sold-out',
    'soldOutOverlayClass': 'oos-overlay',
    'saleClass': 'on-sale',
    'soldOutLabelHtml': '<div>' + bcSfFilterConfig.label.sold_out + '</div>',
    'saleLabelHtml': '<div>' + bcSfFilterConfig.label.sale + '</div>',
    'vendorHtml': '<div>{{itemVendorLabel}}</div>',

    // Grid Template
    'productGridItemHtml': '<div class="w-3/10 mb-10 collection-list mxmd:w-48/100 ml-3/100 mxmd:m-0">' +
                                '<div class="{{soldOutClass}} {{saleClass}}">' +
                                    '<div class="grid-list-image relative">' +
                                        '<span class="validator absolute right-0">' +
                                            '{{itemSaleLabel}}' +
                                        '</span>' +
                                        '{{productbadge}}'+
                                        '{{itemSoldOutLabel}}' +
                                        '<a href="/products/{{itemHandle}}" class="grid-link">' +
                                            '<img src="{{itemThumbUrl}}" alt="{{itemTitle}}" />' +
                                        '</a>' +
                                        '{{productButton}}'+
                                    '</div>' +
                                    '<a href="/products/{{itemHandle}}" class="grid-link">' +
                                    '{{itemeyebrows}}'+
                                    '<p class="grid-link__vendor">{{itemVendor}}</p>' +
                                    '<p class="grid-link__title">{{itemTitle}}</p>' +
                                    '<p class="grid-link__title">{{itemPrice}}</p>' +
                                    '<div class="hulkapps-reviews"><div class="item-reviews" data-product-id="{{itemId}}"></div></div>'+
                                    '</a>' +
                                '</div>' +
                            '</div>',

    // Pagination Template
    'previousActiveHtml': '<li><a href="{{itemUrl}}">&larr;</a></li>',
    'previousDisabledHtml': '<li class="disabled"><span>&larr;</span></li>',
    'nextActiveHtml': '<li><a href="{{itemUrl}}">&rarr;</a></li>',
    'nextDisabledHtml': '<li class="disabled"><span>&rarr;</span></li>',
    'pageItemHtml': '<li><a href="{{itemUrl}}">{{itemTitle}}</a></li>',
    'pageItemSelectedHtml': '<li class="bg-black text-white"><span class="active">{{itemTitle}}</span></li>',
    'pageItemRemainHtml': '<li><span>{{itemTitle}}</span></li>',
    'paginateHtml': '<ul class="pagination-custom">{{previous}}{{pageItems}}{{next}}</ul>',
  
    // Sorting Template
    'sortingHtml': '<label class="label--hidden pr-2">' + bcSfFilterConfig.label.sorting + '</label><select class="collection-sort__input">{{sortingItems}}</select>',
  	'showLimitHtml': 'View <select name="items-count" id="">{{showLimitItems}}</select>'
};

/************************** BUILD PRODUCT LIST **************************/

// Build Product Grid Item
BCSfFilter.prototype.buildProductGridItem = function(data, index) {
    console.log(data.tags)
    /*** Prepare data ***/
    var images = data.images_info;
    data.price_min *= 100, data.price_max *= 100, data.compare_at_price_min *= 100, data.compare_at_price_max *= 100;
     // Displaying price base on the policy of Shopify, have to multiple by 100
    var soldOut = !data.available; // Check a product is out of stock
    var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    var priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0];
    if (getParam('variant') !== null && getParam('variant') != '') {
        var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant'); });
        if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
        for (var i = 0; i < data['variants'].length; i++) {
            if (data['variants'][i].available) {
                firstVariant = data['variants'][i];
                break;
            }
        }
    }
    /*** End Prepare data ***/

    // Get Template
    var itemHtml = bcSfFilterTemplate.productGridItemHtml;

    // Add Thumbnail
    var prodNoImg = $('#Collection').data('noimg');
    // var itemThumbUrl = images.length > 0 ? this.optimizeImage(images[0]['src']) : bcSfFilterConfig.general.no_image_url;
    var itemThumbUrl = images.length > 0 ? this.optimizeImage(images[0]['src']) : prodNoImg;
    itemHtml = itemHtml.replace(/{{itemThumbUrl}}/g, itemThumbUrl);

    // Add Price
    // var itemPriceHtml = '';
    // if (data.title != '')  {
    //     itemPriceHtml += '<p class="grid-link__meta">';
    //     if (onSale) {
    //         itemPriceHtml += '<s class="grid-link__sale_price">' + this.formatMoney(data.compare_at_price_min) + '</s> ';
    //     }
    //     if (priceVaries) {
    //         if(bcSfFilterConfig.label.from_price != undefined){
    //             itemPriceHtml += (bcSfFilterConfig.label.from_price).replace(/{{ price }}/g, this.formatMoney(data.price_min));
    //         }
    //     } else {
    //         itemPriceHtml += this.formatMoney(data.price_min);
    //     }
    //     itemPriceHtml += '</p>';
    // }
    
    // itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);


    var itemPriceHtml = '';
    if (data.title != '')  {
      itemPriceHtml += '<p class="grid-link__meta font-bold">';
      if (onSale) {
        var pmax = (data.compare_at_price_min) / 1000;
        var pmin = (data.price_min) / 1000;
        var perDis =((pmax - pmin) * 100) / pmax;
        var perDisRound = Math.round(perDis);
  
        itemPriceHtml += 
        // '<span class="percent-discount" style="color: red;">'+ perDisRound + "% OFF" +'</span>' + 
        '<s class="grid-link__sale_price font-bold">' + this.formatMoney(data.compare_at_price_min) + '</s> ';
  
        if (priceVaries) {
          if(bcSfFilterConfig.label.from_price != undefined){
            itemPriceHtml += '<span class="s-price font-bold" style="color: red; padding-left: 5px;">' (bcSfFilterConfig.label.from_price).replace(/{{ price }}/g, this.formatMoney(data.price_min)) +'</span>' ;
          }else {
            itemPriceHtml += '<span class="s-price font-bold" style="color: red; padding-left: 5px;">' + this.formatMoney(data.price_min)  +'</span>' ;
          }
        }else{
          itemPriceHtml +=  '<span class="s-price font-bold" style="color: red; padding-left: 5px;">' + this.formatMoney(data.price_min) + '</span>';
        }
  
      }
      else {
        itemPriceHtml +=  this.formatMoney(data.price_min);
      }
      itemPriceHtml += '</p>';
    }
  
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);

    // Add soldOut class
    var soldOutClass = soldOut ? bcSfFilterTemplate.soldOutClass : '';
    itemHtml = itemHtml.replace(/{{soldOutClass}}/g, soldOutClass);

    // Add soldOutOverlay class
    var soldOutOverlayClass = soldOut ? bcSfFilterTemplate.soldOutOverlayClass : '';
    itemHtml = itemHtml.replace(/{{soldOutOverlayClass}}/g, soldOutOverlayClass);
  
    // Add onSale class
    var saleClass = onSale ? bcSfFilterTemplate.saleClass : '';
    itemHtml = itemHtml.replace(/{{saleClass}}/g, saleClass);
  
    // Add soldOut Label
 
    // var itemSoldOutLabelHtml = soldOut ? bcSfFilterTemplate.soldOutLabelHtml : '';
    // itemHtml = itemHtml.replace(/{{itemSoldOutLabel}}/g, itemSoldOutLabelHtml);

  

    var datePublished = new Date(data.published_at);
        datePublished.setDate(datePublished.getDate()+30);
    var dateNow = new Date();

    var eyeBrows = '';
    if(data.product_type == 'Eyebrows'){
        if(Date.parse(datePublished) > Date.parse(dateNow)){
            eyeBrows += '<span class="block badge text-secondary mb-10px uppercase text-10px font-bold tracking-wide">New</span>'
        }else if(data.tags.indexOf('Exclusive') > -1 ){
            eyeBrows += '<span class="block badge text-secondary mb-10px uppercase text-10px font-bold tracking-wide">'+
            '<svg width="200" height="12" viewBox="0 0 200 12" class="fill-current" xmlns="http://www.w3.org/2000/svg">'+
            '<path d="M5.2047 4.07294H1.97922V0.00421143H0.298096V5.60839H5.2047V4.07294Z" fill="#F0B2AA"/>'+
            '<path d="M9.87715 7.0014C9.87476 6.99592 9.86519 6.98949 9.86065 6.99009C9.85709 6.9912 9.85384 6.99312 9.85117 6.99571C9.84849 6.99829 9.84645 7.00146 9.84523 7.00497C9.84076 7.01809 9.83925 7.03203 9.8408 7.0458C9.84977 7.09223 9.86089 7.1383 9.87165 7.18437C9.87433 7.19339 9.87761 7.20221 9.88145 7.2108C9.88315 7.20922 9.8847 7.20751 9.88612 7.20568C9.88875 7.20018 9.89107 7.19454 9.89305 7.18878C9.90568 7.14867 9.9079 7.10604 9.89951 7.06485C9.89418 7.04302 9.88669 7.02176 9.87715 7.0014Z"/>'+
            '<path d="M8.70313 8.15648C8.68604 8.22969 8.70242 8.29672 8.74247 8.36088C8.74367 8.35826 8.74462 8.35719 8.74462 8.35612C8.75081 8.29451 8.74583 8.23229 8.72991 8.17243C8.7296 8.16943 8.72859 8.16655 8.72696 8.164C8.72534 8.16146 8.72314 8.15933 8.72054 8.15778C8.71794 8.15623 8.71501 8.15531 8.71199 8.15508C8.70897 8.15486 8.70594 8.15534 8.70313 8.15648Z"/>'+
            '<path d="M8.8561 8.98825L11.4386 6.39545H9.3286L7.76787 7.96458V6.39545H6.25854V11.9997H7.76787V10.0039L9.62821 12H11.6801L8.8561 8.98825ZM9.17138 7.524C9.1778 7.52225 9.1846 7.52237 9.19096 7.52435C9.19732 7.52634 9.20297 7.5301 9.20724 7.53519C9.21162 7.54063 9.21531 7.54659 9.21824 7.55292C9.24215 7.60947 9.27802 7.65899 9.3121 7.70959C9.33721 7.74681 9.36235 7.78399 9.38754 7.82113C9.38993 7.82471 9.39256 7.82816 9.39507 7.83161L9.39866 7.83078C9.39651 7.81578 9.39543 7.80054 9.3922 7.78566C9.3818 7.73614 9.36961 7.68661 9.37164 7.6359C9.37389 7.59376 9.3786 7.55178 9.38575 7.51019C9.39175 7.48254 9.40802 7.45818 9.4313 7.44197C9.44576 7.43007 9.47434 7.43376 9.49538 7.44769C9.52503 7.46721 9.54321 7.49662 9.56389 7.52424C9.5707 7.53364 9.5768 7.54352 9.58529 7.5565C9.58948 7.54614 9.59306 7.539 9.59533 7.5315C9.59964 7.51733 9.60394 7.50305 9.60729 7.48864C9.61333 7.46382 9.62777 7.44184 9.64818 7.42638C9.65661 7.41995 9.66667 7.416 9.67723 7.41497C9.6878 7.41394 9.69844 7.41587 9.70796 7.42055C9.72847 7.4289 9.74843 7.43852 9.76774 7.44936C9.797 7.46517 9.82887 7.47565 9.86183 7.48031C9.90786 7.48709 9.9295 7.46197 9.94325 7.42209C9.94715 7.41453 9.94788 7.40573 9.94528 7.39764C9.94268 7.38954 9.93697 7.38279 9.92938 7.37888C9.88156 7.34579 9.85514 7.29555 9.83374 7.24293C9.8085 7.18296 9.79265 7.11948 9.78675 7.05472C9.7843 7.03628 9.78564 7.01753 9.7907 6.99963C9.79576 6.98172 9.80442 6.96502 9.81616 6.95056C9.82087 6.94466 9.82672 6.93977 9.83336 6.93615C9.83999 6.93253 9.84729 6.93027 9.85481 6.92949C9.86234 6.92872 9.86995 6.92944 9.87719 6.93163C9.88443 6.93382 9.89116 6.93742 9.89698 6.94222C9.92604 6.96389 9.93716 6.99496 9.94481 7.02841C9.9628 7.10671 9.95548 7.18867 9.92388 7.26257C9.92125 7.26706 9.9201 7.27225 9.92059 7.27742C9.92109 7.28259 9.9232 7.28747 9.92663 7.29138C9.93899 7.30759 9.95267 7.32276 9.96752 7.33674C9.97192 7.34098 9.97723 7.34416 9.98304 7.34606C9.98886 7.34795 9.99503 7.3485 10.0011 7.34766C10.0072 7.34682 10.0129 7.34462 10.018 7.34122C10.0231 7.33783 10.0273 7.33332 10.0304 7.32805C10.0416 7.31363 10.05 7.29723 10.0552 7.27972C10.0718 7.21174 10.0872 7.14329 10.1008 7.0746C10.1153 7.00198 10.1268 6.92889 10.14 6.85603C10.1433 6.83841 10.1532 6.82889 10.164 6.83008C10.1713 6.83164 10.1778 6.83572 10.1824 6.84159C10.187 6.84747 10.1894 6.85477 10.1892 6.86222C10.1884 6.87701 10.1866 6.89173 10.1838 6.90627C10.1636 7.01853 10.1439 7.13091 10.122 7.24281C10.1164 7.28 10.1031 7.31562 10.083 7.34745C10.0638 7.37531 10.0411 7.39912 10.0036 7.40483C10.0051 7.43106 9.99815 7.45708 9.98378 7.47912C9.957 7.51947 9.91695 7.53328 9.87104 7.53412C9.82262 7.53495 9.77838 7.51864 9.73558 7.4984C9.72362 7.49269 9.7125 7.48578 9.70055 7.48043C9.6801 7.47138 9.66815 7.47685 9.66169 7.49804C9.6465 7.54791 9.64436 7.60081 9.65547 7.65173C9.65781 7.6619 9.65957 7.6722 9.66073 7.68257C9.66217 7.70018 9.65679 7.70995 9.64447 7.71483C9.638 7.71694 9.63102 7.71693 9.62456 7.71479C9.6181 7.71264 9.6125 7.70848 9.60861 7.70292C9.59533 7.68471 9.58326 7.66542 9.57118 7.64638C9.5511 7.61471 9.53257 7.58209 9.5114 7.55114C9.5003 7.53609 9.48755 7.52231 9.47338 7.51007C9.45856 7.49626 9.4478 7.49971 9.4417 7.51888C9.4263 7.56365 9.42179 7.61143 9.42855 7.65828C9.43955 7.72518 9.45413 7.79161 9.4698 7.85768C9.4808 7.90375 9.49718 7.94851 9.50949 7.99435C9.51326 8.00705 9.51326 8.02057 9.50949 8.03327C9.50839 8.03739 9.50614 8.04111 9.503 8.04401C9.49986 8.0469 9.49596 8.04885 9.49175 8.04963C9.48754 8.0504 9.4832 8.04997 9.47923 8.04838C9.47526 8.04679 9.47182 8.04411 9.46932 8.04065C9.45027 8.0192 9.43281 7.9964 9.41707 7.97244C9.34095 7.8572 9.26523 7.74165 9.18991 7.62578C9.17933 7.60829 9.16987 7.59016 9.16157 7.5715C9.15881 7.56554 9.1575 7.55901 9.15775 7.55245C9.15751 7.54114 9.15763 7.529 9.17138 7.52424V7.524ZM8.80959 8.27398C8.80716 8.28228 8.80541 8.29076 8.80433 8.29934C8.80433 8.31934 8.80564 8.33946 8.80433 8.35886C8.80352 8.37922 8.80063 8.39944 8.79572 8.41922C8.794 8.42615 8.79055 8.43253 8.78569 8.43778C8.78083 8.44303 8.77472 8.44697 8.76792 8.44924C8.76112 8.45151 8.75386 8.45203 8.74681 8.45075C8.73975 8.44948 8.73314 8.44645 8.72757 8.44196C8.71862 8.43566 8.71112 8.42755 8.70557 8.41815C8.66584 8.35327 8.64265 8.27971 8.63802 8.20386C8.63661 8.18601 8.63921 8.16807 8.64564 8.15135C8.65207 8.13463 8.66217 8.11954 8.6752 8.1072C8.67676 8.10577 8.67819 8.10351 8.6801 8.10291C8.70473 8.09434 8.72936 8.08565 8.75423 8.07768C8.75657 8.07665 8.7591 8.07614 8.76166 8.0762C8.76421 8.07626 8.76672 8.07688 8.769 8.07802C8.77129 8.07916 8.77329 8.08078 8.77487 8.08278C8.77645 8.08478 8.77757 8.0871 8.77814 8.08958C8.79608 8.12791 8.81401 8.16613 8.83386 8.20339C8.84426 8.22201 8.85626 8.23969 8.86973 8.25624C8.88085 8.27053 8.89149 8.26958 8.90045 8.25386C8.90588 8.24344 8.9099 8.23236 8.91241 8.22089C8.92619 8.15832 8.93321 8.09447 8.93333 8.03042C8.93398 8.00757 8.92765 7.98507 8.91516 7.96589C8.86829 7.88982 8.82286 7.81292 8.77671 7.73649C8.7693 7.72459 8.76081 7.71268 8.75148 7.69876C8.7479 7.70376 8.74515 7.70721 8.74275 7.71066C8.71047 7.75983 8.67915 7.80959 8.64543 7.8578C8.63097 7.87621 8.61497 7.89338 8.59761 7.90911C8.59163 7.91506 8.5829 7.92101 8.57549 7.91435C8.57207 7.91178 8.5692 7.90855 8.56706 7.90486C8.56492 7.90116 8.56355 7.89707 8.56303 7.89284C8.56252 7.8886 8.56287 7.8843 8.56407 7.88021C8.56526 7.87611 8.56728 7.87229 8.56999 7.86899C8.61638 7.79566 8.66313 7.7226 8.71023 7.64983C8.71288 7.64646 8.71439 7.64234 8.71454 7.63806C8.71469 7.63378 8.71348 7.62957 8.71107 7.62602C8.67795 7.56412 8.64484 7.50233 8.61255 7.44007C8.6006 7.41626 8.58996 7.39102 8.57944 7.36614C8.57646 7.35978 8.57593 7.35256 8.57796 7.34584C8.57999 7.33912 8.58443 7.33338 8.59044 7.32971C8.59609 7.32664 8.60272 7.32582 8.60896 7.32744C8.6152 7.32905 8.62059 7.33297 8.62403 7.33841C8.63118 7.34774 8.63739 7.35774 8.64256 7.36829C8.67317 7.42709 8.7033 7.4859 8.73379 7.54483C8.73558 7.54828 8.7377 7.55155 8.74012 7.55459C8.75112 7.56816 8.75758 7.56935 8.76786 7.55531C8.79333 7.52054 8.81724 7.48471 8.84139 7.44912C8.87475 7.40007 8.90763 7.35079 8.94086 7.30174C8.94391 7.29712 8.94838 7.29362 8.95359 7.29175C8.95881 7.28988 8.9645 7.28975 8.9698 7.29138C8.97469 7.29239 8.97899 7.29528 8.98174 7.29943C8.9845 7.30358 8.98549 7.30865 8.9845 7.31352C8.98367 7.32682 8.98005 7.3398 8.97386 7.35162C8.94624 7.39602 8.91671 7.43924 8.88814 7.48257C8.85669 7.53078 8.82537 7.579 8.79476 7.62769C8.79313 7.63078 8.79217 7.63418 8.79197 7.63768C8.79176 7.64117 8.79231 7.64466 8.79357 7.64792C8.80827 7.67697 8.82322 7.70614 8.84008 7.73399C8.9136 7.85554 8.98594 7.97792 9.06258 8.09744C9.11494 8.17922 9.17389 8.25672 9.22996 8.33612C9.24048 8.35112 9.25172 8.36553 9.26236 8.38041C9.26562 8.386 9.267 8.39248 9.26629 8.39891C9.26558 8.40534 9.26282 8.41137 9.25841 8.41612C9.25671 8.41816 9.25462 8.41985 9.25225 8.42108C9.24989 8.42231 9.24731 8.42306 9.24465 8.4233C9.24199 8.42353 9.23932 8.42324 9.23678 8.42243C9.23423 8.42163 9.23188 8.42034 9.22984 8.41862C9.21946 8.41089 9.21017 8.4018 9.20222 8.3916C9.12551 8.29654 9.05522 8.19652 8.9918 8.0922C8.99048 8.09018 8.98881 8.08827 8.98522 8.08339C8.98522 8.0941 8.98438 8.10172 8.98391 8.10934C8.97984 8.17232 8.97195 8.23422 8.9423 8.29148C8.92173 8.33172 8.87774 8.34077 8.84414 8.31065C8.83254 8.3016 8.82274 8.28898 8.80959 8.2747V8.27398Z"/>'+
            '<path d="M2.74867 6.38501C1.18173 6.38501 0 7.58856 0 9.18436C0 10.7802 1.18173 11.9838 2.74867 11.9838C4.31562 11.9838 5.49735 10.7803 5.49735 9.18436C5.49735 7.58844 4.31562 6.38501 2.74867 6.38501ZM2.74867 10.5783C2.02869 10.5783 1.46472 9.96601 1.46472 9.18436C1.46472 8.40271 2.02869 7.79058 2.74867 7.79058C3.46866 7.79058 4.03262 8.40283 4.03262 9.18436C4.03262 9.9659 3.46866 10.5787 2.74867 10.5787V10.5783Z"/>'+
            '<path d="M8.66591 5.5993C10.233 5.5993 11.4147 4.39587 11.4147 2.79995C11.4147 1.20403 10.233 0 8.66591 0C7.09884 0 5.91736 1.20343 5.91736 2.79935C5.91736 4.39527 7.09896 5.5993 8.66591 5.5993ZM8.66591 1.40604C9.38602 1.40604 9.94998 2.0183 9.94998 2.79995C9.94998 3.5816 9.38602 4.19325 8.66591 4.19325C7.9458 4.19325 7.3822 3.58089 7.3822 2.79935C7.3822 2.01782 7.94592 1.40545 8.66591 1.40545V1.40604Z"/>'+
            '<path d="M16.6475 2.88H21.5575V4.09H18.1675V5.77H21.3475V6.99H18.1675V8.79H21.5575V10H16.6475V2.88ZM31.375 10H29.555L27.775 7.54L25.995 10H24.175L26.885 6.39L24.255 2.88H26.075L27.775 5.25L29.495 2.88H31.315L28.655 6.39L31.375 10ZM37.4777 10.09C36.7577 10.09 36.1277 9.94 35.5877 9.64C35.0544 9.33333 34.6444 8.90667 34.3577 8.36C34.0711 7.80667 33.9277 7.16333 33.9277 6.43C33.9277 5.70333 34.0711 5.06667 34.3577 4.52C34.6444 3.96667 35.0544 3.54 35.5877 3.24C36.1277 2.94 36.7577 2.79 37.4777 2.79C37.9511 2.79 38.4011 2.86333 38.8277 3.01C39.2611 3.15 39.6144 3.35 39.8877 3.61L39.3977 4.73C39.0777 4.49 38.7644 4.31667 38.4577 4.21C38.1577 4.09667 37.8411 4.04 37.5077 4.04C36.8677 4.04 36.3777 4.24333 36.0377 4.65C35.6977 5.05667 35.5277 5.65 35.5277 6.43C35.5277 7.21667 35.6977 7.81667 36.0377 8.23C36.3777 8.63667 36.8677 8.84 37.5077 8.84C37.8411 8.84 38.1577 8.78667 38.4577 8.68C38.7644 8.56667 39.0777 8.39 39.3977 8.15L39.8877 9.27C39.6144 9.53 39.2611 9.73333 38.8277 9.88C38.4011 10.02 37.9511 10.09 37.4777 10.09ZM43.4834 2.88H45.0434V8.73H48.2234V10H43.4834V2.88ZM54.3941 10.09C53.3941 10.09 52.6341 9.83333 52.1141 9.32C51.5941 8.80667 51.3341 8.05333 51.3341 7.06V2.88H52.8641V7.13C52.8641 7.69667 52.9941 8.13 53.2541 8.43C53.5207 8.72333 53.9007 8.87 54.3941 8.87C54.8874 8.87 55.2641 8.72333 55.5241 8.43C55.7841 8.13 55.9141 7.69667 55.9141 7.13V2.88H57.4541V7.06C57.4541 8.04667 57.1907 8.8 56.6641 9.32C56.1441 9.83333 55.3874 10.09 54.3941 10.09ZM63.825 10.09C63.285 10.09 62.765 10.02 62.265 9.88C61.7717 9.73333 61.3617 9.53 61.035 9.27L61.535 8.15C62.2217 8.63 62.9883 8.87 63.835 8.87C64.2883 8.87 64.635 8.8 64.875 8.66C65.1217 8.51333 65.245 8.31 65.245 8.05C65.245 7.82333 65.1317 7.64667 64.905 7.52C64.685 7.38667 64.295 7.26 63.735 7.14C63.1083 7.01333 62.6083 6.86 62.235 6.68C61.8683 6.49333 61.5983 6.27 61.425 6.01C61.2583 5.74333 61.175 5.41333 61.175 5.02C61.175 4.59333 61.2917 4.21 61.525 3.87C61.765 3.53 62.0983 3.26667 62.525 3.08C62.9517 2.88667 63.445 2.79 64.005 2.79C64.5117 2.79 64.9983 2.86333 65.465 3.01C65.9317 3.15667 66.305 3.35667 66.585 3.61L66.085 4.73C65.4583 4.25 64.7683 4.01 64.015 4.01C63.615 4.01 63.295 4.09 63.055 4.25C62.815 4.41 62.695 4.62667 62.695 4.9C62.695 5.06 62.7383 5.19333 62.825 5.3C62.9183 5.40667 63.0717 5.50333 63.285 5.59C63.4983 5.67 63.8017 5.75 64.195 5.83C65.1083 6.03 65.765 6.29 66.165 6.61C66.5717 6.93 66.775 7.36667 66.775 7.92C66.775 8.58667 66.515 9.11667 65.995 9.51C65.475 9.89667 64.7517 10.09 63.825 10.09ZM70.4073 2.88H71.9673V10H70.4073V2.88ZM82.6855 2.88L79.4855 10H78.2355L75.0355 2.88H76.6555L78.8755 8.05L81.1155 2.88H82.6855ZM85.7491 2.88H90.6591V4.09H87.2691V5.77H90.4491V6.99H87.2691V8.79H90.6591V10H85.7491V2.88Z"/>'+
            '</svg>'+
            '</span>'
        }else if(data.tags.indexOf('Brand Spotlight') > -1){
            eyeBrows += '<span class="block badge text-secondary mb-10px uppercase text-10px font-bold tracking-wide">Brand Spotlight</span>'
        }else if(data.tags.indexOf('Bestseller') > -1){
            eyeBrows += '<span class="block badge text-secondary mb-10px uppercase text-10px font-bold tracking-wide">Bestseller</span>'
        }

    }
    itemHtml = itemHtml.replace(/{{itemeyebrows}}/g, eyeBrows)


    var productBadge = '';
    if(data.tags.indexOf('Member Promo') > -1 ){
        productBadge += '<span class="rounded-full bg-primary text-white w-12 h-12 uppercase absolute top-0 left-0 text-8px flex justify-center items-center font-bold text-center">Member Promo</span>'
    }else if(data.tags.indexOf('Cruelty Free') > -1 ){
        productBadge += '<span class="rounded-full bg-primary text-white w-12 h-12 uppercase absolute top-0 left-0 text-8px flex justify-center items-center font-bold text-center">Cruelty Free</span>'
    }else if (data.tags.indexOf('Natural') > -1 ){
        productBadge += '<span class="rounded-full bg-primary text-white w-12 h-12 uppercase absolute top-0 left-0 text-8px flex justify-center items-center font-bold text-center">Natural</span>'
    }else if (data.tags.indexOf('Organic') > -1 ){
        productBadge += '<span class="rounded-full bg-primary text-white w-12 h-12 uppercase absolute top-0 left-0 text-8px flex justify-center items-center font-bold text-center">Natural</span>'
    }else if (data.tags.indexOf('Vegan') > -1 ){
        productBadge += '<span class="rounded-full bg-primary text-white w-12 h-12 uppercase absolute top-0 left-0 text-8px flex justify-center items-center font-bold text-center">Vegan</span>'
    }
    
    itemHtml = itemHtml.replace(/{{productbadge}}/g, productBadge)

    var imgSoldout = $('#Collection').data('soldimg');
    var imgoos = '<div class="uppercase tracking-wider overlay center top-0 right-0 text-center oos-label p-10px text-black text-10px oos-overlay"><span>Out of stock</span></div>'

    var imgforSoldout = soldOut ? imgoos : '';
    itemHtml = itemHtml.replace(/{{itemSoldOutLabel}}/g, imgforSoldout)
    
    // Add onSale Label
    var soldSpan = '<div class="bg-danger text-white uppercase text-sm font-medium px-2 py-1">SALE</div>'
    // var itemSaleLabelHtml = onSale ? bcSfFilterTemplate.saleLabelHtml : '';
    var itemSaleLabelHtml = onSale ? soldSpan : '';
    itemHtml = itemHtml.replace(/{{itemSaleLabel}}/g, itemSaleLabelHtml);

    // Add Vendor
    var itemVendorHtml = bcSfFilterConfig.custom.vendor_enable ? bcSfFilterTemplate.vendorHtml.replace(/{{itemVendorLabel}}/g, data.vendor) : '';
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, data.vendor);

    //First Variant ID
    // var firstVarId = data.variants[0].id;
    // itemHtml = itemHtml.replace(/{{firstVarId}}/g,  firstVarId);

    // Product Button Add / Wishlist
    var firstVarId = data.variants[0].id;
    var dataMasterId = data.id;
    var dataPrice = data.price_min/100;
    var dataUrl = 'https://lookatme.com.ph/product/'+data.handle+'';
    var dataTitle = data.title;

    // var dataSale = '';
    // if (onSale) {
    //     dataSale = (data.compare_at_price_min) / 100;
    // } else{
    //     dataSale = '';
    // }

    var productButton = '';
    if(soldOut){
        productButton = '<div class="collection-prod-btn add-to-wishlist hidden"><button class="button-add addtowishlist" data-title="'+dataTitle+'" data-id="'+firstVarId+'" data-url="'+dataUrl+'" data-img="'+itemThumbUrl+'" data-price="'+dataPrice+'" data-mid="'+dataMasterId+'">ADD TO WISHLIST</button></div>'
    }else{
        productButton =  '<div class="collection-prod-btn add-to-cart hidden"><button type="submit" class="button-add" data-id="'+firstVarId+'" data-action="addtobag-ajax" >ADD TO CART</button></div>'
    }
    
    itemHtml = itemHtml.replace(/{{productButton}}/g,  productButton);

    // Add main attribute (Always put at the end of this function)
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));

    return itemHtml;
};

// Build Product List Item
BCSfFilter.prototype.buildProductListItem = function(data) {
    // // Add Description
    // var itemDescription = jQ('<p>' + data.body_html + '</p>').text();
    // // Truncate by word
    // itemDescription = (itemDescription.split(" ")).length > 51 ? itemDescription.split(" ").splice(0, 51).join(" ") + '...' : itemDescription.split(" ").splice(0, 51).join(" ");
    // // Truncate by character
    // itemDescription = itemDescription.length > 350 ? itemDescription.substring(0, 350) + '...' : itemDescription.substring(0, 350);
    // itemHtml = itemHtml.replace(/{{itemDescription}}/g, itemDescription);
};

// Customize data to suit the data of Shopify API
BCSfFilter.prototype.prepareProductData = function(data) {
    for (var k in data) {
        // Add Options
        var optionsArr = [];
        for (var i in data[k]['options_with_values']) {
            optionsArr.push(data[k]['options_with_values'][i]['name']);
        }
        data[k]['options'] = optionsArr;

        // Customize variants
        for (var i in data[k]['variants']) {
            var variantOptionArr = [];
            var count = 1;
            var variant = data[k]['variants'][i];
            // Add Options
            var variantOptions = variant['merged_options'];
            if (Array.isArray(variantOptions)) {
                for (var j = 0; j < variantOptions.length; j++) {
                    var temp = variantOptions[j].split(':');
                    data[k]['variants'][i]['option' + (parseInt(j) + 1)] = temp[1];
                    data[k]['variants'][i]['option_' + temp[0]] = temp[1];
                    variantOptionArr.push(temp[1]);
                }
                data[k]['variants'][i]['options'] = variantOptionArr;
            }
            data[k]['variants'][i]['compare_at_price'] = parseFloat(data[k]['variants'][i]['compare_at_price']) * 100;
            data[k]['variants'][i]['price'] = parseFloat(data[k]['variants'][i]['price']) * 100;
        }

        // Add Description
        data[k]['description'] = data[k]['body_html'];
    }
    return data;
};

/************************** END BUILD PRODUCT LIST **************************/

// Build Pagination
BCSfFilter.prototype.buildPagination = function(totalProduct) {
    if (this.getSettingValue('general.paginationType') == 'default') {
        // Get page info
        var currentPage = parseInt(this.queryParams.page);
        var totalPage = Math.ceil(totalProduct / this.queryParams.limit);

        // If it has only one page, clear Pagination
        if (totalPage == 1) {
            jQ(this.selector.bottomPagination).html('');
            return false;
        }

        if (this.getSettingValue('general.paginationType') == 'default') {
            var paginationHtml = bcSfFilterTemplate.paginateHtml;

            // Build Previous
            var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousActiveHtml : bcSfFilterTemplate.previousDisabledHtml;
            previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage - 1));
            paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

            // Build Next
            var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextActiveHtml :  bcSfFilterTemplate.nextDisabledHtml;
            nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
            paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

            // Create page items array
            var beforeCurrentPageArr = [];
            for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
                beforeCurrentPageArr.unshift(iBefore);
            }
            if (currentPage - 4 > 0) {
                beforeCurrentPageArr.unshift('...');
            }
            if (currentPage - 4 >= 0) {
                beforeCurrentPageArr.unshift(1);
            }
            beforeCurrentPageArr.push(currentPage);

            var afterCurrentPageArr = [];
            for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
                afterCurrentPageArr.push(iAfter);
            }
            if (currentPage + 3 < totalPage) {
                afterCurrentPageArr.push('...');
            }
            if (currentPage + 3 <= totalPage) {
                afterCurrentPageArr.push(totalPage);
            }

            // Build page items
            var pageItemsHtml = '';
            var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
            for (var iPage = 0; iPage < pageArr.length; iPage++) {
                if (pageArr[iPage] == '...') {
                    pageItemsHtml += bcSfFilterTemplate.pageItemRemainHtml;
                } else {
                    pageItemsHtml += (pageArr[iPage] == currentPage) ? bcSfFilterTemplate.pageItemSelectedHtml : bcSfFilterTemplate.pageItemHtml;
                }
                pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
                pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, pageArr[iPage]));
            }
            paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);

            // jQ(this.selector.bottomPagination).html(paginationHtml);
            jQ(this.selector.pagination).html(paginationHtml);
        }
    }
};

/************************** BUILD TOOLBAR **************************/

// Build Sorting
BCSfFilter.prototype.buildFilterSorting = function() {
    if (bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
        jQ(this.selector.topSorting).html('');

        var sortingArr = this.getSortingList();
        if (sortingArr) {
            // Build content 
            var sortingItemsHtml = '';
            for (var k in sortingArr) {
                sortingItemsHtml += '<option value="' + k +'">' + sortingArr[k] + '</option>';
            }
            var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
            jQ(this.selector.topSorting).html(html);
            jQ('#bc-sf-filter-bottom-sorting').html(html);
            // Set current value
            jQ(this.selector.topSorting + ' select').val(this.queryParams.sort);
            jQ('#bc-sf-filter-bottom-sorting select').val(this.queryParams.sort);
        }
    }
};

BCSfFilter.prototype.buildSortingEvent = function() {
    var self = this;
    jQ(this.getSelector('topSorting') + ' select, #bc-sf-filter-bottom-sorting select').change(function(e) {
      onInteractWithToolbar(e, 'sort', self.queryParams.sort, jQ(this).val());
    })
};

BCSfFilter.prototype.buildFilterShowLimit = function () {
    if (bcSfFilterTemplate.hasOwnProperty('showLimitHtml')) {
        jQ(this.selector.topShowLimit, this.selector.bottomShowLimit).html('');
        var numberList = this.getSettingValue('general.showLimitList');
        if (numberList != '') {
            // Build content
            var showLimitItemsHtml = '';
            var arr = numberList.split(',');
            for (var k = 0; k < arr.length; k++) {
                showLimitItemsHtml += '<option value="' + arr[k].trim() + '">' + arr[k].trim() + '</option>';
            }
            var html = bcSfFilterTemplate.showLimitHtml.replace(/{{showLimitItems}}/g, showLimitItemsHtml);
            jQ(this.selector.topShowLimit).html(html);
          	jQ(this.selector.bottomShowLimit).html(html);
            // Set value
            jQ(this.selector.topShowLimit + ' select').val(this.queryParams.limit);
          	jQ(this.selector.bottomShowLimit + ' select').val(this.queryParams.limit);
        }
    }
};
// Build Show Limit event
BCSfFilter.prototype.buildShowLimitEvent = function() {
    var _this = this;
    jQ('.bc-sf-filter-show-limit select').change(function(e) {
        onInteractWithToolbar(e, 'limit', _this.queryParams.limit, jQ(this).val());
    })
};
  
/* #boost: Fix cross-site scrpt issue reported by partner */
BCSfFilter.prototype.buildFilterSelectionData = function(data) {
    function buildItem(template, title, label, clearLink) {
      	label = label.replace(/(<([^>]+)>)/gi, "");
	    title = title.replace(/(<([^>]+)>)/gi, "");
        template = template.replace(/{{itemType}}/g, title);
        template = template.replace(/{{itemLabel}}/g, label);
        template = template.replace(/{{itemLink}}/g, clearLink);
        return template;
    }

    var self = this;
    var selectionContent = '';
    var itemHtml = this.getSettingValue('general.refineByStyle') == 'style2' ? this.getTemplate('filterRefineItem2') : this.getTemplate('filterRefineItem');
    var options = data.filter.options;

    // Get all URL params: return all param keys start with "pf_"
    var paramKeys = Object.keys(self.queryParams);
    paramKeys = paramKeys.filter(function(key) {
        return key.indexOf('pf_') == 0
    });

    jQ.each(paramKeys, function(i, key) {
        var selectedOption = options.filter(function(e) { return e.filterOptionId == key })[0];
        if (typeof selectedOption !== 'undefined' && self.queryParams.hasOwnProperty(key) && self.queryParams[key] && self.queryParams[key].length) {
            var values = self.queryParams[key],
                fOId = selectedOption.filterOptionId,
                fType = selectedOption.filterType,
                fODisplayType = selectedOption.displayType,
                prefix = selectedOption.prefix,
                title = selectedOption.label;
            prefix = (typeof prefix !== 'undefined' && prefix !== null && prefix !== false) ? prefix.replace(/\\/g, '') : '';
            // Make sure values is an Array
            if (!Array.isArray(values)) values = [values];
            // Fix email campaign issue
            // values = values.map(function(value) {
            //     return value.toString().replace(/\+/g, '%20');
            // });
            if (fODisplayType == 'range') {
                /* RANGE SLIDER
                 *  - Is advanced range slider: Get first value and last value for min-max
                 *  - Is general range slider:  Split value by ":" to get min-max
                 **/
                var label = '';
                if ((fType.indexOf('price') == -1 && fType.indexOf('variants_price') == -1) && fType !== 'weight' && fType.indexOf('range_slider') == -1) {
                    // Return an Array of values
                    var rangeValues = []
                    if (selectedOption && selectedOption.hasOwnProperty('values')) {
                        rangeValues = selectedOption['values'].map(function(value) {
                            return value.key;
                        });
                    }
                    var currentLabels = rangeValues.length ? self.getAdvancedRangeSelectedValues(values, rangeValues) : [values[0], values[values.length - 1]];
                    label = currentLabels[0].toString().replace(prefix, '');
                    if (values.length > 1) {
                        label += ' - ' + currentLabels[1].toString().replace(prefix, '');
                    }
                    var clearLink = self.buildClearFilterOptionLink(fOId, title, values);
                } else {
                    var value = values[0],
                        elements = value.split(':');
                    if (fType == 'price' || fType == 'variants_price') {
                        var minPrice = self.formatMoney(elements[0] * 100),
                            maxPrice = self.formatMoney(elements[1] * 100);
                        if (self.getSettingValue('general.removePriceDecimal')) {
                            minPrice = self.removeDecimal(minPrice), maxPrice = self.removeDecimal(maxPrice);
                        }
                        label = minPrice + ' - ' + maxPrice;
                    } else {
                        label = elements[0] + ' - ' + elements[1];
                    }
                    var clearLink = self.buildClearFilterOptionLink(fOId, title, value);
                }
                selectionContent += buildItem(itemHtml, title, label, clearLink);
            } else {
                for (var i = 0; i < values.length; i++) {
                    var value = values[i],
                        label = value;
                    // Customize label
                    label = self.customizeFilterOptionLabel(label, prefix, fType);
                    var clearLink = self.buildClearFilterOptionLink(fOId, title, value);
                    // Remove the prefix in label
                    if (typeof prefix !== 'undefined' && prefix !== null && prefix !== false) {
                        prefix = prefix.replace(/\\/g, '');
                        value = value.replace(prefix, '').trim();
                    }

                    // console.log('fType', fType);
                    switch (fType) {
                        case 'price':
                        case 'variants_price':
                            label = self.getPriceLabel(value);
                            break;
                        case 'percent_sale':
                            label = self.getPercentSaleLabel(value);
                            break;
                        case 'stock':
                            label = (value === 'true') ? selectedOption.values[0].label : selectedOption.values[1].label;
                            break;
                        case 'review_ratings':
                            var showExactRating = selectedOption.hasOwnProperty('showExactRating') ? selectedOption.showExactRating : false;
                            label = self.getReviewRatingsLabel(value, showExactRating);
                            break;
                    }
                    selectionContent += buildItem(itemHtml, title, label, clearLink);
                }
            }
        }
    });

    var urlParam = window.location.search;
    if (urlParam !== '') {
        urlParam = urlParam.replace('?', '').replace(/(<([^>]+)>)/gi, "");
        var paramsArr = urlParam.split('&');
        if (paramsArr.indexOf('_=pf') !== -1) {
            paramsArr.splice(paramsArr.indexOf('_=pf'), 1);
        }
        if (jQ('#bc-sf-filter-params').length == 0) {
            jQ('body').append('<input type="hidden" id="bc-sf-filter-params" value="' + paramsArr.join('|') + '" />');
        } else {
            jQ('#bc-sf-filter-params').attr('value', paramsArr.join('|'));
        }
    }
    return selectionContent;
};

// Build Display type (List / Grid / Collage)
// BCSfFilter.prototype.buildFilterDisplayType = function() {
//     var itemHtml = '<a href="' + this.buildToolbarLink('display', 'list', 'grid') + '" title="Grid view" class="change-view bc-sf-filter-display-grid" data-view="grid"><span class="icon-fallback-text"><i class="fa fa-th" aria-hidden="true"></i><span class="fallback-text">Grid view</span></span></a>';
//     itemHtml += '<a href="' + this.buildToolbarLink('display', 'grid', 'list') + '" title="List view" class="change-view bc-sf-filter-display-list" data-view="list"><span class="icon-fallback-text"><i class="fa fa-list" aria-hidden="true"></i><span class="fallback-text">List view</span></span></a>';
//     jQ(this.selector.topDisplayType).html(itemHtml);

//     // Active current display type
//     jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-list').removeClass('active');
//     jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-grid').removeClass('active');
//     if (this.queryParams.display == 'list') {
//         jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-list').addClass('active');
//     } else if (this.queryParams.display == 'grid') {
//         jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-grid').addClass('active');
//     }
// };

/************************** END BUILD TOOLBAR **************************/

// Add additional feature for product list, used commonly in customizing product list
BCSfFilter.prototype.buildExtrasProductList = function(data, eventType) {};

// Build additional elements
BCSfFilter.prototype.buildAdditionalElements = function(data, eventType) {

    let addToBagAjaxBtn = document.querySelectorAll('[data-action="addtobag-ajax"]')

    function addToBagAjax(e) {
        e.preventDefault()
        let miniCart = document.querySelector('#mini_cart_popup'),
            cartIndicator = document.querySelectorAll('.cart_count_indicator'),
            id = this.dataset.id,
            qty = 1
        
        var addData = {
            'id': id,
            'quantity': qty
        };
    
    
        axios.post('/cart/add.js', addData)
        .then((response) => {
                axios({
                    method: 'get',
                    url: `/cart?view=json`,
                    headers: {
                        'X-Requested-With': ''
                    },
                    responseType: 'json'
                }).then(dataCart => {
                    cartIndicator.forEach(indicator => {
                        if(dataCart.data.item_count > 0){
                            indicator.classList.remove('hidden')
                            indicator.innerHTML = dataCart.data.item_count
                        }
                    });

                    console.log(dataCart.data)
    
                    // cartjson.state.dataCart.splice(0,1, dataCart.data)
                    miniCartGlobal.cartData.splice(0,1, dataCart.data)
                    // miniCartGlobal.cartData[0] =  dataCart.data
                    miniCart.classList.remove('hidden')
                    
                    console.log(cartjson)
    
                }).catch( (error) =>  {
                    console.log(error);
                });
        })
        .catch( (error) =>  {
            console.log(error);
        });        
    
        console.log(this.dataset)
    }
    
    addToBagAjaxBtn.forEach(button => {
        button.addEventListener('click', addToBagAjax)
    });

    $('.collection-list').hover(function(e){
        var $this = $(this)
        $this.find('.collection-prod-btn').fadeToggle()
    })

    var countResult = $('#result_count');
    if(countResult.length){
        if(data.total_product > 1){
            countResult.append(data.total_product + ' results for ')
        }else{
            countResult.append(data.total_product + ' result for ')
        }
    }

    var ymlt = $('#ymlt');
    if(ymlt.length){
        if(data.total_product > 0){
            ymlt.addClass('hidden');
        }
    }

//     $('.button-add').click(function(e){
//         var pid = $(this).parent().data('id');
//         console.log(pid)
//         jQuery.ajax({
//             type: 'POST',
//             url: '/cart/add.js',
//             data: {
//                 quantity: 1,
//                 id: pid
//             },
//             dataType: 'json',           
//             success: function() {
                
//             }
//         });  
//     });


    // window._swat.fetch( function(r) {
    // console.log(r);
    // });

    // var searchIcon = '<svg class="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">'+
    // '<path class="fill-current iconcolor" d="M17.7825 16.0096L17.3285 15.5557L17.2526 15.4797L17.2001 15.4273L16.8077 15.0384L12.8777 11.1682C13.8955 9.72408 14.3372 7.95186 14.1161 6.19902C13.8949 4.44618 13.027 2.83917 11.6824 1.69311C10.3378 0.547063 8.61359 -0.0553477 6.84785 0.0040029C5.08212 0.0633535 3.40225 0.780185 2.13765 2.01394C0.873053 3.24769 0.114967 4.90936 0.0120429 6.67309C-0.0908814 8.43682 0.46878 10.1754 1.58129 11.5479C2.69379 12.9203 4.27889 13.8277 6.02573 14.092C7.77258 14.3563 9.55517 13.9586 11.0239 12.9767L14.9792 16.8705L15.4259 17.3118L15.4711 17.357L15.9558 17.8399C16.2669 18.151 16.927 17.9954 17.4334 17.489C17.9398 16.9826 18.0935 16.3189 17.7825 16.0096ZM11.042 10.2223C11.0167 10.253 10.9914 10.2838 10.9642 10.3127C10.9118 10.3742 10.8594 10.4339 10.8033 10.4936L10.6333 10.6636C9.7022 11.5534 8.46329 12.0491 7.17534 12.0471C6.46226 12.0476 5.75729 11.8959 5.10752 11.6021C4.45775 11.3084 3.87815 10.8794 3.40745 10.3437C2.93674 9.80805 2.58577 9.17811 2.37797 8.49598C2.17018 7.81384 2.11035 7.09521 2.20249 6.38811C2.29462 5.681 2.5366 5.0017 2.91225 4.39558C3.2879 3.78947 3.78858 3.2705 4.38083 2.87335C4.97308 2.4762 5.64326 2.21002 6.34661 2.09258C7.04995 1.97513 7.77026 2.00914 8.45942 2.19233L8.64027 2.24479L8.77591 2.28819L8.97847 2.36233L9.05623 2.39308C9.14847 2.43106 9.23709 2.47085 9.32571 2.51245H9.34198C9.55236 2.61393 9.75541 2.72996 9.94966 2.85968L10.0003 2.89405C10.2223 3.04628 10.4315 3.21624 10.6261 3.40225C10.6839 3.45651 10.74 3.51438 10.7961 3.57225C10.8521 3.63013 10.9046 3.68981 10.957 3.75311L11.0348 3.84535C11.7749 4.74272 12.1797 5.86969 12.1797 7.03291C12.1797 8.19613 11.7749 9.3231 11.0348 10.2205L11.042 10.2223Z"></path>'+
    // '</svg>'

    // $('.bc-sf-filter-option-show-search-box-wrapper').append('<div class="absolute bciconsearch">'+searchIcon+'</div>')

    $('.addtowishlist').click(function(e){
        e.preventDefault();
        var $this = $(this),
            // heartIcon = $this.children().children(),
            wishId = $this.data('id'),
            wishUrl = $this.data('url'),
            // wishCount = $this.data('count'),
            wishImg = $this.data('img'),
            wishPrice = $this.data('price'),
            wishMid = $this.data('mid');
            wishTitle = $this.data('title');

        window._swat.addToWishList(
          {
            "epi": wishId,
            "du": wishUrl,
            "empi": wishMid,
            "iu" : wishImg,
            "pr": wishPrice,
            "dt": wishTitle
          },
          function(r) {
            console.log('added to wishlist')
          }
        );
      });
};

/* Begin patch detect bad url */
BCSfFilter.prototype.initFilter=function(){this.isBadUrl()?window.location.href=window.location.pathname:(this.updateApiParams(!1),this.getFilterData("init"))},BCSfFilter.prototype.isBadUrl=function(){try{var t=decodeURIComponent(window.location.search).split("&"),e=!1;if(t.length>0)for(var a=0;a<t.length;a++){var n=t[a],i=(n.match(/</g)||[]).length,r=(n.match(/>/g)||[]).length,o=(n.match(/alert\(/g)||[]).length,h=(n.match(/on[A-Za-z]+=/g)||[]).length,l=(n.match(/execCommand/g)||[]).length;if(i>0&&r>0||i>1||r>1||o||h||l){e=!0;break}}return e}catch(t){return!0}};
/* End patch detect bad url */