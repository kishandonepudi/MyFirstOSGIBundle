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

import com.day.cq.wcm.api.designer.Style;
import com.day.cq.wcm.foundation.Image;
import com.day.image.Layer;

import javax.jcr.RepositoryException;
import java.awt.Dimension;
import java.awt.Color;
import java.awt.Rectangle;

import java.io.IOException;

/**
 * Helper class for working with adaptive images.
 */
public class AdaptiveImageHelper {

    /**
     * Defines values for a number of common qualities.
     */
    public enum Quality {
        LOW(0.4), MEDIUM(0.82), HIGH(1.0);

        private double quality;

        Quality(double quality) {
            this.quality = quality;
        }
        public double getQualityValue() {
            return this.quality;
        }
    }

    /**
     * Lookup Quality value from a String.
     * @param imageQualityString
     * @return a Quality value for the requested String if it exists.
     */
    public static Quality getQualityFromString(String imageQualityString) {
        Quality newQuality;
        if (imageQualityString == null) {
            return null;
        }
        // else
        return Quality.valueOf(imageQualityString.toUpperCase());
    }

    /**
     * Scales the given image to the dimensions specified by newWidth and newHeight. The scaling algorithm will
     * always scale the image in such a way that no white space will visible around the image. This means that
     * in any case where the dimensions are not the exact aspect ratio of the image, some cropping will occur.
     * Once the image has been cropped it will be adjusted so the center of the cropped dimension is still
     * centered.
     * @param image
     * @param newWidth
     * @param newHeight specify 0 to scale based on width and keep the current aspect ratio
     * @param style     style data including user defined crop and rotation
     * @return          scaled (and/or cropped) image layer
     * @throws RepositoryException
     * @throws IOException
     */
    public Layer scaleThisImage(Image image, int newWidth, int newHeight, Style style) throws RepositoryException, IOException {
        Layer layer = applyStyleDataToImage(image, style);

        int currentWidth = layer.getWidth();
        int currentHeight = layer.getHeight();
        Dimension newSize;

        // Try resizing the width first and test if the height is > newHeight
        // We do not want any whitespace on the generated image. Trimming is fine.
        double widthRatio = (double)newWidth/currentWidth;
        double heightRatio = (double)newHeight/currentHeight;

        // Scale height proportionally to the width if set to 0
        if (newHeight == 0) {
            newHeight = (int)(currentHeight * widthRatio);
        }

        int potentialScaledHeight = (int)(currentHeight * widthRatio);
        if (potentialScaledHeight >= newHeight) {
            newSize = new Dimension(newWidth, potentialScaledHeight);
        }
        else {
            newSize = new Dimension((int)(currentWidth * heightRatio), newHeight);
        }

        return renderScaledImageOnLayer(layer, newSize, newWidth, newHeight);
    }

    /**
     * Applies style data to the given image, including crop and rotation.
     * @param image
     * @param style
     * @return Layer with style data applied.
     * @throws RepositoryException
     * @throws IOException
     */
    public Layer applyStyleDataToImage(Image image, Style style) throws RepositoryException, IOException {
        Layer layer = image.getLayer(false, false, false);

        // Apply style data
        image.loadStyleData(style);
        image.crop(layer);
        image.rotate(layer);

        return layer;
    }

    /**
     * Renders a white rectangular layer with the given dimensions.
     * @param width
     * @param height
     * @return
     */
    public static Layer renderScaledPlaceholderImage(int width, int height) {
        // Placeholder image is simply a white rectangle of the requested dimensions
        Layer background = new Layer(width, height, Color.white);
        return background;
    }

    private Layer renderScaledImageOnLayer(Layer layer, Dimension scaledSize, int newWidth, int newHeight) {
        layer.resize(scaledSize.width, scaledSize.height);

        int shiftX=0, shiftY=0;
        // One of the dimensions will be equal to the target. We need to center the other axis.
        if (scaledSize.width != newWidth) {
            shiftX = (Math.abs(scaledSize.width - newWidth) / 2);
        }
        else {
            shiftY = (Math.abs(scaledSize.height - newHeight) / 2);
        }

        Rectangle newDimensions = new Rectangle();
        newDimensions.setBounds(shiftX, shiftY, newWidth, newHeight);

        layer.crop(newDimensions);
        return layer;
    }
}
