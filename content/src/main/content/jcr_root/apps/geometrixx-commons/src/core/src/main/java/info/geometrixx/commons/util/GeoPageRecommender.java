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

import com.day.cq.commons.RangeIterator;
import com.day.cq.tagging.Tag;
import com.day.cq.tagging.TagManager;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Chooses pages based on a collection of tags.
 */
public class GeoPageRecommender {

    // The number of recommendations to make
    private static final int NUMBER_OF_RECOMMENDATIONS = 3;

    private static final Logger log = LoggerFactory.getLogger(GeoPageRecommender.class);

    /**
     * This method will return a collection of pages related to the list of tag IDs.
     * @param topTags           List of tag IDs in order of their prevalence in the current user's browsing.
     * @param topLevelPagePath  The top level page to search below for recommendations.
     * @param resourceResolver
     * @return                  A list of pages to recommend to the user.
     */
    public static List<Page> getPageRecommendations(List<String> topTags, String topLevelPagePath, ResourceResolver resourceResolver) {
        if (topTags == null || topLevelPagePath == null || resourceResolver == null) {
            return null;
        }

        List<Page> recommendedPages = null;
        try {
            TagManager tagManager = resourceResolver.adaptTo(TagManager.class);
            PageManager pageManager = resourceResolver.adaptTo(PageManager.class);
            Page topLevelPage = pageManager.getPage(topLevelPagePath);
            List<Tag> tagList = buildTagList(topTags, tagManager);

            recommendedPages = buildListOfRecommendedPages(tagList, topLevelPage, NUMBER_OF_RECOMMENDATIONS, tagManager, pageManager);
        }
        catch (RepositoryException e) {
            log.error("Error building page recommendations.", e);
        }

        return recommendedPages;
    }

    private static List<Tag> buildTagList(List<String> topTags, TagManager tagManager) {
        List<Tag> tagList = new ArrayList<Tag>();

        for (String tagId : topTags) {
            tagList.add(tagManager.resolve(tagId));
        }

        return tagList;
    }

    /**
     * This method uses a points system to calculate how relevant a page will be to a user based on the most
     * prevelant tags in their Client Context tag cloud.
     */
    private static List<Page> buildListOfRecommendedPages(List<Tag> tagList, Page topLevelPageNode, int numberOfRecommendationsToMake, TagManager tagManager, PageManager pageManager) throws RepositoryException {
        // Maximum number of points for matching the top tag is the # of tags
        // Least amount of points for a match is always 1
        int pointsForAMatch = tagList.size();

        // List to track the number of points accumulated for each matching page
        List<PagePointsTracker> matchingPagesTrackerList = new ArrayList<PagePointsTracker>();
        String[] tagIdArray = new String[1];

        for (Tag tag : tagList) {
            tagIdArray[0] = tag.getTagID();
            // Find all resources which have been tagged with the given tag ID
            RangeIterator<Resource> rangeIterator = tagManager.find(topLevelPageNode.getPath(), tagIdArray);
            while (rangeIterator.hasNext()) {
                Resource currentResource = rangeIterator.next();
                Page currentPage = pageManager.getContainingPage(currentResource);
                // In this case we're only concerned with the tagged cq:Pages
                if (currentPage != null) {
                    // Add the page to our list with the current number of points
                    PagePointsTracker newTracker = new PagePointsTracker(currentPage, pointsForAMatch);
                    matchingPagesTrackerList.contains(newTracker);
                    int trackerIndex = matchingPagesTrackerList.indexOf(newTracker);
                    if (trackerIndex != -1) {
                        // This page has already been matched once; increment its total number of points
                        matchingPagesTrackerList.get(trackerIndex).incrementPoints(pointsForAMatch);
                    }
                    else {
                        // A new match. Add it to the tracker list.
                        matchingPagesTrackerList.add(newTracker);
                    }
                }
            }
            // Decrement the number of points available on each iteration
            pointsForAMatch--;
        }

        return sortAndPruneTheRecommendations(numberOfRecommendationsToMake, matchingPagesTrackerList);
    }

    private static List<Page> sortAndPruneTheRecommendations(int numberOfRecommendationsToMake, List<PagePointsTracker> matchingPagesTrackerList) {
        List<Page> recommendedPages = new ArrayList<Page>();
        Collections.sort(matchingPagesTrackerList);
        for (int i = 0; i < numberOfRecommendationsToMake && i < matchingPagesTrackerList.size(); i++) {
            recommendedPages.add(matchingPagesTrackerList.get(i).getPage());
        }
        return recommendedPages;
    }

    /**
     * Private inner class to track the number of points accumulated by a matching page.
     */
    private static class PagePointsTracker implements Comparable<PagePointsTracker> {
        private Page page;
        private int points;

        public PagePointsTracker(Page page, int points) {
            setPage(page);
            incrementPoints(points);
        }

        public Page getPage() {
            return page;
        }
        public void setPage(Page page) {
            this.page = page;
        }

        public int getPoints() {
            return points;
        }
        public void incrementPoints(int points) {
            this.points += points;
        }

        public int compareTo(PagePointsTracker otherPagePointsTracker) {
            return getPoints() - otherPagePointsTracker.getPoints();
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;

            PagePointsTracker that = (PagePointsTracker) o;

            if (getPage() != null && getPage().getPath() != null && that.getPage() != null) {
                return getPage().getPath().equals( that.getPage().getPath() );
            }

            return getPage() == that.getPage();
        }

        @Override
        public int hashCode() {
            return page != null ? page.hashCode() : 0;
        }
    }
}
