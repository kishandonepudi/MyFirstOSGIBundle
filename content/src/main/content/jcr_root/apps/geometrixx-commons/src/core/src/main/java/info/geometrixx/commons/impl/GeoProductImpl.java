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

import com.adobe.cq.commerce.common.AbstractJcrProduct;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import info.geometrixx.commons.util.GeoHelper;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;

public class GeoProductImpl extends AbstractJcrProduct {
    public static final String PN_IDENTIFIER = "identifier";
    public static final String PN_PRICE = "price";

    protected final ResourceResolver resourceResolver;
    protected final PageManager pageManager;
    protected final Page productPage;
    protected String brand = null;

    public GeoProductImpl(Resource resource) {
        super(resource);

        resourceResolver = resource.getResourceResolver();
        pageManager = resourceResolver.adaptTo(PageManager.class);
        productPage = pageManager.getContainingPage(resource);
    }

    public String getSKU() {
        String sku = getProperty(PN_IDENTIFIER, String.class);
        // Geometrixx products don't have unique ids for size, so append the size to the sku:
        String size = getProperty("size", String.class);
        if (size != null && size.length() > 0) {
            sku += "-" + size;
        }
        return sku;
    }

    public <T> T getProperty(String name, Class<T> type) {
        if (name.equals("brand")) {
            return (T) getBrand();
        }

        return super.getProperty(name, type);
    }
        
    public String getBrand() {
        // A null value is considered as non-initialized
        if (brand == null) {
            // Get value from root page title
            if (productPage != null)
                brand = GeoHelper.getPageTitle(productPage.getAbsoluteParent(2));
            // Make sure that the value is not null, to avoid initializing it again
            if (GeoHelper.isEmpty(brand))
                brand = "";
        }
        return brand;
    }
}
