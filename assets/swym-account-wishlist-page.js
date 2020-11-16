

var productCardMarkup = `

{{#products}}
   <tr class="wishlist-container text-center">
       <td class="wishlist-selected p-4 ">
        <input type="checkbox" name="" value="{{epi}}" data-product-id="{{empi}}" data-url="{{du}}" data-title="{{dt}}">
       </td>
       <td class="p-4 ">
           <img class="max-w-100px" src="{{iu}}" data-variant-id="{{epi}}" />
       </td>
       <td class="p-4 ">
           <p>{{ct}}</p>
       </td>
       <td class="p-4 ">
         <a class="max-w-100px" href="{{du}}">
             <span class="visually-hidden">{{dt}}</span>
         </a>
       </td>
       <td class="p-4 "> 
           <p class="variantinfo">{{variantinfo}}</p>
       </td>
       <td class="p-4 ">
           <p>{{pr}}</p>
       </td>
       <td class="p-4 ">
           <p class="wspc">In Stock</p>
       </td>
   </tr>
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
 var wishlistContentsContainer = document.getElementById("account-wishlist-items-container");

 _swat.fetchWrtEventTypeET(
   function(products) {
     // Get wishlist items
     var formattedWishlistedProducts = products.map(function(p){
       p = SwymUtils.formatProductPrice(p);    // formats product price and adds currency to product Object
       p.isInCart = _swat.platform.isInDeviceCart(p.epi) || (p.et == _swat.EventTypes.addToCart);
       p.variantinfo = (p.variants ? getVariantInfo(p.variants) : "");
       return p;  console.log(p)
     });productCardsMarkup
    
 
       
     var productCardsMarkup = SwymUtils.renderTemplateString(productCardMarkup, {products: formattedWishlistedProducts});
     wishlistContentsContainer.innerHTML = productCardsMarkup;

     wishlistContentsContainer.innerHTML = wishlistContentsContainer.innerHTML.replace('<p class="variantinfo"></p>', 'N/A');
 
//       attachClickListeners();

     attachDelButton();

     attachAddToCartButton();

   },
   
   window._swat.EventTypes.addToWishList
 );
}
   
   
if(!window.SwymCallbacks){
 window.SwymCallbacks = [];
}

window.SwymCallbacks.push(swymCallbackFn);


setTimeout(function(){ 
  //   SELECT ALL ITEMS IN WISHLIST
  $('.wl-selectall').click(function(){
    $('.wishlist-selected input[type=checkbox]').prop('checked', true);
  })

  //   DESELECT ALL ITEMS IN WISHLIST 
  $('.wl-deselectall').click(function(){
    $('.wishlist-selected input[type=checkbox]').prop('checked', false);
  })   
}, 1000);

function attachDelButton(){
  // DELETE SELECTED ITEMS IN WISHLIST
  $(".wl-delete").click(function(e){ 
    $.each($(".wishlist-selected input[type=checkbox]:checked"), function(){
      var variantId = $(this).val();
          
      window._swat.removeFromWishList(
        {
          "epi": variantId
        },
        function(r) {
          location.reload();
        }
      );
    });
  });
}

function attachAddToCartButton(){

  $(".wl-addtobag").click(function(e){

    var cartObj = "",
        total = $(".wishlist-selected input[type=checkbox]:checked").length,
        result = null,
        OOSValidate = "";

      // INCLUDE THIS IF BUFFER NEEDED
        // var bsMinus = 5;
        // var regMinus = 3;
        // var noMinus = 0;
        // var subStk = 0;
      // END INCLUDE THIS IF BUFFER NEEDED

    var totalStk = 0;
    
    $.each($(".wishlist-selected input[type=checkbox]:checked"), function(index){
      var variantId = $(this).val(),
          productId = $(this).data('product-id'),
          productUrl = $(this).data('url'),
          cartData = "updates["+variantId+"]=1",
          totalstock = 0;

      let $t = $(this),
          url = $t.data('url') + '?view=variantjson'

          // MINUS PRODUCT INCART QUANTITY
            // incartQty = $('.mini-shopping-cart-wrapper').children('.mini-cart-products[data-incartid="'+variantId+'"]').data('incart');
            // incartQty = (isNaN(incartQty) ? 0 : incartQty); 
          // END OF MINUS PRODUCT INCART QUANTITY


      if (index === total - 1) {
        cartObj+= cartData
      } else {
        cartObj+= (cartData + "&") 
      }
      

      
      $.ajax({
        url: url,
        method: "GET",
        success: function(data){
          let obj = JSON.parse(data);
          // totalstock = obj[variantId] - incartQty;
          totalstock = obj[variantId];
          var pTags = obj.product_tag;

          totalStk = totalstock;

          // FOR BUFFER WITH SPECIFIC TAG
            // if(pTags.indexOf('Bestseller') > -1) {
            //   totalStk = totalstock - bsMinus;
            // }else if(pTags.indexOf('regular') > -1){
            //   totalStk = totalstock - regMinus;
            // }else{
            //   totalStk = totalstock - noMinus;
            // }
          // END BUFFER WITH SPECIFIC TAG

          // OUT OF STOCK VALIDATOR
            if(totalStk < 1 ){
              OOSValidate +=false + " ";
            }else{
              OOSValidate +=true + " ";
            }
          // END OUT OF STOCK VALIDATOR


        }
      }); 
    });    

    setTimeout(function(){
      if(OOSValidate.includes("false")){
        alert('please uncheck out of stock items')
      } else {

        jQuery.post('/cart/update.js', cartObj);

        // REMOVING ITEM AFTER ADD TO CART
          // $.each($(".wishlist-selected input[type=checkbox]:checked"), function(index){
          //   var removeId = $(this).val();

          //   window._swat.removeFromWishList(
          //     {
          //       "epi": removeId
          //     },
          //     function(r) {

          //     }
          //   );
          // });
        // END OF REMOVING ITEM AFTER ADD TO CART

        // RELOAD AFTER ADD TO CART
        setTimeout(function(){
          // window.location.reload();
          window.location = 'https://lookatme.com.ph/cart'
        }, 1000);
        // END OF RELOAD AFTER ADD TO CART

      }
    }, 1000);

  });
}


function forOutOfStock(){
  $('#account-wishlist-items-container tr input').each(function(i,e){
    let $t = $(this),
        url = $t.data('url') + '?view=variantjson',
        variantId = $(this).val();

    
    // var bsMinus = 5;
    // var regMinus = 3;
    // var noMinus = 0;
    // var subStk = 0;
    var totalStk = 0;
    
    // var incartQty = $('.mini-shopping-cart-wrapper').children('.mini-cart-products[data-incartid="'+variantId+'"]').data('incart');
    // incartQty = (isNaN(incartQty) ? 0 : incartQty);
    
    
    
    $.ajax({
      url: url,
      method: "GET",
      success: function(data){
        let obj = JSON.parse(data);
        // var totalstock = obj[variantId] - incartQty;
        var totalstock = obj[variantId];
        var pTags = obj.product_tag;
        
        totalStk = totalstock;
        
        // if(pTags.indexOf('Bestseller') > -1) {
        //   totalStk = totalstock - bsMinus;
        // }else if(pTags.indexOf('regular') > -1){
        //   totalStk = totalstock - regMinus;
        // }else{
        //   totalStk = totalstock - noMinus;
        // }

        if(totalStk < 1){
          $t.closest('.wishlist-container').find('.wspc').empty().append("Out of Stock");
        }
      }
    });  

  });
};

window.addEventListener('load', function() {
  setTimeout(function(){ 
    forOutOfStock(); 
  }, 1000);
  
})