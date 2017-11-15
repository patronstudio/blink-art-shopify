/* ALL THE SCRIPTS IN THIS FILE ARE MADE BY KROWNTHEMES.COM --- REDISTRIBUTION IS NOT ALLOWED! */

$(window).bind('pageshow', function(event) {
  if (event.originalEvent.persisted) {
    window.location.reload();
  }
});

$.ajaxSetup({ cache: false });

// Start with PRODUCT JS

/* ----
	Define equals prototype
	---- */

if ($('body').hasClass('template-product')) {
  if (Array.prototype.equals)
    console.warn(
      "Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code."
    );

  Array.prototype.equals = function(array) {
    // if the other array is a falsy value, return
    if (!array) return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length) return false;

    for (var i = 0, l = this.length; i < l; i++) {
      // Check if we have nested arrays
      if (this[i] instanceof Array && array[i] instanceof Array) {
        // recurse into the nested arrays
        if (!this[i].equals(array[i])) return false;
      } else if (this[i] != array[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;
      }
    }
    return true;
  };
  // Hide method from for-in loops
  Object.defineProperty(Array.prototype, 'equals', { enumerable: false });

  /* ----
		GET query
		---- */

  function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  /* ----
		Money currency format
		---- */

  window.theme = window.theme || {};
  theme.Currency = (function() {
    var moneyFormat = '${{amount}}'; // eslint-disable-line camelcase

    function formatMoney(cents, format) {
      if (typeof cents === 'string') {
        cents = cents.replace('.', '');
      }
      var value = '';
      var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
      var formatString = format || moneyFormat;

      function formatWithDelimiters(number, precision, thousands, decimal) {
        if (precision != undefined) {
          precision = precision;
        } else {
          precision = 2;
        }

        thousands = thousands || ',';
        decimal = decimal || '.';

        if (isNaN(number) || number == null) {
          return 0;
        }

        number = (number / 100.0).toFixed(precision);

        var parts = number.split('.');
        var dollarsAmount = parts[0].replace(
          /(\d)(?=(\d\d\d)+(?!\d))/g,
          '$1' + thousands
        );
        var centsAmount = parts[1] ? decimal + parts[1] : '';

        return dollarsAmount + centsAmount;
      }

      switch (formatString.match(placeholderRegex)[1]) {
        case 'amount':
          value = formatWithDelimiters(cents, 2);
          break;
        case 'amount_no_decimals':
          value = formatWithDelimiters(cents, 0);
          break;
        case 'amount_with_comma_separator':
          value = formatWithDelimiters(cents, 2, '.', ',');
          break;
        case 'amount_no_decimals_with_comma_separator':
          value = formatWithDelimiters(cents, 0, '.', ',');
          break;
        case 'amount_no_decimals_with_space_separator':
          value = formatWithDelimiters(cents, 0, ' ');
          break;
      }

      return formatString.replace(placeholderRegex, value);
    }

    return {
      formatMoney: formatMoney
    };
  })();

  window.oldSelectFunctions = function() {
    var firstVariantEver = true;

    var $productGallery = $('.box__product-gallery');

    /* ----
			Get current variant
			---- */

    function getVariant() {
      var optionArray = [];

      $('form select.product-variants').each(function() {
        optionArray.push(
          $(this)
            .find(':selected')
            .val()
        );
      });

      return optionArray;
    }

    /* ----
			Init form fields
			---- */

    var productSingleObject = JSON.parse(
        document.getElementById('ProductJson').innerHTML
      ),
      productVariants = productSingleObject.variants;

    $('form select.product-variants').on('change', function(e) {
      initVariantChange(false);
    });

    initVariantChange(true);

    /* ----
			Variant change
			---- */

    function initVariantChange(firstTime) {
      var variant = null,
        options = getVariant();

      productSingleObject.variants.forEach(function(el) {
        if ($(el)[0].options.equals(options)) {
          variant = $(el)[0];
        }
      });

      selectCallback(variant);

      if (!firstTime) {
        updateVariantState(variant);
      }
    }

    function updateVariantState(variant) {
      if (!history.pushState || !variant) {
        return;
      }

      var newurl =
        window.location.protocol +
        '//' +
        window.location.host +
        window.location.pathname +
        '?variant=' +
        variant.id;
      window.history.replaceState({ path: newurl }, '', newurl);
    }

    /* ----
			Actual select callback
			---- */

    function selectCallback(variant) {
      var $addToCart = $('#addToCart'),
        $productPrice = $('#productPrice'),
        $comparePrice = $('#comparePrice'),
        $quantityElements = $('.quantity-selector, label + .js-qty'),
        $addToCartText = $('#addToCartText'),
        $featuredImage = $('#productPhotoImg');

      if (variant) {
        // Set cart value id

        $('#productSelect')
          .find('option[value="' + variant.id + '"]')
          .prop('selected', true);

        // Swipe to variant slide

        if (variant.featured_image != null) {
          var variantImg = $productGallery.find(
            '.gallery-item[data-variant-img="' +
              variant.featured_image.id +
              '"]'
          );

          if (typeof VIG !== 'undefined') {
            VIG.switchImages(
              productSingleObject.id,
              variant.id,
              '.box__product-gallery .site-box-content'
            );

            if (
              $('.box__product-gallery .site-box-content').hasClass(
                'flickity-enabled'
              )
            ) {
              setTimeout(function() {
                $('.box__product-gallery .gallery-item').each(function() {
                  $(this).removeClass('remove-from-flick');
                  if ($(this).css('display') == 'none') {
                    $(this).addClass('remove-from-flick');
                  }
                });

                window.CUBER.Product.productFlkty.reloadCells();
                window.CUBER.Product.productFlkty.reposition();
              }, 1000);
            }
          } else if (
            $productGallery.hasClass('scroll') &&
            variantImg.length > 0 &&
            $(window).width() > 1024
          ) {
            if (firstVariantEver) {
              //window.blockStickyHeader = true;
              firstVariantEver = false;
              //THIS$(window).scrollTop(variantImg.offset().top);
              setTimeout(function() {
                $('.gallery-index .current').html(variantImg.data('index') + 1);
              }, 10);
            } else {
              //window.blockStickyHeader = true;
              /*$('html, body').animate({'scrollTop': variantImg.offset().top}, 350, function(){
								//window.blockStickyHeader = false;
	 							$('.gallery-index .current').html(variantImg.data('index')+1)
							});*/

              if ($(window).scrollTop() > 0) {
                $('html, body')
                  .stop()
                  .animate({ scrollTop: 0 }, 150, function() {
                    $(window).off('scroll.to-junk');
                  });
              }
            }

            // Default is to prependTo so the variant is shown at top
            // Our custom logic hides the our variants if it is not the "default" (first) option
            variantImg.show();
            variantImg.prependTo($('.box__product-gallery .site-box-content'));
            if (productSingleObject.variants[0].id === variant.id) {
              variantImg.siblings('.gallery-item').show();
              $('.gallery-index').show();
            } else {
              variantImg.siblings('.gallery-item').hide();
              $('.gallery-index').hide();
            }
          } else if (window.CUBER != undefined && variantImg.length > 0) {
            if (
              window.CUBER.Product.productFlkty != undefined &&
              variantImg.data('index') !=
                window.CUBER.Product.productFlkty.selectedElement
            ) {
              window.CUBER.Product.productFlkty.select(
                variantImg.data('index')
              );
            } else {
              window.CuberProductImageIndex = variantImg.data('index');
            }
          }
        }

        // Disable other variants

        if ($('#add-to-cart').hasClass('style--minimal')) {
          $('.product-variant li').each(function() {
            $(this).removeClass('active');
            if (
              variant.option1 == $(this).data('text') ||
              variant.option2 == $(this).data('text') ||
              variant.option3 == $(this).data('text')
            ) {
              $(this).addClass('active');
            }
          });
        }

        // Edit cart buttons based on stock

        var $variantQuantity = $('#variantQuantity');

        if (
          variant.inventory_management == 'shopify' ||
          variant.inventory_management == 'amazon_marketplace_web' ||
          variant.inventory_management == null
        ) {
          if (variant.available) {
            if (variant.inventory_quantity == 1) {
              $variantQuantity.text(window.product_words_one_product);
            } else if (variant.inventory_quantity <= 5) {
              $variantQuantity.text(
                window.product_words_few_products.replace(
                  '{{ count }}',
                  variant.inventory_quantity
                )
              );
            } else {
              $variantQuantity.text('');
            }
            $quantityElements.prop('max', variant.inventory_quantity);

            if (
              variant.inventory_management == null ||
              variant.inventory_policy == 'continue'
            ) {
              $quantityElements.prop('max', 999);
            }

            if (variant.inventory_management == null) {
              $variantQuantity.text('');
            }

            if (
              variant.inventory_policy == 'continue' &&
              variant.inventory_quantity <= 0
            ) {
              $variantQuantity.text(window.product_words_preorder);
            }

            $addToCart.removeClass('disabled').prop('disabled', false);
            $addToCartText.text(window.product_words_add_to_cart_button);
            $quantityElements.show();
          } else {
            $variantQuantity.text(window.product_words_no_products);
            $addToCart.addClass('disabled').prop('disabled', true);
            $addToCartText.text(window.product_words_sold_out_variant);
            $quantityElements.hide();
          }

          $quantityElements.on('keyup', function() {
            if (
              $quantityElements.prop('max') != undefined &&
              parseInt($quantityElements.val()) >
                parseInt($quantityElements.prop('max'))
            ) {
              $quantityElements.val($quantityElements.prop('max'));
            }
          });
        }

        // Update price

        $productPrice.html(
          theme.Currency.formatMoney(variant.price, window.shop_money_format)
        );
        if (variant.compare_at_price > variant.price) {
          $comparePrice
            .html(
              theme.Currency.formatMoney(
                variant.compare_at_price,
                window.shop_money_format
              )
            )
            .show();
        } else {
          $comparePrice.hide();
        }
      } else {
        // Disable variant completely

        $addToCart.addClass('disabled').prop('disabled', true);
        $addToCartText.text(window.product_words_unavailable_variant);
        $quantityElements.hide();
      }
    }

    /* ----
			Final adjustments
		---- */

    if ($('#add-to-cart').hasClass('style--classic')) {
      $('select.product-variants:not(.styled)').each(function() {
        $(this)
          .styledSelect({
            coverClass: 'regular-select-cover',
            innerClass: 'regular-select-inner'
          })
          .addClass('styled');

        $(this)
          .parent()
          .append($.themeAssets.arrowDown);

        $(this)
          .on('focusin', function() {
            $(this)
              .parent()
              .addClass('focus');
          })
          .on('focusout', function() {
            $(this)
              .parent()
              .removeClass('focus');
          });
      });

      $('.product-variant').removeClass('hidden');
    }

    if (
      productSingleObject.variants.length == 1 &&
      productSingleObject.variants[0].title.indexOf('Default') >= 0
    ) {
      $('.product-variant').hide();
    }

    if ($('#add-to-cart').hasClass('style--minimal')) {
      var i = 1;

      $('.product-variant').each(function() {
        var color = returnColorVariant(
            $(this)
              .find('label')
              .text()
          )
            ? true
            : false,
          varDOM = '<ul class="color-' + color + '">';

        $(this)
          .find('.product-variants option')
          .each(function() {
            varDOM +=
              '<li' +
              ($(this).is(':selected') ? ' class="active"' : '') +
              ' tabindex="0" data-text="' +
              $(this).val() +
              '"><span' +
              (color
                ? ' style="background-color: ' +
                  $(this)
                    .val()
                    .split(' ')
                    .pop() +
                  '"'
                : '') +
              '>' +
              $(this).val() +
              '</span></li>';
          });

        varDOM += '</ul>';
        $(this)
          .find('select')
          .hide();
        $(this).append(varDOM);

        $(this).removeClass('hidden');

        $(this)
          .find('ul li')
          .on('click', function() {
            $(this)
              .parent()
              .parent()
              .find('select')
              .val(
                $(this)
                  .find('span')
                  .text()
              )
              .change();
          });

        $(this)
          .find('ul li')
          .on('keyup', function(e) {
            if (e.keyCode == 13) {
              $(this)
                .parent()
                .parent()
                .find('select')
                .val(
                  $(this)
                    .find('span')
                    .text()
                )
                .change();
            }
          });
      });

      if (window.disableProductVariants) {
        $('.product-variant')
          .find('li')
          .addClass('disabled');
      }
    } else {
      if (window.disableProductVariants) {
        $('.product-variant').css('display', 'none');
      }
    }
  };

  $(document).on('ready', function() {
    window.oldSelectFunctions();
  });

  function returnColorVariant(text) {
    var betterText = text.toLowerCase();

    if (
      betterText.match(
        /(color)|(colour)|(couleur)|(farbe)|(colore)|(culoare)|(cor)/
      )
    ) {
      return true;
    } else {
      return false;
    }
  }
}

// CONTINUE WITH EVERYTHING ELSE

window.blockStickyHeader = false;

(function($) {
  $('#site-filters select:not(.styled)').each(function() {
    $(this)
      .styledSelect({
        coverClass: 'regular-select-cover',
        innerClass: 'regular-select-inner'
      })
      .addClass('styled');

    $(this)
      .parent()
      .append($.themeAssets.arrowDown);

    if ($(this).data('label') != '') {
      if (
        $(this)
          .find('option:selected')
          .hasClass('default')
      ) {
        $(this)
          .parent()
          .find('.regular-select-inner')
          .html($(this).data('label'));
      }

      $(this).on('change', function(e) {
        if (
          $(this)
            .find('option:selected')
            .hasClass('default')
        ) {
          $(this)
            .parent()
            .find('.regular-select-inner')
            .html($(this).data('label'));
        }
      });
    }
  });

  $('.site-header').append(
    '<span id="js-helpers"><span id="fix-me-header"></span><span id="fix-me-collection"></span></span>'
  );

  // tab navigation

  $('a:not(.ach), button, span, input')
    .on('focus', function(e) {
      $(this).addClass('hover');
    })
    .on('blur', function(e) {
      $(this).removeClass('hover');
    });

  $(document).keyup(function(e) {
    if (e.keyCode === 27) {
      $('.site-close-handle').trigger('click');
    }
  });

  // Collection social media. 
  // If links are added to the description with the social media titles they will output icons.
  if ( $('.template-collection').length > 0 ) {
    var $slideshow = $('.box__slideshow-item .site-box-content');

    var linkIcon = function(type) {
      switch (type) {
        case "twitter":
          return `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewbox="0 0 22 22" style="enable-background: new 0 0 22 22; width: 22px; height: 22px;" xml:space="preserve">
              <path d="M22,4.2c-0.8,0.4-1.7,0.6-2.6,0.7c0.9-0.6,1.6-1.4,2-2.5c-0.9,0.5-1.8,0.9-2.9,1.1c-0.8-0.9-2-1.4-3.3-1.4 c-2.5,0-4.5,2-4.5,4.5c0,0.4,0,0.7,0.1,1c-3.8-0.2-7.1-2-9.3-4.7C1.1,3.6,0.9,4.3,0.9,5.2c0,1.6,0.8,2.9,2,3.8c-0.7,0-1.4-0.2-2-0.6 c0,0,0,0,0,0.1c0,2.2,1.6,4,3.6,4.4C4.1,12.9,3.7,13,3.3,13c-0.3,0-0.6,0-0.8-0.1C3,14.7,4.7,16,6.7,16C5.1,17.3,3.2,18,1.1,18 c-0.4,0-0.7,0-1.1-0.1c2,1.3,4.4,2,6.9,2c8.3,0,12.8-6.9,12.8-12.8c0-0.2,0-0.4,0-0.6C20.6,5.9,21.4,5.1,22,4.2z"></path>
            </svg>`;
        case "instagram":
          return `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewbox="0 0 22 22" style="enable-background: new 0 0 22 22; width: 22px; height: 22px;" xml:space="preserve"> 
            <path d="M17.9,2H4.1C3,2,2,3,2,4.1v13.7C2,19,3,20,4.1,20h13.7c1.2,0,2.1-1,2.1-2.1V4.1C20,3,19,2,17.9,2z M15.5,4.3h1.7c0.3,0,0.6,0.3,0.6,0.6v1.7c0,0.3-0.3,0.6-0.6,0.6h-1.7c-0.3,0-0.6-0.3-0.6-0.6V4.8C14.9,4.5,15.2,4.3,15.5,4.3z M11,7.6c1.9,0,3.5,1.5,3.5,3.5c0,1.9-1.5,3.5-3.5,3.5c-1.9,0-3.5-1.5-3.5-3.5C7.6,9.1,9.1,7.6,11,7.6zM17.8,18.3H4.3c-0.3,0-0.6-0.3-0.6-0.6V9.3h2.3C5.6,9.7,5.5,10.5,5.5,11c0,3,2.5,5.5,5.5,5.5c3,0,5.5-2.5,5.5-5.5c0-0.5-0.1-1.3-0.4-1.7h2.3v8.4C18.3,18.1,18.1,18.3,17.8,18.3z"></path> 
          </svg>`;
        case "facebook":
          return `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewbox="0 0 22 22" style="enable-background: new 0 0 22 22; width: 22px; height: 22px;" xml:space="preserve"> 
            <path d="M19.3,2H2.8C2.3,2,2,2.3,2,2.7v16.5C2,19.7,2.3,20,2.8,20h8.8v-6.8H9.3v-2.8h2.3V8.2c0-2.3,1.5-3.5,3.5-3.5c1,0,1.8,0.1,2.1,0.1v2.4l-1.4,0c-1.1,0-1.4,0.5-1.4,1.3v1.9h2.8l-0.6,2.8h-2.3l0,6.8h4.8c0.4,0,0.8-0.3,0.8-0.8V2.7C20,2.3,19.7,2,19.3,2z"></path> 
          </svg>`;
        default:
          return false;
      }
    }

    var acceptedTitles = ['instagram', 'twitter', 'facebook'];
    var $links = $();
    $slideshow.find('a').each(function() {
      var title = $(this).attr('title');
      var icon = linkIcon(title);
      if (icon) {
        $(this).attr({ 'aria-label': title })
          .html('<span class="icon large" aria-hidden="true">' + icon + '</span>');
        $links = $links.add($(this));
      }
    });
    
    var $linksContainer = $('<div class="site-social" aria-label="Follow on social media" />');    
    $links.appendTo($linksContainer);
    $linksContainer.appendTo($slideshow);
  }

  // We start with the newsletter code (it needs to be wrapped inside a $(window).load() event function in order to get the perfect timeout after the site has completely loaded

  window.CUBER = {
    // MAIN

    Nav: {
      $siteHeader: null,
      $siteNav: null,
      $siteOverlay: null,

      mount: function() {
        this.$siteHeader = $('#site-header');
        this.$siteNav = $('#site-nav--mobile');
        this.$siteOverlay = $('#site-overlay');

        $('#site-menu-handle').on(
          'click focusin',
          function() {
            if (!this.$siteNav.hasClass('active')) {
              this.$siteNav.addClass('active');
              this.$siteNav
                .removeClass('show-filters')
                .removeClass('show-cart')
                .removeClass('show-search');

              this.$siteOverlay.addClass('active');

              $('.fixing-scroll-now .site-box-background').addClass(
                'sidebar-move'
              );
              $('body').addClass('sidebar-move');
            }
          }.bind(this)
        );

        if ($('#site-filter-handle').length > 0) {
          $('#site-filter-handle').on(
            'click',
            function() {
              if (!this.$siteNav.hasClass('active')) {
                this.$siteNav.addClass('active');
                this.$siteNav
                  .removeClass('show-cart')
                  .removeClass('show-search')
                  .addClass('show-filters');

                this.$siteOverlay.addClass('active');

                $('.fixing-scroll-now .site-box-background').addClass(
                  'sidebar-move'
                );
                $('body').addClass('sidebar-move');
              }
            }.bind(this)
          );
        }

        if ($('#site-cart-handle').length > 0 && !$('html').hasClass('ie9')) {
          if ($.themeCartSettings == 'overlay') {
            $('#site-cart-handle a').addClass('block-fade');

            $('#site-cart-handle a').on(
              'click',
              function(e) {
                e.preventDefault();

                if (!this.$siteNav.hasClass('active')) {
                  this.$siteNav.addClass('active');
                  this.$siteNav
                    .removeClass('show-filters')
                    .removeClass('show-search')
                    .addClass('show-cart');

                  this.$siteOverlay.addClass('active');

                  $('.fixing-scroll-now .site-box-background').addClass(
                    'sidebar-move'
                  );
                  $('body').addClass('sidebar-move');
                }
              }.bind(this)
            );
          }

          $('#site-cart-handle')
            .on('mouseenter focusis', function() {
              $(this)
                .addClass('hover-in')
                .removeClass('hover-out');
            })
            .on('mouseleave focusout', function() {
              $(this)
                .addClass('hover-out')
                .removeClass('hover-in');
            });
        }

        if ($('#site-search-handle').length > 0) {
          $('#site-search-handle a').addClass('block-fade');

          $('#site-search-handle a').on(
            'click',
            function(e) {
              e.preventDefault();

              if (!this.$siteNav.hasClass('active')) {
                if ($('html').hasClass('ie9')) {
                  document.location.href = '/search';
                } else {
                  this.$siteNav.addClass('active');
                  this.$siteNav
                    .removeClass('show-filters')
                    .removeClass('show-cart')
                    .addClass('show-search');

                  this.$siteOverlay.addClass('active');

                  $('.fixing-scroll-now .site-box-background').addClass(
                    'sidebar-move'
                  );
                  $('body').addClass('sidebar-move');

                  $('form.search-bar input[type="search"]').focus();
                }
              }
            }.bind(this)
          );

          $('#site-search-handle')
            .on('mouseenter', function() {
              $(this)
                .addClass('hover-in')
                .removeClass('hover-out');
            })
            .on('mouseleave focusout', function() {
              $(this)
                .addClass('hover-out')
                .removeClass('hover-in');
            });

          $('a[href="#search"]').on('click', function(e) {
            e.preventDefault();
            $('#site-search-handle a, .js-site-search').trigger('click');
          });
        }

        $('.site-close-handle, #site-overlay').on(
          'click',
          function() {
            if (this.$siteNav.hasClass('active')) {
              this.$siteNav.removeClass('active');
              this.$siteOverlay.removeClass('active');

              $('.fixing-scroll-now .site-box-background').removeClass(
                'sidebar-move'
              );
              $('body').removeClass('sidebar-move');
            }
          }.bind(this)
        );

        ///

        $('.site-nav.style--classic .has-submenu').each(function() {
          $(this)
            .on('mouseenter focusin', function() {
              $(this)
                .find('.submenu:not(.submenu--final)')
                .addClass('submenu--visible');
              $('body').addClass('opened-submenu');
              $('body').addClass('opened-submenu-flag');
              $('.site-overlay').addClass('active');
            })
            .on('mouseleave focusout', function() {
              $(this)
                .find('.submenu:not(.submenu--final)')
                .removeClass('submenu--visible');
              if (!$('body').hasClass('opened-submenu-flag')) {
                $('body').removeClass('opened-submenu');
              }
              $('.site-overlay').removeClass('active');
              $('body').removeClass('opened-submenu-flag');
            });
        });

        $(
          '.site-nav.style--classic .has-submenu .has-submenu'
        ).each(function() {
          $(this)
            .on('mouseenter focusin', function() {
              $(this)
                .find('.submenu--final')
                .stop()
                .slideDown(200);
              $('.site-overlay').addClass('active');
            })
            .on('mouseleave focusout', function() {
              $(this)
                .find('.submenu--final')
                .stop()
                .slideUp(200);
              $('.site-overlay').removeClass('active');
            });
        });

        $(
          '.site-nav.style--sidebar .has-submenu:not(.collections-menu)'
        ).each(function() {
          $(this)
            .children('a')
            .addClass('block-fade');
          $(this)
            .children('a')
            .on('click touchstart', function(e) {
              e.preventDefault();
            });

          $(this)
            .children('a')
            .on('click touchstart', function(e) {
              console.log('clicked');

              e.preventDefault();
              var $parent = $(this).parent();

              if ($parent.hasClass('active')) {
                $parent
                  .find('> .submenu')
                  .stop()
                  .slideUp(200);
                $parent.removeClass('active');
              } else {
                $parent.addClass('active');
                $parent
                  .find('> .submenu')
                  .stop()
                  .slideDown(200);
              }

              $(this).removeClass('hover');
            });
        });

        $(
          '.site-nav.style--sidebar .has-babymenu:not(.collections-menu)'
        ).each(function() {
          $(this)
            .children('a')
            .addClass('block-fade');
          $(this)
            .children('a')
            .on('click touchstart', function(e) {
              e.preventDefault();
            });

          $(this)
            .children('a')
            .on('click touchstart', function(e) {
              e.preventDefault();
              var $parent = $(this).parent();

              if ($parent.hasClass('active')) {
                if ($(this).attr('href') != '') {
                  if (
                    $(this)
                      .attr('href')
                      .indexOf('#') >= 0
                  ) {
                    $('.site-close-handle').trigger('click');
                    document.location.hash = $(this).attr('href');
                  } else if ($(this).attr('target') == '_blank') {
                    window.open($(this).attr('target'), '_blank');
                  } else {
                    $('body').fadeOut(200);
                    setTimeout(
                      function() {
                        document.location.href = $(this).attr('href');
                      }.bind(this),
                      200
                    );
                    e.preventDefault();
                  }
                }
              } else {
                $parent.addClass('active');
                $parent
                  .find('.babymenu')
                  .stop()
                  .slideDown(200);
              }
            });
        });

        $('.style--classic .babymenu').each(function() {
          var bestWidth = 0;
          $(this)
            .parent()
            .parent()
            .css('display', 'block');

          $(this)
            .find('a')
            .each(function() {
              $(this).css('position', 'fixed');
              $(this).attr('data-width', $(this).outerWidth(true));
              if ($(this).outerWidth() > bestWidth) {
                bestWidth = $(this).outerWidth(true);
              }
              $(this).css({ position: 'static', width: '100%' });
            });

          bestWidth += 30;
          $(this).css('width', bestWidth);
          $(this).css('transform', 'translateX(-45%)');
          $(this)
            .parent()
            .parent()
            .css('display', 'none');
          $(this).css('display', 'none');
        });

        $('.style--classic .has-babymenu').each(function() {
          $(this)
            .on('mouseenter focusin', function() {
              $(this)
                .find('.babymenu')
                .stop()
                .slideDown(200);
              $(this).css('zIndex', 99);
            })
            .on('mouseleave focusout', function() {
              $(this)
                .find('.babymenu')
                .stop()
                .slideUp(200);
              $(this).css('zIndex', 1);
            });
        });

        ///

        $('body').addClass('desktop--add-some-padding');

        // end -- */

        if ($('#site-header').hasClass('header-scroll')) {
          if ($('body').hasClass('template-index')) {
            $('body').addClass('index-margin-fix');
          }

          window.lst = $(window).scrollTop();

          $('.site-nav.style--classic .submenu').css(
            'top',
            $('.site-header').outerHeight()
          );

          $(window).on(
            'scroll.sticky-header',
            function() {
              if (!window.blockStickyHeader) {
                var st = $(window).scrollTop();

                if (st < 0 || Math.abs(lst - st) <= 5) return;

                if (st == 0) {
                  this.$siteHeader.removeClass('animate');
                  this.$siteHeader.removeClass('fix');
                  this.$siteHeader.removeClass('ready');
                  //$('body').css('paddingTop', 0);
                } else if (st <= lst && !this.$siteHeader.hasClass('fix')) {
                  this.$siteHeader.addClass('fix');
                  //$('body').css('paddingTop', this.$siteHeader.outerHeight());
                  setTimeout(
                    function() {
                      this.$siteHeader.addClass('ready');
                    }.bind(this),
                    5
                  );
                  setTimeout(
                    function() {
                      this.$siteHeader.addClass('animate');
                    }.bind(this),
                    25
                  );
                } else if (st > lst && this.$siteHeader.hasClass('animate')) {
                  this.$siteHeader.removeClass('animate');
                  setTimeout(
                    function() {
                      this.$siteHeader.removeClass('fix');
                      this.$siteHeader.removeClass('ready');
                      //$('body').css('paddingTop', 0);
                    }.bind(this),
                    105
                  );
                }

                window.lst = st;
              }
            }.bind(this)
          );
        }
      },

      unmount: function() {
        $('#site-menu-handle').off('click');
        $('#site-cart-handle a').off('click');
        $('#site-filter-handle').off('click');

        this.$siteNav.removeClass('active');
        this.$siteOverlay.removeClass('active');

        $('.fixing-scroll-now .site-box-background').removeClass(
          'sidebar-move'
        );
        $('body').removeClass('sidebar-move');

        $(window).off('scroll.sticky-header');
      }
    },

    // COLLECTION

    Collection: {
      $collectionGrid: null,
      $collectionNext: null,
      $collectionNextLink: null,

      mount: function() {
        if ($('.box__paginate').length > 0) {
          this.$collectionGrid = $('#section-collection');
          this.$collectionNext = $('.box__paginate');
          this.$collectionNextLink = $('.box__paginate a');

          this.$collectionNextLink.append(
            '<div class="preloader"><span>.</span><span>.</span><span>.</span></div>'
          );

          this.$collectionNextLink.on(
            'click',
            function(e) {
              this.$collectionNextLink.addClass('loading');
              var nextPageURL = this.$collectionNextLink.attr('href');

              $.ajax({
                url: nextPageURL
              }).done(
                function(data) {
                  this.$collectionNextLink.removeClass('loading');
                  this.$collectionNext.before(
                    $(data).find('.site-box.box__collection')
                  );
                  window.CUBER.Images.mount();

                  var i = 0;
                  this.$collectionGrid
                    .find('.box__collection:not(.active)')
                    .each(function() {
                      setTimeout(
                        function() {
                          $(this).addClass('active');
                        }.bind(this),
                        100 * i++
                      );
                    });

                  if ($(data).find('.site-box.box__paginate').length > 0) {
                    this.$collectionNextLink.attr(
                      'href',
                      $(data)
                        .find('.site-box.box__paginate a')
                        .attr('href')
                    );
                  } else {
                    this.$collectionNext.remove();
                  }
                }.bind(this)
              );

              e.preventDefault();
            }.bind(this)
          );
        }

        $(window)
          .on(
            'resize.collection-grid',
            window.debounce(
              function() {
                this._resizeCollection();
              }.bind(this),
              300
            )
          )
          .trigger('resize.collection-grid');
        this._resizeCollection();

        // empty grid fix

        var collectionSize = parseInt($('.box__heading').data('size'));

        if (collectionSize > 0 && collectionSize < 4) {
          for (var i = 0; i < 4 - collectionSize; i++) {
            $('#section-collection').append(
              '<div class="site-box box--small box--typo-small lap--hide box--no-padding box__collection active" />'
            );
          }
        }
      },

      _resizeCollection: function() {
        if (
          $('#fix-me-header').css('display') == 'block' &&
          $('#fix-me-collection').css('display') == 'block'
        ) {
          var h = $(window).height() - $('.site-header').outerHeight();

          if (h > 720) {
            //$('.mount-products .site-box.box__heading').attr('style', 'height:' + h + 'px !important; min-height: 0 !important;');
            $('.mount-products .site-box.box__collection_image').attr(
              'style',
              'height:' + h + 'px !important; min-height: 0 !important;'
            );
          } else {
            h = 720;

            if (
              $('.mount-products .site-box.box__collection_image').length > 0
            ) {
              $('.mount-products .site-box.box__heading').attr(
                'style',
                'height:' +
                  ($(window).height() - $('.site-header').outerHeight()) +
                  'px !important; min-height: 0 !important;'
              );
              $('.mount-products .site-box.box__collection_image').attr(
                'style',
                'height:' +
                  ($(window).height() - $('.site-header').outerHeight()) +
                  'px !important; min-height: 0 !important;'
              );
            } else {
              //$('.mount-products .site-box.box__heading').attr('style', 'height:' + h + 'px !important; min-height: 0 !important;');
              //$('.mount-products .site-box.box__heading .site-box-content').css('marginTop', -$('.site-header').outerHeight());
            }
          }

          $('.mount-products .site-box.box__collection').each(function() {
            //$(this).attr('style', 'height:' + ( h / 2 ) + 'px !important');
          });
        } else {
          $(
            '.mount-products .site-box.box__collection, .mount-products .site-box.box__heading'
          ).attr('style', '');
        }
      },

      unmount: function() {
        $(window).off('resize.collection-grid');
      }
    },

    // PRODUCT

    Product: {
      $productGallery: null,
      $productGalleryItem: null,
      $productGalleryIndex: null,

      $productCarousel: null,
      $productCarouselImgs: null,
      productFlkty: null,

      $productStuff: null,
      productStuffMove: false,

      mount: function() {
        // Product gallery

        this.$productGallery = $('.box__product-gallery');
        this.$productGalleryItem = $('.box__product-gallery .gallery-item');

        this.$productGallery.append(
          '<div class="gallery-index out-with-you"><span class="current">' +
            (window.CuberProductImageIndex != undefined
              ? window.CuberProductImageIndex + 1
              : 1) +
            '</span> / <span class="total">' +
            this.$productGalleryItem.length +
            '</span></div>'
        );
        this.$productGalleryIndex = this.$productGallery.find(
          '.gallery-index .current'
        );

        this.$productCarousel = this.$productGallery.children(
          '.site-box-content'
        );

        window.CUBER.Main._mountScrollMovers({
          parent: this.$productGallery,
          items: $('.gallery-index, .site-sharing, .product-zoom')
        });

        window.CUBER.Main._mobileSharingInit();

        if (this.$productGallery.hasClass('scroll')) {
          // init scrollable gallery

          $(window)
            .on(
              'scroll.product-gallery',
              function() {
                if (!this.$productCarousel.hasClass('flickity-enabled')) {
                  this.$productGalleryItem.each(
                    function(key, elm) {
                      if (
                        $(window).scrollTop() + $(window).height() >
                          $(elm).offset().top + $(window).height() / 2 &&
                        !$(elm).hasClass('current')
                      ) {
                        $(elm).addClass('current');
                        this.$productGalleryIndex.html($(elm).index() + 1);
                        console.log('add current');
                      } else if (
                        $(window).scrollTop() + $(window).height() <
                          $(elm).offset().top + $(window).height() / 2 &&
                        $(elm).hasClass('current')
                      ) {
                        $(elm).removeClass('current');
                        this.$productGalleryIndex.html($(elm).index());
                        console.log('reset');
                      }
                    }.bind(this)
                  );
                }
              }.bind(this)
            )
            .trigger('scroll.product-gallery');
        }

        // init sliding gallery (always, because it turns into this at responsive)

        this.$productCarousel.flickity({
          cellSelector: '.gallery-item:not(.remove-from-flick)',
          initialIndex:
            window.CuberProductImageIndex != undefined
              ? window.CuberProductImageIndex
              : 0,
          wrapAround: true,
          prevNextButtons: false,
          pageDots: true,
          watchCSS: this.$productGallery.hasClass('scroll') ? true : false,
          resize: true
        });

        window.CUBER.Scroll.mount();

        this.productFlkty = this.$productCarousel.data('flickity');
        this.$productCarouselImgs = this.$productCarousel.find(
          '.gallery-item img'
        );

        this.$productCarousel.on(
          'select.flickity',
          function() {
            this.$productGalleryIndex.html(this.productFlkty.selectedIndex + 1);
          }.bind(this)
        );

        if (this.$productGallery.hasClass('slider')) {
          this.$productGallery
            .find('.gallery-index')
            .append(
              '<span class="icon-go go-prev">' +
                $.themeAssets.arrowRight +
                '</span><span class="icon-go go-next">' +
                $.themeAssets.arrowRight +
                '</span>'
            );

          this.$productGallery.find('.go-prev').on(
            'click',
            function() {
              this.productFlkty.previous();
            }.bind(this)
          );

          this.$productGallery.find('.go-next').on(
            'click',
            function() {
              this.productFlkty.next();
            }.bind(this)
          );
        }

        // Product zoom

        if ($('#product-zoom-in').length > 0) {
          $('body').append(
            '<div id="product-zoomed-image"><img /><div id="product-zoom-out" class="product-zoom expand"><span class="zoom-out">' +
              $.themeAssets.iconClose +
              '</span></div></div>'
          );

          $('#product-zoom-in').on(
            'click',
            function(e) {
              // animation out

              $('#section-product')
                .find('.site-box.box__product-content')
                .addClass('animate');
              setTimeout(function() {
                $('#section-product')
                  .find('.site-box.box__product-content')
                  .addClass('expand');
                $('body').addClass('kill-overflow');
              }, 10);

              $('#section-product')
                .find('.site-box.box__product-gallery')
                .stop()
                .animate({ opacity: 0 }, 200);
              $(
                '#shopify-section-header, #shopify-section-footer, .site-sharing'
              )
                .stop()
                .animate({ opacity: 0 }, 200);

              // object

              var $image = $('#product-zoomed-image img');

              $image.attr(
                'src',
                $('.gallery-item')
                  .eq(parseInt(this.$productGalleryIndex.html()) - 1)
                  .find('img')
                  .data('srcset')['huge']
              );

              setTimeout(
                function() {
                  if ($image[0].naturalWidth > 0) {
                    this._productZoomMount($image);
                  } else {
                    $image.on(
                      'load',
                      function() {
                        this._productZoomMount($image);
                      }.bind(this)
                    );
                  }
                }.bind(this),
                200
              );
            }.bind(this)
          );

          $('#product-zoom-out').on(
            'click',
            function(e) {
              setTimeout(function() {
                // animation out

                $('#section-product')
                  .find('.site-box.box__product-content')
                  .removeClass('expand');
                $('body').removeClass('kill-overflow');
                setTimeout(function() {
                  $('#section-product')
                    .find('.site-box.box__product-content')
                    .removeClass('animate');
                }, 400);

                $('#section-product')
                  .find('.site-box.box__product-gallery')
                  .stop()
                  .animate({ opacity: 1 }, 200);
                $(
                  '#shopify-section-header, #shopify-section-footer, .site-sharing'
                )
                  .stop()
                  .animate({ opacity: 1 }, 200);
              }, 150);

              // object

              this._productZoomUnmount();
            }.bind(this)
          );
        }

        // AJAX add to cart

        if (
          $('#add-to-cart').length > 0 &&
          $('#add-to-cart').data('type') == 'overlay' &&
          !$('html').hasClass('ie9')
        ) {
          var $form = $('#add-to-cart'),
            $submitText = $('#addToCartText'),
            $submitButton = $('#addToCart'),
            $cartCount = $('.cart-menu .count'),
            $cartQty = $('#add-to-cart #quantity');

          $form.submit(function(e) {
            e.preventDefault();

            var oldText = $submitText.html();
            $submitText.html(
              '<span class="preloader"><span>.</span><span>.</span><span>.</span></span>'
            );
            $submitButton.css('pointer-events', 'none');

            $.ajax({
              type: $form.prop('method'),
              url: $form.prop('action'),
              data: $form.serialize(),
              dataType: 'json',
              success: function(data) {
                setTimeout(function() {
                  $submitText.html(oldText);
                  $submitButton.css('pointer-events', 'all');
                }, 500);

                $.ajax({
                  url: '/cart',
                  success: function(data) {
                    /*if ( typeof fbq !== 'undefined' ) {
  										fbq('track', 'Purchase');
			  						}*/

                    $('#site-cart .cart-items').html(
                      $(data).find('#site-cart .cart-items .cart-item')
                    );

                    $('#CartTotal').html(
                      $(data)
                        .find('#CartTotal')
                        .html()
                    );

                    setTimeout(function() {
                      $submitText.html(oldText);
                      $submitButton.css('pointer-events', 'all');
                    }, 500);

                    if ($cartQty.length > 0) {
                      var qty = parseInt($('#quantity').val());
                      if (qty == 1) {
                        $('#site-cart .subtitle').html(
                          $('#site-cart .subtitle')
                            .data('added-singular')
                            .replace(/{{ count }}|count|{{count}}/g, qty)
                        );
                      } else {
                        $('#site-cart .subtitle').html(
                          $('#site-cart .subtitle')
                            .data('added-plural')
                            .replace(/{{ count }}|count|{{count}}/g, qty)
                        );
                      }

                      $cartCount.text(
                        parseInt($cartCount.text()) + parseInt($cartQty.val())
                      );
                    } else {
                      $cartCount.text(parseInt($cartCount.text()) + 1);
                      $('#site-cart .subtitle').html(
                        $('#site-cart .subtitle')
                          .data('added-singular')
                          .replace(/{{ count }}|count|{{count}}/, 1)
                      );
                    }

                    $('.site-cart-handle a').trigger('click');
                  }
                });
              },

              error: function(data) {
                alert(data.responseJSON.description);

                setTimeout(function() {
                  $submitText.html(oldText);
                  $submitButton.css('pointer-events', 'all');
                }, 100);
              }
            });
          });
        }
      },

      _productZoomMount: function($image) {
        $('#product-zoomed-image').css('display', 'block');

        $(window).on('mousemove.product-zoom', function(e) {
          e.preventDefault();
          window.clientX = e.clientX;
          window.clientY = e.clientY;
          var x =
            e.clientX *
            ($(window).width() - $image.width()) /
            $(window).width();
          var y =
            e.clientY *
            ($(window).height() - $image.height()) /
            $(window).height();
          $image.css({ left: x, top: y });
        });

        if ($image[0].naturalWidth <= $image[0].naturalHeight) {
          $image.addClass('portrait');
        } else {
          $image.addClass('landscape');
        }
        $image.data('ratio', $image[0].naturalWidth / $image[0].naturalHeight);

        $(window)
          .on('resize.product-zoom', function() {
            var rf = $(window).width() > 768 ? 1 : 2;

            if ($image.hasClass('portrait')) {
              $image.css('width', $(window).width() * rf);
              $image.css(
                'height',
                $(window).width() * rf / $image.data('ratio')
              );
            } else {
              $image.css('height', $(window).height() * rf);
              $image.css(
                'width',
                $(window).height() * rf * $image.data('ratio')
              );

              if ($image.width() < $(window).width()) {
                $image.css('width', $(window).width() * rf);
                $image.css(
                  'height',
                  $(window).width() * rf / $image.data('ratio')
                );
              }
            }

            var x =
              window.clientX *
              ($(window).width() - $image.width()) /
              $(window).width();
            var y =
              window.clientY *
              ($(window).height() - $image.height()) /
              $(window).height();
            $image.css({ left: x, top: y });
          })
          .trigger('resize');

        $image.css('opacity', 1);
      },

      _productZoomUnmount: function() {
        $('#product-zoomed-image img').css('opacity', '0');

        setTimeout(function() {
          $(window).off('resize.product-zoom');
          $(window).off('mousemove.product-zoom');
          $('#product-zoomed-image img').attr('src', '');
          $('#product-zoomed-image').css('display', 'none');
        }, 300);
      },

      unmount: function() {
        $(window).off('scroll.product-gallery');
        $(window).off('resize.position-product-zoom');
        this.$productCarousel.off('scroll.flickity');
        this.$productCarousel.off('select.flickity');
        this.productFlkty.destroy();
        $('#product-zoom').off('click');
      }
    },

    Main: {
      $searchForm: null,
      $searchResults: null,
      $searchPreloader: null,
      $searchPagination: null,

      $body: null,
      $siteHeader: null,
      $siteFooter: null,

      $siteBoxes: null,

      _mountScrollMovers: function(props) {
        var $parent = props['parent'],
          parentOutOfFocus = false;

        setTimeout(function() {
          props['items'].removeClass('out-with-you');
        }, 1000);
        props['items'].addClass('animate-owy');

        $(window).on(
          'scroll.scroll-movers',
          function() {
            if (
              !parentOutOfFocus &&
              $(window).scrollTop() + $(window).height() >
                $parent.offset().top + $parent.height()
            ) {
              props['items'].addClass('out-with-you');

              parentOutOfFocus = true;
            } else if (
              parentOutOfFocus &&
              $(window).scrollTop() + $(window).height() <=
                $parent.offset().top + $parent.height()
            ) {
              parentOutOfFocus = false;

              props['items'].removeClass('out-with-you');
            }
          }.bind(this)
        );
      },

      _mobileSharingInit: function() {
        $('.touchevents .site-sharing .icon').on('touchstart', function(e) {
          e.preventDefault();
          var $parent = $(this).parent();

          if ($parent.hasClass('hover')) {
            $parent.removeClass('hover');
          } else {
            $parent.addClass('hover');
          }
        });

        $('.touchevents .site-sharing a').on('touchstart', function(e) {
          $(this)
            .parent()
            .removeClass('hover');
        });
      },

      _resizeEverything: function() {
        this.$body.css('paddingTop', this.$siteHeader.outerHeight());

        if (this.$body.hasClass('template-index')) {
          if ($('#fix-me-header').css('display') == 'block') {
            if ($('.mount-slideshow').length > 0) {
              //$('#shopify-section-home_slideshow').css('marginTop', -this.$siteHeader.outerHeight());
              //$('.fix-me-with-margin').css('marginTop', this.$siteHeader.outerHeight());
            } else {
              $('.index-section:first-child .fix-me-with-margin').css(
                'marginTop',
                -this.$siteHeader.outerHeight()
              );
              $('.index-section:first-child .fix-me-with-height').css(
                'height',
                $(window).height() - this.$siteHeader.outerHeight()
              );
            }
          } else {
            if ($('.mount-slideshow').length > 0) {
              $('#shopify-section-home_slideshow').css('marginTop', '0');
              $('.slideshow-item:first-child .site-box-content').css(
                'marginTop',
                '0'
              );
            } else {
            }
          }
        } else {
          if ($('#fix-me-header').css('display') == 'block') {
            $('.fix-me-with-margin').each(
              function(key, elm) {
                if ($(elm).outerHeight() < $(window).height()) {
                  $(elm).css('marginTop', -this.$siteHeader.outerHeight());
                } else {
                  $(elm).css('marginTop', '0');
                }
              }.bind(this)
            );

            $('.fix-me-with-height-hard').css({
              height: $(window).height() - this.$siteHeader.outerHeight(),
              'min-height': $(window).height() - this.$siteHeader.outerHeight()
            });
            $('.fix-me-with-height').css({
              'min-height': $(window).height() - this.$siteHeader.outerHeight()
            });
          } else {
            $('.fix-me-with-margin').css('marginTop', '0');
            $('.fix-me-with-height, .fix-me-with-height-hard').attr(
              'style',
              ''
            );
          }

          if (this.$body.hasClass('template-product')) {
            if ($('#fix-me-header').css('content') == '"fix-gallery-item"') {
              $('.gallery-item').css(
                'height',
                ($(window).height() - this.$siteHeader.outerHeight()) * 0.8
              );
            } else {
              //$('.gallery-item').css('height', $(window).height() - this.$siteHeader.outerHeight());
            }

            $('#section-product').removeClass('sticky-because');
            if (
              $('.site-box.box__product-gallery').css('content') !=
                '"fix-me-also"' &&
              $('.site-box.box__product-gallery').height() <
                $('.site-box.box__product-content').height()
            ) {
              $('#section-product').addClass('sticky-because');
            }

            /*if ( $('.site-box.box__product-gallery').css('content') == '"fix-me-also"' ) {
							$('.site-box.box__product-gallery').css('height', $(window).height() - this.$siteHeader.outerHeight());
						}*/
          }
        }

        $('.site-header.desktop-view--classic .submenu').css(
          'top',
          $('.site-header').outerHeight()
        );

        if ($('#site-menu-handle').css('opacity') == '1') {
          $('.site-nav.style--sidebar a, #site-menu-handle').attr(
            'tabIndex',
            0
          );
        } else {
          $('.site-nav.style--sidebar a, #site-menu-handle').attr(
            'tabIndex',
            -1
          );
        }
      },

      _animateEverything: function(firstAnimation) {
        var i = 0;

        this.$siteBoxes.each(function() {
          var vp = 0;

          /*if ( ! firstAnimation ) {

						if ( ( $(this).height() - 100 ) > $(window).height() / 2 ) {
							vp = 0;
						} else {
							vp = 0;
						}
					}*/

          if (
            !$(this).hasClass('active') &&
            $(window).scrollTop() + $(window).height() >
              $(this).offset().top + vp
          ) {
            i++;

            setTimeout(
              function() {
                $(this).addClass('active');
              }.bind(this),
              100 * i
            );
          }
        });

        if (
          !this.$siteFooter.hasClass('active') &&
          $(window).scrollTop() + $(window).height() >
            this.$siteFooter.offset().top + 150
        ) {
          this.$siteFooter.addClass('active');
          this.$siteFooter.find('.site-box').addClass('active');
        }
      },

      mount: function() {
        $('.rte').fitVids();

        this.$siteBoxes = $('.site-box:not(.footer-box)');
        this.$siteFooter = $('.site-footer');

        if (!$('body').hasClass('ie9')) {
          this._animateEverything(true);
          $(window).on(
            'scroll.fade-animation',
            function(e) {
              this._animateEverything(false);
            }.bind(this)
          );
        }

        $('html.no-touchevents a[href]').each(function() {
          $(this).on('click', function(e) {
            if (
              $(this).attr('target') == '_blank' ||
              $(this).hasClass('video-lightbox') ||
              $(this).hasClass('lightbox') ||
              $(this).hasClass('block-fade') ||
              $(this).attr('href') == '' ||
              $(this)
                .attr('href')
                .indexOf('#') >= 0
            ) {
              //
            } else {
              $(this).off('click');

              $('body').fadeOut(200);
              setTimeout(
                function() {
                  document.location.href = $(this).attr('href');
                }.bind(this),
                200
              );
              e.preventDefault();
            }
          });
        });

        //

        this.$body = $('body');
        this.$siteHeader = $('#site-header');

        $(window).on(
          'resize',
          window.debounce(
            function() {
              this._resizeEverything();
            }.bind(this),
            300
          )
        );
        this._resizeEverything();

        setTimeout(
          function() {
            this._resizeEverything();
          }.bind(this),
          1000
        );

        if (
          $('.logo-img').length > 0 &&
          !$('.logo-img img')[0].naturalWidth > 0
        ) {
          $('.logo-img img').on('load', function() {
            window.CUBER.Main._resizeEverything();
          });
        }

        this.$searchForm = $('.search-bar:not(.no-ajax)');
        this.$searchResults = $('#search-results');
        this.$searchPreloader = $('#site-search .preloader');

        this.$searchForm.find('input[type="search"]').on(
          'keyup',
          window.debounce(
            function() {
              this._ajaxSearchForm();
            }.bind(this),
            300
          )
        );

        this.$searchForm.submit(
          function(e) {
            e.preventDefault();
            this._ajaxSearchForm();
          }.bind(this)
        );

        // tabs & toggles

        if ($('.krown-tabs').data('design') == 'toggles') {
          $('.krown-tabs').each(function() {
            var $titles = $(this)
                .children('.titles')
                .children('h5'),
              $contents = $(this)
                .find('.contents')
                .children('div'),
              i = 0;

            $titles.each(function() {
              $contents.eq(i++).insertAfter($(this));

              $(this).on('click', function() {
                var $toggle = $(this).next('.tab');

                if (!$(this).hasClass('opened')) {
                  $(this).addClass('opened');
                  $toggle.stop().slideDown(200);
                } else {
                  $(this).removeClass('opened');
                  $toggle.stop().slideUp(200);
                }
              });
            });

            $(this)
              .find('.contents')
              .remove();
          });
        } else {
          $('.krown-tabs').each(function() {
            var $titles = $(this)
                .children('.titles')
                .children('h5'),
              $contents = $(this)
                .children('.contents')
                .children('div'),
              $openedT = $titles.eq(0),
              $openedC = $contents.eq(0);

            $openedT.addClass('opened');
            $openedC.stop().slideDown(0);

            $titles
              .find('a')
              .prop('href', '#')
              .off('click');

            $titles.click(function(e) {
              $openedT.removeClass('opened');
              $openedT = $(this);
              $openedT.addClass('opened');

              $openedC.stop().slideUp(200);
              $openedC = $contents.eq($(this).index());
              $openedC
                .stop()
                .delay(200)
                .slideDown(200);

              e.preventDefault();
            });
          });
        }
      },

      _ajaxSearchForm: function() {
        this.$searchPreloader.css('opacity', 1);

        $.ajax({
          type: this.$searchForm.prop('method'),
          url: this.$searchForm.prop('action'),
          data: this.$searchForm.serialize(),
          success: function(data) {
            this.$searchResults.html(
              $(data).find('.search-results.with-results')
            );
            this.$searchPreloader.css('opacity', 0);

            $(window).off('scroll.search-pagination');

            if ($('.search-results').find('.next-page').length > 0) {
              this.$searchPagination = $('.search-results').find('.next-page');
              $(window).on(
                'scroll.search-pagination',
                this._ajaxSearchPagination.bind(this)
              );
            }
          }.bind(this)
        });
      },

      _ajaxSearchPagination: function() {
        if (
          $(window).scrollTop() + $(window).height() >=
          this.$searchPagination.offset().top - 150
        ) {
          this.$searchPreloader.css({
            opacity: 1,
            top: 'auto',
            bottom: '-60px'
          });
          $(window).off('scroll.search-pagination');

          $.ajax({
            url: this.$searchPagination.attr('href'),
            success: function(data) {
              this.$searchResults.find('.next-page').remove();
              this.$searchResults.append($(data).find('.search-item'));

              if ($(data).find('.search-results .next-page').length > 0) {
                this.$searchResults.append(
                  $(data).find('.search-results .next-page')
                );
                this.$searchPagination = $('.search-results').find(
                  '.next-page'
                );
                $(window).on(
                  'scroll.search-pagination',
                  this._ajaxSearchPagination.bind(this)
                );
              }

              this.$searchPreloader.css({
                opacity: 0,
                top: '20px',
                bottom: 'auto'
              });
            }.bind(this)
          });
        }
      },

      unmount: function() {
        $(window).off('scroll.scroll-movers');
      }
    },

    Contact: {
      mount: function() {
        if ($('#contact-map-holder').length > 0) {
          if ($('#contact-map').data('address') != '') {
            if (typeof google !== 'undefined') {
              this._createMap();
            } else {
              $.getScript(
                'https://maps.googleapis.com/maps/api/js?v=3&key=' +
                  $('#contact-map-holder').data('key')
              ).done(
                function() {
                  this._createMap();
                }.bind(this)
              );
            }
          }
        }
      },

      _createMap: function() {
        var $mapInsert = $('#contact-map');

        var coordsKey = 'map-coords-' + $('body').attr('id'),
          coordsStorage =
            localStorage.getItem(coordsKey) != null
              ? JSON.parse(localStorage.getItem(coordsKey))
              : null,
          mapLat = 0,
          mapLong = 0;

        if (
          coordsStorage != null &&
          coordsStorage['address'] == $mapInsert.data('address')
        ) {
          mapLat = coordsStorage['lat'];
          mapLong = coordsStorage['long'];
        }

        var geocoder, map, address;

        geocoder = new google.maps.Geocoder();
        address = $mapInsert.data('address');

        var mapOptions = {
          zoom: $mapInsert.data('zoom'),
          center: new google.maps.LatLng(mapLat, mapLong),
          streetViewControl: false,
          scrollwheel: true,
          panControl: false,
          mapTypeControl: false,
          overviewMapControl: false,
          zoomControl: false,
          draggable: true,
          styles:
            $mapInsert.data('style') == 'light'
              ? window.lightMapStyle
              : window.darkMapStyle
        };

        map = new google.maps.Map(
          document.getElementById($mapInsert.attr('id')),
          mapOptions
        );

        if (mapLat != 0 || mapLong != 0) {
          var markerOptions = {
            position: new google.maps.LatLng(mapLat, mapLong),
            map: map,
            title: address
          };

          if ($mapInsert.data('marker') != 'none') {
            markerOptions['icon'] = {
              url: $mapInsert.data('marker'),
              scaledSize: new google.maps.Size(60, 60)
            };
          }

          $('#contact-map-address a').attr(
            'href',
            'http://www.google.com/maps/place/' + mapLat + ',' + mapLong
          );
          var contentString = $('#contact-map-address').html();
          var infowindow = new google.maps.InfoWindow({
            content: contentString
          });

          var marker = new google.maps.Marker(markerOptions);
          marker.addListener('click', function() {
            infowindow.open(map, marker);
            if ($(window).width() < 480) {
              $('.template-page-contact .box__heading .title').css(
                'marginTop',
                50
              );
            } else if ($(window).width() < 768) {
              $('.template-page-contact .box__heading .title').css(
                'marginTop',
                100
              );
            }
          });

          if ($(window).width() > 768) {
            map.panBy(-150, 150);
          } else {
            map.panBy(-75, 75);
          }
        } else {
          if (geocoder) {
            geocoder.geocode({ address: address }, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
                  map.setCenter(results[0].geometry.location);

                  var markerOptions = {
                    position: results[0].geometry.location,
                    map: map,
                    title: address
                  };

                  if ($mapInsert.data('marker') != 'none') {
                    markerOptions['icon'] = {
                      url: $mapInsert.data('marker'),
                      scaledSize: new google.maps.Size(60, 60)
                    };
                  }

                  $('#contact-map-address a').attr(
                    'href',
                    'http://www.google.com/maps/place/' +
                      results[0].geometry.location.lat() +
                      ',' +
                      results[0].geometry.location.lng()
                  );
                  var contentString = $('#contact-map-address').html();
                  var infowindow = new google.maps.InfoWindow({
                    content: contentString
                  });

                  var marker = new google.maps.Marker(markerOptions);
                  marker.addListener('click', function() {
                    infowindow.open(map, marker);
                  });

                  if ($(window).width() > 768) {
                    map.panBy(-150, 150);
                  } else {
                    map.panBy(-75, 75);
                  }

                  localStorage.setItem(
                    coordsKey,
                    JSON.stringify({
                      address: $mapInsert.data('address'),
                      lat: results[0].geometry.location.lat(),
                      long: results[0].geometry.location.lng()
                    })
                  );
                } else {
                  alert('No results found for the given address');
                }
              } else {
                console.log(
                  'Geocode was not successful for the following reason: ' +
                    status
                );
              }
            });
          }
        }
      },

      unmount: function() {}
    },

    // SCROLL

    Scroll: {
      $body: null,
      $footer: null,

      mount: function() {
        if (!$('html').hasClass('csspositionsticky')) {
          this.$body = $('body');
          this.$footer = $('#shopify-section-footer');

          // grid

          var scrollFixArray = [];

          if ($(window).width() > 768) {
            $(
              '.site-box-container.container--fullscreen.box--can-stick'
            ).each(function() {
              var $boxChildren = $(this).children('.site-box');

              if ($boxChildren.length == 2) {
                if (
                  $(this)
                    .children('.site-box[data-order="0"]')
                    .outerHeight(true) !=
                  $(this)
                    .children('.site-box[data-order="1"]')
                    .outerHeight(true)
                ) {
                  var $bigChild = null,
                    $smallChild = null;

                  if (
                    $(this)
                      .children('.site-box[data-order="0"]')
                      .outerHeight(true) >
                    $(this)
                      .children('.site-box[data-order="1"]')
                      .outerHeight(true)
                  ) {
                    $bigChild = $(this).children('.site-box[data-order="0"]');
                    $smallChild = $(this).children('.site-box[data-order="1"]');
                  } else if (
                    $(this)
                      .children('.site-box[data-order="1"]')
                      .outerHeight(true) >
                    $(this)
                      .children('.site-box[data-order="0"]')
                      .outerHeight(true)
                  ) {
                    $bigChild = $(this).children('.site-box[data-order="1"]');
                    $smallChild = $(this).children('.site-box[data-order="0"]');
                  }

                  scrollFixArray.push({
                    parent: $(this),
                    'big-child': $bigChild,
                    'small-child': $smallChild
                  });
                }
              } else if ($boxChildren.length == 1) {
                if (
                  $(this)
                    .children('.site-box[data-order="0"]')
                    .outerHeight(true) > $(window).height()
                ) {
                  scrollFixArray.push({
                    parent: $(this),
                    'big-child': $(this).children('.site-box[data-order="0"]'),
                    'small-child': null
                  });
                }
              }
            });
          }

          scrollFixArray.forEach(function(obj) {
            obj['parent'].removeClass('fixing-scroll-now');
            obj['big-child'].css({
              position: 'relative',
              top: '0',
              bottom: 'auto',
              marginLeft: '0'
            });

            if (obj['small-child'] != null) {
              obj['small-child'].css({
                position: 'relative',
                top: '0',
                bottom: 'auto',
                marginLeft: '0'
              });
              obj['small-child'].removeClass('ok-scroll');
            }
          });

          $(window).off('scroll.scroll-fix');

          scrollFixArray.forEach(function(obj) {
            if (
              $(window).scrollTop() + $(window).height() >=
              obj['parent'].offset().top + obj['parent'].outerHeight()
            ) {
              if (obj['small-child'] != null) {
                obj['small-child'].css({
                  position: 'absolute',
                  bottom: 0,
                  top: 'auto'
                });
                if (obj['small-child'].attr('data-order') == '1') {
                  obj['small-child'].css('marginLeft', '50%');
                }
              }

              if (obj['big-child'].attr('data-order') == '1') {
                obj['big-child'].css('marginLeft', '50%');
              }
            }
          });

          $(window)
            .on(
              'scroll.scroll-fix',
              function() {
                if ($(window).scrollTop() >= 0) {
                  scrollFixArray.forEach(function(obj) {
                    if (
                      $(window).scrollTop() >= obj['parent'].offset().top &&
                      $(window).scrollTop() + $(window).height() <
                        obj['parent'].offset().top +
                          obj['parent'].outerHeight() &&
                      !obj['parent'].hasClass('fixing-scroll-now')
                    ) {
                      obj['parent'].addClass('fixing-scroll-now');

                      if (obj['small-child'] != null) {
                        obj['small-child'].css({
                          position: 'fixed',
                          top: 0,
                          bottom: 'auto'
                        });

                        if (obj['small-child'].attr('data-order') == '1') {
                          obj['small-child'].css('marginLeft', '50%');
                        }

                        if (obj['small-child'].height() > $(window).height()) {
                          obj['small-child'].addClass('ok-scroll');
                        }
                      }

                      if (obj['big-child'].attr('data-order') == '1') {
                        obj['big-child'].css('marginLeft', '50%');
                      }
                    }

                    if (
                      $(window).scrollTop() + $(window).height() >=
                        obj['parent'].offset().top +
                          obj['parent'].outerHeight() &&
                      obj['parent'].hasClass('fixing-scroll-now')
                    ) {
                      obj['parent'].removeClass('fixing-scroll-now');

                      if (obj['small-child'] != null) {
                        obj['small-child'].removeClass('ok-scroll');
                        obj['small-child'].css({
                          position: 'absolute',
                          bottom: 0,
                          top: 'auto'
                        });
                      }
                    }

                    if (
                      $(window).scrollTop() < obj['parent'].offset().top &&
                      obj['parent'].hasClass('fixing-scroll-now')
                    ) {
                      obj['parent'].removeClass('fixing-scroll-now');
                      obj['big-child'].css('marginLeft', '0');

                      if (obj['small-child'] != null) {
                        obj['small-child'].css({
                          position: 'relative',
                          top: '0',
                          bottom: 'auto',
                          marginLeft: '0'
                        });
                      }
                    }
                    if (
                      obj['small-child'] != null &&
                      obj['small-child'].height() > $(window).height() &&
                      obj['small-child'].hasClass('ok-scroll')
                    ) {
                      var x = obj['big-child'].height() - $(window).height(),
                        y = $(window).height() - obj['small-child'].height(),
                        z = $(window).scrollTop();

                      //obj['small-child'].css('top', Math.ceil(z * y / x));
                    }
                  });
                }
              }.bind(this)
            )
            .trigger('scroll.scroll-fix');

          $(window).off('resize.scroll-fix');
          $(window).on(
            'resize.scroll-fix',
            window.debounce(
              function() {
                window.CUBER.Scroll.mount();
              }.bind(this),
              250
            )
          );
        }
      },

      unmount: function() {
        $(window).off('resize.scroll-fix');
        $(window).off('scroll.scroll-fix');
      }
    },

    // IMAGES

    Images: {
      boxImages: [],

      mount: function() {
        this.boxImages = [];

        if ($('.box--product-image').length > 0) {
          $('.box--product-image:not(.on)').each(
            function(key, elm) {
              $(elm).addClass('on');
              this.boxImages.push({
                $elm: $(elm),
                img: $(elm).children('img')[0],
                srcset: $(elm)
                  .children('img')
                  .data('srcset')
              });
            }.bind(this)
          );
        }

        $(window)
          .on(
            'resize.box-images',
            function() {
              this.boxImages.forEach(function(entry) {
                var desiredDensity =
                    window.devicePixelRatio <= 2 ? window.devicePixelRatio : 2,
                  desiredSize = entry['$elm'].width() * desiredDensity;

                if (entry['img'].naturalWidth > 0) {
                  if (
                    entry['$elm'].width() / entry['$elm'].height() <
                    entry['img'].naturalWidth / entry['img'].naturalHeight
                  ) {
                    var desiredHeight = Math.ceil(
                      entry['$elm'].height() * desiredDensity
                    );
                    desiredSize =
                      desiredHeight *
                      entry['img'].naturalWidth /
                      entry['img'].naturalHeight;
                  }
                }

                if (desiredSize <= 480) {
                  entry['$elm'].css(
                    'backgroundImage',
                    'url(' + entry['srcset'].small + ')'
                  );
                } else if (desiredSize <= 960) {
                  entry['$elm'].css(
                    'backgroundImage',
                    'url(' + entry['srcset'].medium + ')'
                  );
                } else if (desiredSize <= 1440) {
                  entry['$elm'].css(
                    'backgroundImage',
                    'url(' + entry['srcset'].large + ')'
                  );
                } else if (desiredSize > 1440) {
                  entry['$elm'].css(
                    'backgroundImage',
                    'url(' + entry['srcset'].huge + ')'
                  );
                }
              });
            }.bind(this)
          )
          .trigger('resize.box-images');
      },

      unmount: function() {
        $(window).off('resize.box-images');
      }
    },

    Video: {
      mount: function() {
        if ($('.video-lightbox').length > 0) {
          $('.video-lightbox').magnificPopup({
            type: 'iframe'
          });
        }
      },

      unmount: function() {}
    },

    Popup: {
      $popup: null,

      mount: function() {
        this.$popup = $('#shopify-section-popup');

        var show = this.$popup.find('.popup-content').data('show'),
          freq = this.$popup.find('.popup-content').data('freq'),
          enable = this.$popup.find('.popup-content').data('enable');

        if (show > 0 && enable) {
          setTimeout(
            function() {
              this._trigger(show, freq);
            }.bind(this),
            parseInt(show * 1000)
          );
        }

        this.$popup.find('.site-close-handle').on(
          'click',
          function(e) {
            this._hide();
          }.bind(this)
        );

        this.$popup.find('.popup-background').on(
          'click',
          function(e) {
            this._hide();
          }.bind(this)
        );
      },

      _show: function() {
        this.$popup.addClass('active');
      },

      _hide: function() {
        this.$popup.removeClass('active');
      },

      _trigger: function(show, freq) {
        var popupKey = 'popup-' + document.location.hostname,
          popupStorage =
            localStorage.getItem(popupKey) != null
              ? JSON.parse(localStorage.getItem(popupKey))
              : null;

        if (popupStorage != null) {
          if (popupStorage['show'] != show || popupStorage['freq'] != freq) {
            this._refreshStorage(popupKey, show, freq);

            // user saw the ad but settings are different - show it!
            this._show();
          } else {
            // user saw the ad so we need to check if he should see it again

            if (freq == 'every') {
              if (
                sessionStorage[popupKey] == null ||
                sessionStorage[popupKey] != 'shown'
              ) {
                this._show();
                this._refreshStorage(popupKey, show, freq);
              }
            } else {
              var shownAt = popupStorage['shown'],
                nowAt = new Date().getTime(),
                inBetween = Math.round((nowAt - shownAt) / 1000);

              if (freq == 'day' && inBetween > 129600) {
                this._show();
                this._refreshStorage(popupKey, show, freq);
              } else if (freq == 'week' && inBetween > 907200) {
                this._show();
                this._refreshStorage(popupKey, show, freq);
              }
            }
          }
        } else {
          this._refreshStorage(popupKey, show, freq);

          // user never saw the ad - show it!

          this._show();
        }
      },

      _refreshStorage: function(popupKey, show, freq) {
        localStorage.setItem(
          popupKey,
          JSON.stringify({
            show: show,
            freq: freq,
            shown: new Date().getTime()
          })
        );

        sessionStorage[popupKey] = 'shown';
      },

      unmount: function() {}
    },

    // SOCIAL

    Social: {
      $container: null,
      nameTwitter: '',
      nameInstagram: '',

      mount: function($elm) {
        this.$container = $elm.children('.site-box-container');
        this.nameTwitter = this.$container.data('twitter');
        this.nameInstagram = this.$container.data('instagram');

        var no = this.$container.data('posts'),
          noT = 0,
          noI = 0,
          socialArr = [];

        if (this.nameTwitter != '' && this.nameInstagram != '') {
          noT = Math.ceil(no / 2);
          noI = Math.floor(no / 2);
        } else if (this.nameTwitter != '') {
          noT = no;
        } else if (this.nameInstagram != '') {
          noI = no;
        }

        if (noI > 0) {
          var feed = new Instafeed({
            get: 'user',
            userId: this.nameInstagram.split('.')[0],
            accessToken: this.nameInstagram,
            limit: noI,
            resolution: 'standard_resolution',
            mock: true,
            sortBy: 'random',
            success: function(obj) {
              obj.data.forEach(function(entry) {
                socialArr.push({
                  type: 'instagram',
                  thumb: entry.images.standard_resolution.url,
                  link: entry.link,
                  caption:
                    typeof entry.caption === 'object' && entry.caption !== null
                      ? entry.caption.text.substring(0, 100) + '..'
                      : '',
                  likes: entry.likes.count,
                  time: new Date(entry.created_time * 1000).toLocaleDateString(
                    'en-US'
                  ),
                  timestamp: parseInt(entry.created_time)
                });
              });

              this._pushFeed('instagram', socialArr);
            }.bind(this)
          });

          feed.run();
        } else {
          this._pushFeed('instagram', socialArr);
        }

        if (noT > 0) {
          twitterFetcher.fetch({
            profile: { screenName: this.nameTwitter },
            dataOnly: true,
            maxTweets: noT,
            dateFunction: function(date) {
              return parse(date);
            },
            customCallback: function(obj) {
              obj.forEach(function(entry) {
                socialArr.push({
                  type: 'twitter',
                  text: entry.tweet,
                  timestamp: Date.parse(entry.timestamp) / 1000
                });
              });

              this._pushFeed('twitter', socialArr);
            }.bind(this)
          });
        } else {
          this._pushFeed('twitter', socialArr);
        }
      },

      _pushFeed: function(type, feed) {
        if (type == 'twitter') {
          this.checkTwitter = true;
        } else if (type == 'instagram') {
          this.checkInstagram = true;
        }

        if (this.checkTwitter && this.checkInstagram) {
          feed
            .sort(function(a, b) {
              return a.timestamp - b.timestamp;
            })
            .reverse();

          feed.forEach(
            function(entry, key) {
              var feedContent = '';

              if (entry.type == 'twitter') {
                feedContent += '<div class="site-box-content">';
                feedContent +=
                  '<span class="icon" aria-hidden="true">' +
                  $.themeAssets.iconTwitter +
                  '</span>';
                feedContent += '<p>' + entry.text + '</p>';
                feedContent +=
                  '<a href="https://twitter.com/' +
                  this.nameTwitter +
                  '" target="_blank">@' +
                  this.nameTwitter +
                  '</a>';
                feedContent += '</div>';
              } else if (entry.type == 'instagram') {
                feedContent +=
                  '<div class="site-box-content" style="background-image:url(' +
                  entry.thumb +
                  ')">';
                feedContent += '<a href="' + entry.link + '" target="_blank">';
                feedContent +=
                  '<span class="icon child" aria-hidden="true">' +
                  $.themeAssets.iconInstagram +
                  '</span>';
                feedContent +=
                  '<p class="caption child">' + entry.caption + '</p>';
                feedContent += '<div class="meta child">';
                feedContent +=
                  '<span class="likes">' +
                  $.themeAssets.iconHeart +
                  entry.likes +
                  '</span>';
                feedContent += '<span class="time">' + entry.time + '</span>';
                feedContent += '</div>';
                feedContent += '</a>';
                feedContent += '</div>';
              }

              this.$container
                .find('.site-box[data-order="' + (key + 1) + '"]')
                .removeClass('box__twitter')
                .removeClass('box__instagram')
                .addClass('box__' + entry.type)
                .html(feedContent);
            }.bind(this)
          );
        }
      },

      unmount: function() {
        //
      }
    },

    SplitSlider: {
      _mountFlickity: function() {
        $('.responsive-flickity').flickity({
          cellSelector: '.slideshow-item',
          wrapAround: false,
          prevNextButtons: false,
          pageDots: false,
          watchCSS: true,
          resize: true
        });

        var $slider = $('.box__slideshow-split'),
          flkty = $('.responsive-flickity').data('flickity'),
          currentI = 0,
          totalI = 100 / ($slider.find('.slideshow-item').length - 1),
          $currentSlide = null,
          $currentSlideBlack = null;

        if ($slider.find('.slider-meta').length <= 0) {
          $slider.find('.slider-meta').remove();

          $slider.append(
            '<div class="slider-meta hide lap--show"><div class="slider-index"><span class="current">1</span> / <span class="total">' +
              t +
              '</span></div><div class="slider-nav"><span class="go-prev">' +
              $.themeAssets.arrowRight +
              '</span><span class="go-next">' +
              $.themeAssets.arrowRight +
              '</span></div>'
          );

          $slider.find('.go-prev').on(
            'click',
            function() {
              flkty.previous();
            }.bind(this)
          );

          $slider.find('.go-next').on(
            'click',
            function() {
              flkty.next();
            }.bind(this)
          );

          $('.responsive-flickity').on('select.flickity', function() {
            $slider
              .find('.slider-index .current')
              .html(flkty.selectedIndex + 1);
          });

          setTimeout(function() {
            $slider.find('.slider-meta').addClass('active');
          }, 1000);
        }
      },

      mount: function(flick) {
        var $slider = $('.box__slideshow-split'),
          $slides = $slider.find('.slideshow-item'),
          $slidesMedia = $slider
            .find('.site-box-background-container')
            .children('div'),
          slidesBlackArray = [];

        (currentScroll = $(window).scrollTop()),
          (i = Math.min(
            Math.ceil(currentScroll / $(window).height()),
            $slides.length - 1
          ));
        (j = i - 1), (t = $slides.length);

        // mobile slider

        if (flick) {
          this._mountFlickity();
        }

        if ($('.responsive-flickity').hasClass('flickity-enabled')) {
          $slider.height($(window).height() - $('#site-header').outerHeight());
          $slider.addClass('remove-min-height');
        } else {
          $slider.css('height', 'auto');
          $slider.removeClass('remove-min-height');
        }

        // split

        $slidesMedia.each(function(key) {
          if (key > 0) {
            if (key < i) {
              $(this).css(
                'clip',
                'rect(0 ' +
                  Math.ceil($(window).width() / 2) +
                  'px ' +
                  $(window).height() +
                  'px 0)'
              );
            } else if (key == i) {
              $(this).css(
                'clip',
                'rect(0 ' +
                  Math.ceil($(window).width() / 2) +
                  'px ' +
                  Math.ceil($(window).scrollTop() - $(window).height() * j) +
                  'px 0)'
              );
            } else {
              $(this).css(
                'clip',
                'rect(0 ' + Math.ceil($(window).width() / 2) + 'px 1px 0)'
              );
            }
          } else if ((key == 0) & flick) {
            $(this).css({
              clip: 'rect(0 ' + Math.ceil($(window).width() / 2) + 'px 0 0)',
              opacity: 0
            });

            $(this).addClass('clip-transition');
            setTimeout(
              function() {
                $(this).css({
                  clip:
                    'rect(0 ' +
                    Math.ceil($(window).width() / 2) +
                    'px ' +
                    $(window).height() +
                    'px 0)',
                  opacity: 1
                });
              }.bind(this),
              10
            );

            setTimeout(
              function() {
                $(this).removeClass('clip-transition');
              }.bind(this),
              650
            );
          }

          $(this).addClass('active');

          if ($(this).find('.site-box-black-overlay').length <= 0) {
            $(this).append('<span class="site-box-black-overlay" />');
          }
          slidesBlackArray.push($(this).find('.site-box-black-overlay'));
        });

        $(window)
          .on('scroll.split-slider', function(e) {
            if (currentScroll < $(window).scrollTop()) {
              // next
              if (
                $slides.eq(i + 1).length > 0 &&
                $(window).scrollTop() + $(window).height() >=
                  $slides.eq(i + 1).offset().top
              ) {
                if (i != 0) {
                  // finish scroll
                  $slidesMedia
                    .eq(i)
                    .css(
                      'clip',
                      'rect(0 ' +
                        Math.ceil($(window).width() / 2) +
                        'px ' +
                        $(window).height() +
                        'px 0)'
                    );
                  if (slidesBlackArray[j]) {
                    slidesBlackArray[j].css('opacity', 0.5);
                  }
                }

                j = i;
                i++;
                down = true;
              } else if (
                $(window).scrollTop() + $(window).height() >=
                  $slider.height() &&
                !$slider.hasClass('back-to-normal')
              ) {
                $slider.addClass('back-to-normal');
                $slidesMedia
                  .eq(i)
                  .css(
                    'clip',
                    'rect(0 ' +
                      Math.ceil($(window).width() / 2) +
                      'px ' +
                      $(window).height() +
                      'px 0)'
                  );
              }
            } else {
              // prev

              if (
                $slides.eq(i - 1).length >= 0 &&
                $(window).scrollTop() + $(window).height() <
                  $slides.eq(i).offset().top
              ) {
                // finish scroll

                var stupid = $slidesMedia.eq(i).hasClass('obs') ? 1 : 0;

                $slidesMedia
                  .eq(i)
                  .css(
                    'clip',
                    'rect(0 ' +
                      Math.ceil($(window).width() / 2) +
                      'px ' +
                      stupid +
                      'px 0)'
                  );
                if (slidesBlackArray[j]) {
                  slidesBlackArray[j].css('opacity', 0);
                }

                i--;
                j = i - 1;
                down = false;
              } else if (
                $(window).scrollTop() + $(window).height() <=
                  $slider.height() &&
                $slider.hasClass('back-to-normal')
              ) {
                $slider.removeClass('back-to-normal');
              }
            }

            if (!$slider.hasClass('back-to-normal')) {
              var scrollValue = Math.ceil(
                $(window).scrollTop() - $(window).height() * j
              );

              var stupid = $slidesMedia.eq(i).hasClass('obs') ? 1 : 0;

              $slidesMedia
                .eq(i)
                .css(
                  'clip',
                  'rect(0 ' +
                    Math.ceil($(window).width() / 2) +
                    'px ' +
                    Math.max(stupid, scrollValue) +
                    'px 0)'
                );

              if (slidesBlackArray[j]) {
                slidesBlackArray[j].css(
                  'opacity',
                  Math.ceil(scrollValue * 50 / $(window).height()) / 100
                );
              }

              var scrollFactor = Math.round($(window).height() / 6);

              $slides
                .eq(j)
                .find('.caption')
                .css(
                  'transform',
                  'translateY(' +
                    (0 -
                      Math.ceil(
                        scrollValue * (scrollFactor * 1) / $(window).height()
                      )) +
                    'px)'
                );
              $slides
                .eq(j)
                .find('.title')
                .css(
                  'transform',
                  'translateY(' +
                    (0 -
                      Math.ceil(
                        scrollValue * (scrollFactor * 0.75) / $(window).height()
                      )) +
                    'px)'
                );
              $slides
                .eq(j)
                .find('.subtitle')
                .css(
                  'transform',
                  'translateY(' +
                    (0 -
                      Math.ceil(
                        scrollValue * (scrollFactor * 0.5) / $(window).height()
                      )) +
                    'px)'
                );
              $slides
                .eq(j)
                .find('.button')
                .css(
                  'transform',
                  'translateY(' +
                    (0 -
                      Math.ceil(
                        scrollValue * (scrollFactor * 0.25) / $(window).height()
                      )) +
                    'px)'
                );

              $slides
                .eq(i)
                .find('.caption')
                .css(
                  'transform',
                  'translateY(' +
                    (Math.ceil(
                      scrollValue * (scrollFactor * 1) / $(window).height()
                    ) -
                      scrollFactor * 1) +
                    'px)'
                );
              $slides
                .eq(i)
                .find('.title')
                .css(
                  'transform',
                  'translateY(' +
                    (Math.ceil(
                      scrollValue * (scrollFactor * 0.75) / $(window).height()
                    ) -
                      scrollFactor * 0.75) +
                    'px)'
                );
              $slides
                .eq(i)
                .find('.subtitle')
                .css(
                  'transform',
                  'translateY(' +
                    (Math.ceil(
                      scrollValue * (scrollFactor * 0.5) / $(window).height()
                    ) -
                      scrollFactor * 0.5) +
                    'px)'
                );
              $slides
                .eq(i)
                .find('.button')
                .css(
                  'transform',
                  'translateY(' +
                    (Math.ceil(
                      scrollValue * (scrollFactor * 0.25) / $(window).height()
                    ) -
                      scrollFactor * 0.25) +
                    'px)'
                );
            }

            currentScroll = $(window).scrollTop();
          })
          .trigger('scroll.split-slider');

        $(window).on(
          'resize.split-slider',
          window.debounce(
            function() {
              this.unmount();
              this.mount(false);
            }.bind(this),
            250
          )
        );
      },

      unmount: function() {
        $(window).off('scroll.split-slider');
      }
    }
  };

  $(document).on('ready', function() {
    window.CUBER.Nav.mount();
    window.CUBER.Main.mount();
    window.CUBER.Scroll.mount();

    if ($('.mount-social').length > 0) {
      $('.mount-social').each(function() {
        window.CUBER.Social.mount($(this));
      });
    }

    if ($('.box__slideshow-split').length > 0) {
      window.CUBER.SplitSlider.mount(true);
    }

    if ($('body').hasClass('template-product')) {
      window.CUBER.Product.mount();
    }
    if ($('body').hasClass('template-collection')) {
      window.CUBER.Collection.mount();
    }
    if ($('body').hasClass('template-page-contact')) {
      window.CUBER.Contact.mount();
    }

    window.CUBER.Images.mount();
    window.CUBER.Video.mount();

    window.CUBER.Popup.mount();

    // Section events

    // select

    $(document).on('shopify:section:select', function(e) {
      var $section = $(e.target);

      if ($section.hasClass('mount-header')) {
        if (
          $section.find('#site-header').hasClass('style--sidebar') ||
          $section.find('#site-header').hasClass('style--fullscreen')
        ) {
          if (!$section.find('#site-nav').hasClass('active')) {
            $('#site-menu-handle a').trigger('click');
          }
        }
      }

      if (
        $('#site-header').hasClass('desktop-view--minimal') &&
        $('#fix-me-header').css('display') == 'none'
      ) {
        setTimeout(function() {
          $('html, body')
            .stop()
            .animate({ scrollTop: $section.offset().top }, 0);
        }, 400);
      }

      if ($section.hasClass('mount-popup')) {
        window.CUBER.Popup._show();
      }
    });

    // deselect

    $(document).on('shopify:section:deselect', function(e) {
      var $section = $(e.target);

      if ($section.hasClass('mount-header')) {
        if (
          $section.find('#site-header').hasClass('style--sidebar') ||
          $section.find('#site-header').hasClass('style--fullscreen')
        ) {
          if ($section.find('#site-nav').hasClass('active')) {
            $('#site-menu-handle a').trigger('click');
          }
        }
      }

      if ($section.hasClass('mount-popup')) {
        window.CUBER.Popup._hide();
      }
    });

    // load

    $(document).on('shopify:section:load', function(e) {
      var $section = $(e.target);

      if ($section.hasClass('mount-header')) {
        window.CUBER.Nav.mount();
      }
      if ($section.hasClass('mount-images')) {
        window.CUBER.Images.mount();
      }
      if ($section.hasClass('mount-video')) {
        window.CUBER.Video.mount();
      }
      if ($section.hasClass('mount-social')) {
        window.CUBER.Social.mount($section);
      }
      if (
        $section.hasClass('mount-slideshow') &&
        $section.find('.box__slideshow-split').length > 0
      ) {
        window.CUBER.SplitSlider.mount(true);
        $(window).scrollTop(0);
      }
      if ($section.hasClass('mount-product')) {
        window.CUBER.Product.mount();
        window.oldSelectFunctions();
        window.advancedOptionsSelector(true);
      }
      if ($section.hasClass('mount-map')) {
        window.CUBER.Contact.mount();
      }

      if ($section.hasClass('mount-popup')) {
        window.CUBER.Popup.mount();
      }

      window.CUBER.Main.mount();
      window.CUBER.Scroll.mount();
    });

    // unload

    $(document).on('shopify:section:unload', function(e) {
      var $section = $(e.target);

      if ($section.hasClass('mount-header')) {
        window.CUBER.Nav.unmount();
      }
      if ($section.hasClass('mount-images')) {
        window.CUBER.Images.unmount();
      }
      if ($section.hasClass('mount-video')) {
        window.CUBER.Video.unmount();
      }
      if ($section.hasClass('mount-social')) {
        window.CUBER.Social.unmount();
      }
      if (
        $section.hasClass('mount-slideshow') &&
        $section.find('.box__slideshow-split').length > 0
      ) {
        window.CUBER.SplitSlider.unmount();
      }
      if ($section.hasClass('mount-product')) {
        window.CUBER.Product.unmount();
      }
      if ($section.hasClass('mount-map')) {
        window.CUBER.Contact.unmount();
      }

      window.CUBER.Main.unmount();
      window.CUBER.Scroll.unmount();
    });

    // blocks

    $(document).on('shopify:block:select', function(e) {
      var $block = $(e.target);
      if ($block.hasClass('slideshow-item')) {
        if ($('.responsive-flickity').hasClass('flickity-enabled')) {
          $('.responsive-flickity')
            .data('flickity')
            .select($block.index());
        } else {
          $(window).scrollTop($block.offset().top);
        }
        $block
          .find('.caption, .title, .subtitle')
          .css('transform', 'translateY(0)');
      }
    });

    // Various stuff that doesn't need remounting

    $(window).on('resize', function() {
      if ($(window).width() < 1024) {
      }
    });

    $('.simple-grid select:not(.styled)').each(function() {
      $(this)
        .styledSelect({
          coverClass: 'regular-select-cover',
          innerClass: 'regular-select-inner'
        })
        .addClass('styled');
      $(this)
        .parent()
        .append($.themeAssets.arrowDown);
    });

    if ($('body').hasClass('template-customers-login')) {
      if ($('#RecoverPassword').length > 0) {
        $('#RecoverPassword').on('click', function(e) {
          $('#CustomerLoginForm').hide();
          $('#RecoverPasswordForm').show();
          $('#LoginRecoverTitle').html(
            $('#LoginRecoverTitle').data('password_recovery')
          );
          e.preventDefault();
        });

        $('#HideRecoverPasswordLink').on('click', function(e) {
          $('#RecoverPasswordForm').hide();
          $('#CustomerLoginForm').show();
          $('#LoginRecoverTitle').html($('#LoginRecoverTitle').data('login'));
          e.preventDefault();
        });

        if (window.location.hash == '#recover') {
          $('#RecoverPassword').trigger('click');
        }
      }
    } else if ($('body').hasClass('template-customers-addresses')) {
      $('#section-addresses a').on('click', function() {
        window.CUBER.Scroll.mount();
      });
    }

    //

    if (
      $('body').hasClass('template-blog') ||
      $('body').hasClass('template-article')
    ) {
      window.CUBER.Main._mountScrollMovers({
        parent: $('.scroll-movers-parent'),
        items: $('.site-sharing')
      });

      window.CUBER.Main._mobileSharingInit();
    }
  });

  if ($('body').attr('id') == 'challenge') {
    document.location.hash = '';
    $('html, body').scrollTop(0);
  }
})(jQuery);

function response(data) {
  console.log(data);
}

window._getLuminance = function(hexy) {
  var rgb = this._toRgb(hexy);
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
};

window._toRgb = function(hexy) {
  var hex = hexy.replace('rgb(', '');
  hex = hex.replace(')', '');
  hex = hex.replace(' ', '');
  hex = hex.replace(' ', '');
  hex = hex.split(',');
  return { r: hex[0], g: hex[1], b: hex[2] };
};
