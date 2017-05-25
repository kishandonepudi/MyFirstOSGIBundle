/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/
package info.geometrixx.commons.impl;

import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.ResourceUtil;
import org.apache.sling.api.resource.ValueMap;

import com.adobe.cq.commerce.api.CommerceException;
import com.adobe.cq.commerce.api.CommerceSession;
import com.adobe.cq.commerce.api.CommerceSession.CartEntry;
import com.adobe.cq.commerce.api.PriceInfo;
import com.adobe.cq.commerce.api.Product;
import com.adobe.cq.commerce.api.promotion.Promotion;
import com.adobe.cq.commerce.api.promotion.PromotionHandler;
import com.adobe.cq.commerce.common.CommerceHelper;
import com.adobe.cq.commerce.common.PriceFilter;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;

/**
 * PromotionHandler which adds a particular product (at no charge) to the cart.
 */
@Component(metatype = false)
@Service
@Property(name = PromotionHandler.TYPE, value = "/apps/geometrixx-outdoors/components/free_gift_promotion")
public class FreeGiftPromotionHandler implements PromotionHandler {

    public PriceInfo applyCartEntryPromotion(CommerceSession commerceSession, Promotion promotion, CartEntry cartEntry) throws CommerceException {
        //
        // If this line-item is the gift, discount it by the unit cost:
        //
        ValueMap config = ResourceUtil.getValueMap(promotion.getConfigResource());
        String giftProductPath = config.get("giftProductPath", "");
        if (getProductPagePath(cartEntry.getProduct()).equals(giftProductPath)) {
            return cartEntry.getPriceInfo(new PriceFilter("UNIT", "PRE_TAX")).get(0);
        }
        return null;
    }

    public PriceInfo applyOrderPromotion(CommerceSession commerceSession, Promotion promotion) throws CommerceException {
        //
        // Make sure the gift is added to the cart:
        //
        ValueMap config = ResourceUtil.getValueMap(promotion.getConfigResource());
        String giftProductPath = config.get("giftProductPath", "");
        if (!productInCart(giftProductPath, commerceSession)) {
            PageManager pageManager = promotion.getConfigResource().getResourceResolver().adaptTo(PageManager.class);
            Page productPage = pageManager.getPage(giftProductPath);
            Product giftProduct = productPage != null ? CommerceHelper.findCurrentProduct(productPage) : null;
            if (giftProduct != null) {
                commerceSession.addCartEntry(giftProduct, 1);
            }
        }
        return null;
    }

    public PriceInfo applyShippingPromotion(CommerceSession commerceSession, Promotion promotion) throws CommerceException {
        return null;
    }

    public String getMessage(SlingHttpServletRequest request, CommerceSession commerceSession, Promotion promotion) throws CommerceException {
        return null;
    }

    public void invalidateCaches() {
        // NOP
    }

    //
    // Turn the product page URL into a simple path for comparison
    //
    private String getProductPagePath(Product product) {
        String href = product.getPagePath();
        int extension = href.indexOf(".html");
        if (extension > 0) {
            return href.substring(0, extension);
        } else {
            int fragment = href.indexOf('#');
            if (fragment > 0) {
                return href.substring(0, fragment);
            }
        }
        return href;
    }

    private boolean productInCart(String productPath, CommerceSession commerceSession) throws CommerceException {
        for (CartEntry entry : commerceSession.getCartEntries()) {
            if (getProductPagePath(entry.getProduct()).equals(productPath)) {
                return true;
            }
        }
        return false;
    }
}

