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
package info.geometrixx.commons.util;

import com.day.cq.wcm.api.NameConstants;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import info.geometrixx.commons.popular.CommentRankedPopularPages;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ValueMap;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A class providing various helper functions for Geometrixx Outdoors.
 */
public class GeoHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(GeoHelper.class);
    private static final String IMAGE_SELECTOR = ".image.";
    private static final String IMAGE_EXTENSION = ".jpg";
    // Maps an image size string to the corresponding width and height dimensions
    private static Map<String, String> IMAGE_SIZE_MAP;

    static {
        IMAGE_SIZE_MAP = new HashMap<String, String>();
        IMAGE_SIZE_MAP.put("small-image", "220.150");
        IMAGE_SIZE_MAP.put("medium-image", "480.320");
        IMAGE_SIZE_MAP.put("large-image", "770.360");
        IMAGE_SIZE_MAP.put("landscape-image", "370.150");
    }

    /**
     * Tells if a string is empty or contains only white space characters
     * (characters with a code greater than '\u0020').
     * @param str   The string to be checked
     * @return      <code>true</code> if the string is null, or contains only whitespace characters.
     *              <code>false</code> otherwise.
     */
    public static boolean isEmpty(final String str) {
        return (str == null || str.trim().length() == 0);
    }

    /**
     * Tells if a string is not empty and contains other characters than white spaces
     * (characters with a code greater than '\u0020').
     * @param str   The string to be checked.
     * @return      <code>true</code> if the string is not null, and contains non-whitespace characters.
     *              <code>false</code> otherwise.
     */
    public static boolean notEmpty(final String str) {
        return (str != null && str.trim().length() > 0);
    }

    /**
     * Returns the title of the given resource. If the title is empty it will fallback to the page title, title,
     * or name of the given page.
     * @param resource  The resource.
     * @param page      The page to fallback to.
     * @return          The best suited title found (or <code>null</code> if resource is <code>null</code>).
     */
    public static String getTitle(final Resource resource, final Page page) {
        if (resource != null) {
            final ValueMap properties = resource.adaptTo(ValueMap.class);
            if (properties != null) {
                final String title = properties.get(NameConstants.PN_TITLE, String.class);
                if (notEmpty(title)) {
                    return title;
                } else {
                    return getPageTitle(page);
                }
            }
        } else {
            LOGGER.debug("Provided resource argument is null");
        }
        return null;
    }

    /**
     * Returns the page title of the given page. If the page title is empty it will fallback to the title and to the
     * name of the page.
     * @param page  The page.
     * @return      The best suited title found (or <code>null</code> if page is <code>null</code>).
     */
    public static String getPageTitle(final Page page) {
        if (page != null) {
            final String title = page.getPageTitle();
            if (isEmpty(title)) {
                return GeoHelper.getTitle(page);
            }
            return title;
        } else {
            LOGGER.debug("Provided page argument is null");
            return null;
        }
    }

    /**
     * Returns the navigation title of the given page. If the navigation title is empty it will fallback to the title
     * and to the name of the page.
     * @param page  The page.
     * @return      The best suited title found (or <code>null</code> if page is <code>null</code>).
     */
    public static String getNavTitle(final Page page) {
        if (page != null) {
            final String title = page.getNavigationTitle();
            if (isEmpty(title)) {
                return GeoHelper.getTitle(page);
            }
            return title;
        } else {
            LOGGER.debug("Provided page argument is null");
            return null;
        }
    }

    /**
     * Returns the title of the given page. If the title is empty it will fallback to the name of the page.
     * @param page  The page.
     * @return      The best suited title found (or <code>null</code> if page is <code>null</code>).
     */
    public static String getTitle(final Page page) {
        if (page != null) {
            final String title = page.getTitle();
            if (isEmpty(title)) {
                return page.getName();
            }
            return title;
        } else {
            LOGGER.debug("Provided page argument is null");
            return null;
        }
    }

    /**
     * Searches for a resource of a specific type in the given resource tree. This function will also return resources
     * which super type(s) equals the given resource type.
     * @param resource      The resource where to search.
     * @param resourceType  The resource type that should be searched for.
     * @return              The first resource of the given type that was found, or <code>null</code> if not found.
     */
    public static Resource findResourceType(Resource resource, String resourceType) {
        if (resource != null && resourceType != null) {
            if (resource.isResourceType(resourceType)) {
                return resource;
            }
            Iterator<Resource> children = resource.listChildren();
            while (children.hasNext()) {
                final Resource child = children.next();
                final Resource found = findResourceType(child, resourceType);
                if (found != null) {
                    return found;
                }
            }
        } else {
            if (resource == null) {
                LOGGER.debug("Provided resource argument is null");
            }
            if (resourceType == null) {
                LOGGER.debug("Provided resourceType argument is null");
            }
        }
        return null;
    }

    /**
     * Returns a String path to the image associated with the given page.
     * @param page  The page
     * @param size  The string size of the the image to generate. Must match a key in IMAGE_SIZE_MAP
     * @return      String path to an image, or null if there is no image associated with this page
     */
    public static String getPageImagePath(Page page, String size) {
        if (page != null && IMAGE_SIZE_MAP.containsKey(size)) {
            return page.getPath() + IMAGE_SELECTOR + IMAGE_SIZE_MAP.get(size) + IMAGE_EXTENSION;
        }

        return null;
    }

    /**
     * Returns the number of user generated comments on the given page.
     * @param page The page in question
     * @param resourceResolver
     * @return Number of user generated comments
     */
    public static int getPageCommentCount(Page page, ResourceResolver resourceResolver) {
        PageManager pageManager = resourceResolver.adaptTo(PageManager.class);
        Page userGeneratedCommentPage = pageManager.getPage(CommentRankedPopularPages.USER_GENERATED_CONTENT_PREFIX +
                page.getPath());
        return CommentRankedPopularPages.getCommentCountForPage(userGeneratedCommentPage);
    }
}