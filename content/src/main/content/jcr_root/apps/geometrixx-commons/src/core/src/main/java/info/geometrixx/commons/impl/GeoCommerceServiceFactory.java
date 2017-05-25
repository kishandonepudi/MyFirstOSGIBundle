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

import com.adobe.cq.commerce.api.CommerceService;
import com.adobe.cq.commerce.api.CommerceServiceFactory;
import com.adobe.cq.commerce.common.AbstractJcrCommerceServiceFactory;

import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Properties;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.resource.Resource;

/**
 * Geometrixx-specific implementation for the {@link CommerceServiceFactory} interface.
 */
@Component(metatype = true, label = "Day CQ Commerce Factory for Geometrixx-Outdoors")
@Service
@Properties(value = {
        @Property(name = "service.description", value = "Factory for reference implementation commerce service"),
        @Property(name = "commerceProvider", value = "geometrixx")
})
public class GeoCommerceServiceFactory extends AbstractJcrCommerceServiceFactory implements CommerceServiceFactory {

    /**
     * Create a new <code>GeoCommerceServiceImpl</code>.
     */
    public CommerceService getCommerceService(Resource res) {
        return new GeoCommerceServiceImpl(getServices(), res);
    }
}
