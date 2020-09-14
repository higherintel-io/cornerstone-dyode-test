/*
 Import all product specific js
 */
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/utils/form-utils';
import utils from '@bigcommerce/stencil-utils';
import axios from 'axios';
import cartChecker from './customCartChecker.js';


export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.$bulkPricingLink = $('[data-reveal-id="modal-bulk-pricing"]');
    }

    onReady() {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });
        /**
        Write a function with Stencil Utils that will return
        the contents of the cart object. With the response data,
        check if the a specific product exists in the cart.
        If true, then add a different product to the cart.
        */
        cartChecker();
        // utils.api.cart.getCart({}, (err, response) => {
        //     // if no cart items present or err return
        //     if (err || !response) return;
        //     // get the current contents of the shopping cart
        //     const productData = response.lineItems.physicalItems;
        //     // extract just the sku number from the products currently in the cart
        //     const productIdsInCart = productData.map(p => p.sku);
        //     // check what product is currently being viewed in the storefront
        //     const currentProductBeingViewed = window.BCData.product_attributes.sku;
        //     // check if the product being viewed matches
        //     // any of the products present in shopping cart
        //     const isProductCurrentlyInCart = productIdsInCart.filter(p => currentProductBeingViewed === p);
        //     if (isProductCurrentlyInCart.length) {
        //         return 'product already in cart, no update required';
        //     }
        //     // add item being viewed into user shopping cart
        //     axios.get(`/cart.php?action=add&sku=${window.BCData.product_attributes.sku}`).then(() => {
        //         alert('PRODUCT SUCCESSFULLY ADDED TO CART');
        //     }).catch(e => {
        //         throw new Error('error occured while adding item to cart', e);
        //     });
        // });

        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);
        this.productDetails.setProductVariant();

        videoGallery();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
            this.ariaDescribeReviewInputs($reviewForm);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        this.productReviewHandler();
        this.bulkPricingHandler();
    }

    ariaDescribeReviewInputs($form) {
        $form.find('[data-input]').each((_, input) => {
            const $input = $(input);
            const msgSpanId = `${$input.attr('name')}-msg`;

            $input.siblings('span').attr('id', msgSpanId);
            $input.attr('aria-describedby', msgSpanId);
        });
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.trigger('click');
        }
    }

    bulkPricingHandler() {
        if (this.url.indexOf('#bulk_pricing') !== -1) {
            this.$bulkPricingLink.trigger('click');
        }
    }
}
