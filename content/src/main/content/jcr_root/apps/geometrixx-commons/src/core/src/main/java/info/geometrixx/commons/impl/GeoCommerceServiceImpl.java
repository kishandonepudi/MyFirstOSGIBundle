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

import java.util.ArrayList;
import java.util.List;

import javax.jcr.Node;
import javax.jcr.RepositoryException;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ResourceUtil;

import com.adobe.cq.commerce.api.CommerceException;
import com.adobe.cq.commerce.api.CommerceQuery;
import com.adobe.cq.commerce.api.CommerceResult;
import com.adobe.cq.commerce.api.CommerceService;
import com.adobe.cq.commerce.api.CommerceSession;
import com.adobe.cq.commerce.api.Product;
import com.adobe.cq.commerce.api.promotion.Voucher;
import com.adobe.cq.commerce.common.AbstractJcrCommerceService;
import com.adobe.cq.commerce.common.AbstractJcrCommerceServiceFactory;
import com.adobe.cq.commerce.common.AbstractJcrProduct;
import com.adobe.cq.commerce.common.promotion.AbstractJcrVoucher;
import com.day.cq.commons.jcr.JcrConstants;
import com.day.cq.commons.jcr.JcrUtil;
import com.day.cq.wcm.api.Page;

public class GeoCommerceServiceImpl extends AbstractJcrCommerceService implements CommerceService {

    private Resource resource;
    private ResourceResolver resolver;

    public GeoCommerceServiceImpl(AbstractJcrCommerceServiceFactory.Services services, Resource res) {
        super(services);
        this.resource = res;
        this.resolver = res.getResourceResolver();
    }

    public CommerceSession login(SlingHttpServletRequest request, SlingHttpServletResponse response) throws CommerceException {
        return new GeoCommerceSessionImpl(this, request, response, resource);
    }

    public Product getProduct(final String path) throws CommerceException {
        Resource resource = resolver.getResource(path);
        if (resource != null && resource.isResourceType(AbstractJcrProduct.RESOURCE_TYPE_PRODUCT)) {
            return new GeoProductImpl(resource);
        }
        return null;
    }

    public Voucher getVoucher(final String path) throws CommerceException {
        Resource resource = resolver.getResource(path);
        if (resource != null) {
            // JCR-based vouchers are cq:Pages
            Resource contentResource = resource.getChild(JcrConstants.JCR_CONTENT);
            if (contentResource != null && contentResource.isResourceType(AbstractJcrVoucher.VOUCHER_RESOURCE_TYPE)) {
                return new AbstractJcrVoucher(resource);
            }
        }
        return null;
    }

    public void catalogRolloutHook(Page blueprint, Page catalog) {
        // NOP
    }

    public void sectionRolloutHook(Page blueprint, Page section) {
        // NOP
    }

    public void productRolloutHook(Product productData, Page productPage, Product productReference) throws CommerceException {
        try {
            //
            // The out-of-the-box commerce components (such as commerce/components/product) support
            // two variant axes: "size", plus one (optional) user-defined axis.
            // The user-defined axis, if required, is specified using the "variationAxis" and
            // "variationTitle" properties.
            //
            // In the geometrixx sample product set, the optional axis is always "color".
            //
            Node productReferenceNode = productReference.adaptTo(Node.class);
            if (productData.axisIsVariant("color") && !productReferenceNode.hasProperty("variationAxis")) {
                productReferenceNode.setProperty("variationAxis", "color");
                productReferenceNode.setProperty("variationTitle", "Color");
            }

            //
            // Give product pages a product-specific thumbnail so they don't have to fall back to
            // the (generic) page_product template's thumbnail
            //
            String productImageRef = null;
            Resource productImage = resolver.getResource(productData.getImageUrl());
            if (productImage != null) {
                productImageRef = ResourceUtil.getValueMap(productImage).get("fileReference", String.class);
            }
            if (productImageRef != null) {
                Node contentNode = productPage.getContentResource().adaptTo(Node.class);
                Node pageImageNode = JcrUtil.createUniqueNode(contentNode, "image", "nt:unstructured", contentNode.getSession());
                pageImageNode.setProperty("fileReference", productImageRef);
            }

        } catch(RepositoryException e) {
            throw new CommerceException("Product rollout hook failed: ", e);
        }
    }

    public CommerceResult search(CommerceQuery query) throws CommerceException {
        return null;
    }

    public List<String> getCountries() throws CommerceException {
        List<String> countries = new ArrayList<String>();

        // A true implementation would likely need to check with its payment processing and/or
        // fulfillment services to determine what countries to accept.  This implementation
        // simply accepts them all.
        countries.add("*");

        return countries;
    }

    public List<String> getCreditCardTypes() throws CommerceException {
        List<String> ccTypes = new ArrayList<String>();

        // A true implementation would likely need to check with its payment processing
        // service to determine what credit cards to accept.  This implementation simply
        // accepts them all.
        ccTypes.add("*");

        return ccTypes;
    }
}
