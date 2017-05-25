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

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.jcr.Session;

import com.adobe.cq.commerce.common.AbstractJcrCommerceService;
import com.adobe.cq.commerce.common.PriceFilter;
import org.apache.jackrabbit.api.JackrabbitSession;
import org.apache.jackrabbit.api.security.user.Authorizable;
import org.apache.jackrabbit.api.security.user.UserManager;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.Resource;

import com.adobe.cq.commerce.api.CommerceException;
import com.adobe.cq.commerce.common.AbstractJcrCommerceSession;
import com.adobe.granite.security.user.UserProperties;
import com.day.cq.commons.jcr.JcrUtil;
import com.day.cq.personalization.UserPropertiesUtil;


public class GeoCommerceSessionImpl extends AbstractJcrCommerceSession {

    private String USER_ORDERS_PATH = "/commerce/orders/order-";
    private String USER_ORDERS_DATE_TEMPLATE = "yyyy-MMM-dd";

    public GeoCommerceSessionImpl(AbstractJcrCommerceService commerceService,
                                  SlingHttpServletRequest request,
                                  SlingHttpServletResponse response,
                                  Resource resource) throws CommerceException {
        super(commerceService, request, response, resource);
        PN_UNIT_PRICE = GeoProductImpl.PN_PRICE;
    }

    protected void saveCompletedOrder() throws CommerceException {
        // Write order details to /etc/commerce/orders/ for the vendor's records.
        super.saveCompletedOrder();

        // Write order details to /home/.../shopper/commerce/orders/ for the shopper's records.
        try {
            Session userSession = resolver.adaptTo(Session.class);
            final UserProperties userProperties = request.adaptTo(UserProperties.class);
            if (userProperties != null && !UserPropertiesUtil.isAnonymous(userProperties)) {
                UserManager um = ((JackrabbitSession) userSession).getUserManager();
                Authorizable authorizable = um.getAuthorizable(userProperties.getAuthorizableID());

                SimpleDateFormat dateFormatter = new SimpleDateFormat(USER_ORDERS_DATE_TEMPLATE);
                String orderPath = authorizable.getPath() + USER_ORDERS_PATH + dateFormatter.format(Calendar.getInstance(locale).getTime());
                Node orderNode = JcrUtil.createUniquePath(orderPath, "nt:unstructured", userSession);

                List<String> entries = new ArrayList<String>();
                for (CartEntry entry : cart) {
                    entries.add(serializeCartEntry(entry));
                }

                final BigDecimal cartPreTaxPrice = getCartPriceInfo(new PriceFilter("PRE_TAX")).get(0).getAmount();
                final BigDecimal orderShipping = getCartPriceInfo(new PriceFilter("SHIPPING")).get(0).getAmount();
                final BigDecimal orderTotalTax = getCartPriceInfo(new PriceFilter("ORDER", "TAX")).get(0).getAmount();
                final BigDecimal orderTotalPrice = getCartPriceInfo(new PriceFilter("ORDER", "TOTAL")).get(0).getAmount();

                orderNode.setProperty("cartItems", entries.toArray(new String[entries.size()]));
                orderNode.setProperty("cartSubtotal", cartPreTaxPrice);
                orderNode.setProperty("orderShipping", orderShipping);
                orderNode.setProperty("orderTotalTax", orderTotalTax);
                orderNode.setProperty("orderTotalPrice", orderTotalPrice);

                List<String> details = new ArrayList<String>();
                for (Map.Entry<String, String> entry : orderDetails.entrySet()) {
                    String detail = serializeOrderDetail(entry.getKey(), entry.getValue());
                    if (detail != null) {
                        details.add(detail);
                    }
                }
                orderNode.setProperty("orderDetails", details.toArray(new String[details.size()]));

                userSession.save();
            }
        } catch (RepositoryException e) {
            throw new CommerceException("Failed to save completed order to user's home: ", e);
        }
    }

}
