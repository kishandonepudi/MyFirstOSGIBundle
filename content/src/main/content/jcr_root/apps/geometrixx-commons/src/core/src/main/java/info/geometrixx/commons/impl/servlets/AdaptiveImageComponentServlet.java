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
package info.geometrixx.commons.impl.servlets;

import com.day.cq.wcm.commons.AbstractImageServlet;
import com.day.cq.wcm.foundation.Image;
import com.day.image.Layer;
import info.geometrixx.commons.impl.AdaptiveImageHelper;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Properties;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.commons.osgi.PropertiesUtil;
import org.osgi.service.component.ComponentContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Dictionary;
import java.util.Iterator;
import java.util.List;

/**
 * Servlet to render adaptive image component images in a variety of widths and qualities.
 */
@Component(metatype = true, label = "Adobe CQ Adaptive Image Component Servlet",
        description = "Render adaptive images in a variety of qualities")
@Service
@Properties(value = {
    @Property(name = "sling.servlet.resourceTypes", value = "sling/servlet/default", propertyPrivate = true),
    @Property(name = "sling.servlet.selectors", value = "adapt", propertyPrivate = true),
    @Property(name = "sling.servlet.extensions", value = "jpg", propertyPrivate = true)
})
public class AdaptiveImageComponentServlet extends AbstractImageServlet {

    private static final Logger log = LoggerFactory.getLogger(AdaptiveImageComponentServlet.class);
    private static final long serialVersionUID = 42L;

    // Selector to indicate that we should not scale the image at all, only adjust the quality.
    private static final String FULL_SIZE_SELECTOR = "full";

    @Property(value = {
            "320", // iPhone portrait
            "480", // iPhone landscape
            "476", // iPad portrait
            "620" // iPad landscape
    },
            label = "Supported Widths",
            description = "List of widths this component is permitted to generate.")
    private static final String PROPERTY_SUPPORTED_WIDTHS = "adapt.supported.widths";
    private List<String> supportedWidths;

    protected void activate(ComponentContext componentContext) {
        Dictionary<String, Object> properties = componentContext.getProperties();

        supportedWidths = new ArrayList<String>();
        String[] supportedWidthsArray = PropertiesUtil.toStringArray(properties.get(PROPERTY_SUPPORTED_WIDTHS));
        if (supportedWidthsArray != null && supportedWidthsArray.length > 0) {
            for (String width : supportedWidthsArray) {
                supportedWidths.add(width);
            }
        }
    }

    @Override
    protected Layer createLayer(ImageContext imageContext) throws RepositoryException, IOException {
        SlingHttpServletRequest request = imageContext.request;
        String selectors[] = request.getRequestPathInfo().getSelectors();
        // We expect exactly 3 selectors. If more or less: return null
        if (selectors.length != 3) {
            log.error("Expected a width and quality selector.");
            return null;
        }

        // selectors: [1] width, [2] quality
        String widthSelector = selectors[1];
        // Ensure this is one of our supported widths
        if (isDimensionSupported(widthSelector) == false) {
            log.error("Unsupported width requested: {}.", widthSelector);
            return null;
        }

        Image image = new Image(imageContext.resource);
        // If this image does not have a valid file reference OR image child, return an empty layer
        if (!image.hasContent()) {
            log.error("The image associated with this page does not have a valid file reference; drawing a placeholder.");
            // This should never occur - in author mode we render a placeholder in absence of an image.
            return null;
        }

        AdaptiveImageHelper adaptiveHelper = new AdaptiveImageHelper();

        if (FULL_SIZE_SELECTOR.equals(widthSelector)) {
            // No scaling is necessary in this case
            return adaptiveHelper.applyStyleDataToImage(image, imageContext.style);
        }
        // else
        return adaptiveHelper.scaleThisImage(image, Integer.parseInt(widthSelector), 0, imageContext.style);
    }

    /**
     * Query if this servlet has been configured to render images of the given width.
     * This method could be overridden to always return true in the case where any dimension
     * combination is permitted.
     * @param widthStr     Width of the image to render, or "full"
     * @return          true if the given dimensions are supported, false otherwise
     */
    protected boolean isDimensionSupported(String widthStr) {
        Iterator<String> iterator = getSupportedWidthsIterator();
        if (FULL_SIZE_SELECTOR.equals(widthStr)) {
            return true;
        }
        int width = Integer.parseInt(widthStr);
        while (iterator.hasNext()) {
            if (width == (Integer.parseInt(iterator.next()))) {
                return true;
            }
        }

        return false;
    }

    /**
     * An iterator to the collection of widths this servlet is configured to render.
     * @return  Iterator
     */
    protected Iterator<String> getSupportedWidthsIterator() {
        return supportedWidths.iterator();
    }

    @Override
    protected void writeLayer(SlingHttpServletRequest request, SlingHttpServletResponse response, ImageContext context, Layer layer) throws IOException, RepositoryException {
        double quality;
        // If the quality selector exists, use it
        String selectors[] = request.getRequestPathInfo().getSelectors();
        if (selectors.length == 3) {
            String imageQualitySelector = selectors[2];
            quality = getRequestedImageQuality(imageQualitySelector);
        } else {
            // If the quality selector does not exist, fall back to the default
            quality = getImageQuality();
        }

        writeLayer(request, response, context, layer, quality);
    }

    private double getRequestedImageQuality(String imageQualitySelector) {
        // If imageQualitySelector is not a valid Quality, fall back to teh default
        AdaptiveImageHelper.Quality newQuality = AdaptiveImageHelper.getQualityFromString(imageQualitySelector);
        if (newQuality != null ) {
            return newQuality.getQualityValue();
        }
        // Fall back to the defaut
        return getImageQuality();
    }

    @Override
    protected String getImageType() {
        return "image/jpeg";
    }
}
