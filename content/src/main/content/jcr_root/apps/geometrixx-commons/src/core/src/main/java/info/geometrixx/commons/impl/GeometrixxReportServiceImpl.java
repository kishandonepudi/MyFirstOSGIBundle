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

import com.day.cq.analytics.sitecatalyst.util.SitecatalystJsonItemWriter;
import com.day.cq.commons.TidyJsonItemWriter;
import info.geometrixx.commons.GeometrixxReportService;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.commons.json.JSONObject;
import org.apache.sling.settings.SlingSettingsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.Node;
import java.io.CharArrayWriter;

@Component
@Service
public class GeometrixxReportServiceImpl implements GeometrixxReportService {
    private final Logger log = LoggerFactory.getLogger(getClass());

    @Reference
    private SlingSettingsService settingsService;

    private void install(){
        //TODO: make sure our cloud service config is installed with proper credentials??
    }

    public JSONObject getReportData(Resource resource){
        return getCachedReport(resource);
    }
    protected JSONObject getCachedReport(Resource resource)
            {
        // asynchronous, deliver the stored report data
        ValueMap reportValueMap = resource.adaptTo(ValueMap.class);
        Node reportNode = resource.adaptTo(Node.class);

        try {
            String reportBasePath = reportValueMap.get("cq:reportBasePath", "/var/statistics/sitecatalyst") + reportNode.getPath();

            TidyJsonItemWriter itemWriter = new SitecatalystJsonItemWriter();
            itemWriter.setTidy(true);
            CharArrayWriter charArray = new CharArrayWriter();
            Resource report = resource.getResourceResolver().getResource(reportBasePath);
            if(report == null) {
                log.info( "No report data found for this report description");
                return null;
            }
            itemWriter.dump(report.adaptTo(Node.class), charArray, -1);
            return new JSONObject(charArray.toString());
        }catch(Exception e) {
            log.error("Error while writing analytics report", e);
            return null;
        }

    }
}
