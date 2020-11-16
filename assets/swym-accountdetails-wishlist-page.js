

var productCardMarkup = `

{{#products}}
<div class="w-full product-card">
  <div class="flex mxmd:flex-wrap mb-10 md:px-3 lg:px-6 collection-list mxmd:px-2">
    <div class="w-1/5 mxmd:w-2/5 p-2 relative  grid-list-image">
      <span class="absolute right-0 validator">
      </span>
      <a href="{{du}}" class="grid-link">
        <img class="border border-gray" src="{{iu}}" alt="">
      </a>
    </div>
    <div class="w-2/5 mxmd:w-3/5">
      <a href="/products/{{itemHandle}}" class="grid-link">
        <p class="text-lg font-extrabold uppercase grid-link__vendor mxmd:text-smbase">{{bt}}</p>
        <p class="my-2 text-sm grid-link__title">{{dt}}</p>
        <p class="text-sm font-extrabold grid-link__title">{{pr}}</p>
        <div class="mt-2 overflow-hidden hulkapps-reviews" style="max-height: 20px">
          <div class="item-reviews" data-product-id="{{product.id}}"></div>
        </div>
      </a>
    </div>
    <div class="w-2/5 mxmd:w-full add-to-cart text-center p-2" data-id="{{epi}}">
      <div class="w-4/5 mxmd:flex mxmd:w-full">
        <button class="w-full mxmd:w-2/5 mxmd:mr-4 mxmd:mb-0 mb-2 p-1 text-smbase bg-black text-white ad-wl-add-btn" >ADD TO CART</button>
        <button class="w-full mxmd:w-2/5 p-1 text-smbase bg-white text-black ad-wl-remove-btn border" >REMOVE</button>
      </div>
    </div>

  </div>
</div>
{{/products}}


`;


function getVariantInfo(variants){
 try {
   let variantKeys = ((variants && variants != "[]") ? Object.keys(JSON.parse(variants)[0]) : []) , variantinfo;
   if(variantKeys.length > 0){
     variantinfo = variantKeys[0];
     if(variantinfo == "Default Title"){
       variantinfo = "";
     }
   } else {
     variantinfo = "";
   }
   return variantinfo;
 } catch(err){
   return variants;
 }  
}


function swymCallbackFn(){
 // gets called once Swym is ready
 var wishlistContentsContainer = document.getElementById("accountdetails-wishlist-items-container");

 _swat.fetchWrtEventTypeET(
   function(products) {
     console.log(products)
     // Get wishlist items
     var formattedWishlistedProducts = products.map(function(p){
       p = SwymUtils.formatProductPrice(p);    // formats product price and adds currency to product Object
       p.isInCart = _swat.platform.isInDeviceCart(p.epi) || (p.et == _swat.EventTypes.addToCart);
       p.variantinfo = (p.variants ? getVariantInfo(p.variants) : "");
       return p;  console.log(p)
     });productCardsMarkup
    
 
       
     var productCardsMarkup = SwymUtils.renderTemplateString(productCardMarkup, {products: formattedWishlistedProducts});
     wishlistContentsContainer.innerHTML = productCardsMarkup;

    //  wishlistContentsContainer.innerHTML = wishlistContentsContainer.innerHTML.replace('<p class="variantinfo"></p>', 'N/A');
 
//       attachClickListeners();

     attachDelButton();

     attachAddToCartButton();

   },window._swat.EventTypes.addToWishList);
}
   
   
if(!window.SwymCallbacks){
 window.SwymCallbacks = [];
}


window.SwymCallbacks.push(swymCallbackFn);

function attachAddToCartButton(){
  $('.ad-wl-add-btn').click(function(e){
    var $variantId = $(this).closest('.add-to-cart').data('id');
    jQuery.ajax({
      type: 'POST',
      url: '/cart/add.js',
      data: {
        quantity: 1,
        id: $variantId
      },
      dataType: 'json',           
      success: function() {
        setTimeout(function(){
          window.location = 'https://lookatme.com.ph/cart'
        }, 1000);
      }
    });  
  })
};


function attachDelButton(){
  // DELETE SELECTED ITEMS IN WISHLIST
  $(".ad-wl-remove-btn").click(function(e){
    var $variantId = $(this).closest('.add-to-cart').data('id');
    window._swat.removeFromWishList(
      {
        "epi": $variantId
      },
      function(r) {
        location.reload();
      }
    );
  });
}







