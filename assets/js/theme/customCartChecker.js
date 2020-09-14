import utils from '@bigcommerce/stencil-utils';
import axios from 'axios';
/**
        Write a function with Stencil Utils that will return
        the contents of the cart object. With the response data,
        check if the a specific product exists in the cart.
        If true, then add a different product to the cart.
        */
export default function () {
    utils.api.cart.getCart({}, (err, response) => {
    // if no cart items present or err return
        if (err || !response) return;
        // get the current contents of the shopping cart
        const productData = response.lineItems.physicalItems;
        // extract just the sku number from the products currently in the cart
        const productIdsInCart = productData.map(p => p.sku);
        // check what product is currently being viewed in the storefront
        const currentProductBeingViewed = window.BCData.product_attributes.sku;
        // check if the product being viewed matches
        // any of the products present in shopping cart
        const isProductCurrentlyInCart = productIdsInCart.filter(p => currentProductBeingViewed === p);
        if (isProductCurrentlyInCart.length) {
            return 'product already in cart, no update required';
        }
        // add item being viewed into user shopping cart
        axios.get(`/cart.php?action=add&sku=${window.BCData.product_attributes.sku}`).then(() => {
            alert('PRODUCT SUCCESSFULLY ADDED TO CART');
        }).catch(e => {
            throw new Error('error occured while adding item to cart', e);
        });
    });
}
