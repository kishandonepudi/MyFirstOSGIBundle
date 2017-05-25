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

/**
 * Provides a means to compare pages based on a count.
 */
public class PageRankingResult implements Comparable<PageRankingResult> {

    /**
     * Page associated with the count
     */
    private Page page;

    /**
     * The value of the metric used to determine rank
     */
    private int count;

    public PageRankingResult(Page page, int count) {
        this.page = page;
        this.count = count;
    }

    public int getCount() {
        return count;
    }

    public Page getPage() {
        return page;
    }

    public int compareTo(PageRankingResult otherPageComments) {
        if (getCount() < otherPageComments.getCount()) {
            return 1;
        }
        else if (getCount() > otherPageComments.getCount()) {
            return -1;
        }
        return 0;
    }
}