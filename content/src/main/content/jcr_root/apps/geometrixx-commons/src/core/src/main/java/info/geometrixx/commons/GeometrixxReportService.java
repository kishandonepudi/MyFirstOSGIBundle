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
package info.geometrixx.commons;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.commons.json.JSONObject;

/**
 * Created with IntelliJ IDEA.
 * User: tnorris
 * Date: 12/21/12
 * Time: 11:46 AM
 * To change this template use File | Settings | File Templates.
 */
public interface GeometrixxReportService {
    public JSONObject getReportData(Resource resource);
}
