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

import java.util.ArrayList;
import java.util.List;

import javax.jcr.RepositoryException;

import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ValueMap;

/**
 * Finds the most popular pages below a given node based on the default configurations.
 */
public class DefaultPopularPages implements PopularPages {

    private final Resource resource;

    public DefaultPopularPages(Resource resource) {
        this.resource = resource;
    }

    /**
     * Returns a list of pre-configured pages to supplement the popular-pages component in the absence of comments.
     *
     * @param topLevelPagePath Root node at which to start searching for popular pages.
     * @param resourceResolver Sling Resource resolver
     * @return List of <code>PageRankingResult</code> objects representing the most popular pages.
     */
    public List<PageRankingResult> getPopularPages(String topLevelPagePath, ResourceResolver resourceResolver) throws RepositoryException {
        List<PageRankingResult> results = new ArrayList<PageRankingResult>();
        PageManager pageManager = resourceResolver.adaptTo(PageManager.class);

        ValueMap properties = resource.adaptTo(ValueMap.class);
        String[] propNames = new String[]{"firstDefault", "secondDefault", "thirdDefault"};
        for (String propName : propNames) {
            String path = properties.get(propName, String.class);
            if (path != null) {
                Page p = pageManager.getPage(path);
                if (p != null) {
                    results.add(new PageRankingResult(p, 0));
                }
            }
        }

        return results;
    }

}
