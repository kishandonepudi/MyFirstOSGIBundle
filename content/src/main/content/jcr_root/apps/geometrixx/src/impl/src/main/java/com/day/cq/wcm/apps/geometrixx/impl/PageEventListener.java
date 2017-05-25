/*
 * Copyright 1997-2008 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */
package com.day.cq.wcm.apps.geometrixx.impl;

import java.util.Iterator;

import com.day.cq.wcm.api.PageEvent;
import com.day.cq.wcm.api.PageModification;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.event.EventUtil;
import org.osgi.service.event.Event;
import org.osgi.service.event.EventConstants;
import org.osgi.service.event.EventHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This is an example listener that listens for page modification events and
 * logs a message.
 */
@Component(immediate = true)
@Service
@Property(name = EventConstants.EVENT_TOPIC, value = PageEvent.EVENT_TOPIC)
public class PageEventListener implements EventHandler {

    /**
     * default logger
     */
    private static final Logger log = LoggerFactory.getLogger(PageEventListener.class);

    /**
     * @see EventHandler#handleEvent(Event)
     */
    public void handleEvent(Event event) {
        if (EventUtil.isLocal(event)) {
            final PageEvent pageEvent = PageEvent.fromEvent(event);
            if (pageEvent != null) {
                final Iterator<PageModification> i = pageEvent.getModifications();
                while (i.hasNext()) {
                    final PageModification pm = i.next();
                    log.debug("Page event occurred: {} on {}", pm.getType(), pm.getPath());
                }
            }
        }
    }
}
