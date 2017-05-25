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
package info.geometrixx.commons.popular;

import org.apache.sling.api.resource.ResourceResolver;

import javax.jcr.RepositoryException;
import java.util.List;

/**
 * PopularPages describes a function for querying the most popular pages.
 */
public interface PopularPages {

    /**
     * Returns a list of <code>PageRankingResults</code> ranked from most popular to least popular.
     * @param topLevelPagePath  Root node at which to start searching for popular pages
     * @param resourceResolver
     * @return List of popular pages
     */
    public List<PageRankingResult> getPopularPages(String topLevelPagePath, ResourceResolver resourceResolver) throws RepositoryException;
}