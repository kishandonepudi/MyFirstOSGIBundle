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

import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import org.apache.sling.api.resource.ResourceResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.Node;
import javax.jcr.PathNotFoundException;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.PriorityQueue;

/**
 * Finds the most popular pages below a given node based on the number of comments.
 */
public class CommentRankedPopularPages implements PopularPages {

    /**
     * Path to the user generated content
     */
    public static final String USER_GENERATED_CONTENT_PREFIX = "/content/usergenerated";

    /**
     * The maximum number of pages to return
     */
    private static final int NUMBER_OF_RECOMMENDATIONS = 3;

    /**
     * From each page, this relative node contains a count of the number of comments on the page
     */
    private static final String COMMENT_COUNTER_RELATIVE_PATH = "jcr:content/comments_index/all/counter";

    /**
     * Name of the property that contains the comment count
     */
    private static final String TOTAL_COUNT_PROPERTY = "totalCount";

    private static final Logger log = LoggerFactory.getLogger(CommentRankedPopularPages.class);

    /**
     * Returns a list up to <code>NUMBER_OF_RECOMMENDATIONS</code> long containing the most commented on
     * pages below the given <code>topLevelPagePath</code> node.
     * @param topLevelPagePath  Root node at which to start searching for popular pages.
     * @param resourceResolver
     * @return List of <code>PageRankingResult</code> objects representing the most popular pages.
     */
    public List<PageRankingResult> getPopularPages(String topLevelPagePath, ResourceResolver resourceResolver) throws RepositoryException {
        PageManager pageManager = resourceResolver.adaptTo(PageManager.class);
        Page topLevelPage = pageManager.getPage(USER_GENERATED_CONTENT_PREFIX + topLevelPagePath);

        return fetchMostCommentedPages(topLevelPage, pageManager);
    }

    /**
     * Returns the total number of comments on the given user generated page.
     * @param userGeneratedCommentPage The cq:Page containing the user generated comments, typically located in
     *     <code>/content/usergenerated</code>
     * @return Number of comments on the page
     */
    public static int getCommentCountForPage(Page userGeneratedCommentPage) {
        if (userGeneratedCommentPage != null) {
            // Find the counter node in "all"
            Node node = userGeneratedCommentPage.adaptTo(Node.class);
            try {
                Node allCommentCounter = node.getNode(COMMENT_COUNTER_RELATIVE_PATH);
                Property count = allCommentCounter.getProperty(TOTAL_COUNT_PROPERTY);
                if (count != null) {
                    return (int) count.getLong();
                }
            } catch (PathNotFoundException pathNotFoundException) {
                // Either the current user does not have access to this node or it does not exist
                log.debug("The page [" + userGeneratedCommentPage.getPath() + "] does not contain any comments.");
            } catch (RepositoryException repositoryException) {
                log.error("Error retrieving comment count for page [" + userGeneratedCommentPage.getPath() + "]", repositoryException);
            }
        }
        // No comments
        return 0;
    }

    private List<PageRankingResult> fetchMostCommentedPages(Page topLevelPage, PageManager pageManager) throws RepositoryException {
        List<PageRankingResult> popularPages = new ArrayList<PageRankingResult>();
        PriorityQueue<PageRankingResult> listOfPagesWithComments = new PriorityQueue<PageRankingResult>();

        if (topLevelPage != null) {
            // Build a list of pages ranked by their number of comments
            // TODO: add a timeframe. For example, "within the last 30 days"
            getAllPagesWithComments(topLevelPage, listOfPagesWithComments, pageManager);
        }
        // if topLevelPage is null we'll fall back to the defaults configured at the component level

        int count = 0;
        // Return the top NUMBER_OF_RECOMMENDATIONS most popular articles
        while (listOfPagesWithComments.size() > 0 && count < NUMBER_OF_RECOMMENDATIONS) {
            popularPages.add(listOfPagesWithComments.poll());
            count++;
        }

        return popularPages;
    }

    private void getAllPagesWithComments(Page page, PriorityQueue<PageRankingResult> listOfPagesWithComments, PageManager pageManager) throws RepositoryException {
        if (hasComments(page)) {
            int commentCount = getCommentCountForPage(page);
            if (commentCount > 0) {
                // Remove the prefix to reveal the actual page page
                Page actualPage = pageManager.getPage(page.getPath().substring(USER_GENERATED_CONTENT_PREFIX.length()));
                listOfPagesWithComments.add(new PageRankingResult(actualPage, commentCount));
            }
        }

        Iterator<Page> childIterator = page.listChildren();
        while (childIterator.hasNext()) {
            getAllPagesWithComments(childIterator.next(), listOfPagesWithComments, pageManager);
        }
    }

    private boolean hasComments(Page page) {
        return page.hasChild("jcr:content");
    }
}
