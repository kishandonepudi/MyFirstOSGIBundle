<%--
  Copyright 1997-2008 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Journal: Page component

  ==============================================================================

--%><%@page session="false" contentType="text/html; charset=utf-8" %><%
%><%@ page import="java.util.Map,
java.util.List,
java.util.HashMap,
org.apache.commons.lang.StringUtils,
org.apache.sling.api.resource.ValueMap,
org.apache.sling.api.resource.ResourceUtil,
org.apache.sling.api.wrappers.ValueMapDecorator,
com.adobe.cq.social.journal.Journal,
com.adobe.cq.social.journal.JournalEntry,
com.adobe.cq.social.journal.JournalManager,
com.day.cq.wcm.foundation.forms.FormResourceEdit,
com.day.cq.wcm.foundation.forms.FormsHelper" %><%
%><%@include file="/libs/foundation/global.jsp" %><%
%><%

	final String PARAM_TITLE = "title";
	final String PARAM_TEXT = "text";
	final String PARAM_TAGS = "tags";
	final String REQ_ATTR_GLOBAL_LOAD_MAP = "cq.form.loadmap";
	
	List<Resource> resources = FormResourceEdit.getResources(slingRequest);
	if (resources != null) {
	    if (resources.size() == 1) {
	        FormsHelper.setFormLoadResource(slingRequest, FormResourceEdit.getMergedResource(resources));
	    }
	}
	
    String journalPath = currentPage.getParent().getPath();
    JournalManager journalMgr = resource.getResourceResolver().adaptTo(JournalManager.class);
    Journal journal = journalMgr.getJournal(slingRequest, journalPath);
    if (journal != null) {
        slingRequest.setAttribute(JournalManager.ATTR_JOURNAL, journal);
    }
    
    final ValueMap props = ResourceUtil.getValueMap(resource);
    if(journalMgr != null){
        try {
	    	String journalEntryPath = resources.get(0).getPath();
	        final JournalEntry entry = journalMgr.getJournalEntry(slingRequest, journalEntryPath);
	        if (entry != null) {
	            final Map<String, Object> customProperties = new HashMap<String, Object>() {{
	                put(PARAM_TITLE, entry.getTitle());
	                put(PARAM_TEXT, entry.getText());
	                put(PARAM_TAGS, entry.getTags());
	            }};
	            ValueMap map = new ValueMapDecorator(customProperties);
	            slingRequest.setAttribute(REQ_ATTR_GLOBAL_LOAD_MAP, map);
	        }
        } catch (NullPointerException e) {
        	log.error("Edit form page should be appended after the UGC node path");
        }
    }
 
%><html>
<cq:include script="head.jsp"/>
<cq:include script="body.jsp"/>
</html>