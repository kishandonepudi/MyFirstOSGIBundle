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

  Journal init script (copy from /libs/wcm/core/components/init/init.jsp).

  Draws the journal initialization code. This is called by the head.jsp
  of the page. If the WCM is disabled, no output is written.

  ==============================================================================

--%><%@include file="/libs/foundation/global.jsp" %><%
%><%@page import="com.adobe.cq.social.journal.Journal,
                  com.adobe.cq.social.journal.JournalManager,
                  com.day.cq.replication.ReplicationActionType,
                  com.day.cq.wcm.api.WCMMode" %><%

    JournalManager journalMgr = resource.getResourceResolver().adaptTo(JournalManager.class);
    Journal journal = journalMgr.getJournal(slingRequest);

if (WCMMode.fromRequest(request) != WCMMode.DISABLED) {
    String dlgPath = null;
    if (editContext != null && editContext.getComponent() != null) {
        dlgPath = editContext.getComponent().getDialogPath();
    }
    if (journal.isEntry()) {
        // use different page properties dialog for journal entry
        dlgPath += "_entry";
    }
    %><cq:includeClientLib categories="cq.wcm.edit, cq.tagging, cq.security"/>
    <script type="text/javascript" >
        CQ.WCM.launchSidekick("<%= xssAPI.encodeForJSString(currentPage.getPath()) %>", {
            <%
            if (journal.isEntry()) {
                %>
                actions:[
                    CQ.wcm.Sidekick.PROPS,
                    CQ.wcm.Sidekick.DELETE,
                    {
                        text: CQ.I18n.getMessage("Activate Journal Entry"),
                        handler: function() {
                            var path = this.path;
                            var paths = [];
                            var i = 0;
                            while (i < 3) {
                                paths.push(path);
                                path = path.substring(0, path.lastIndexOf("/"));
                                i++;
                            }
                            var response;
                            while (paths.length > 0) {
                                var toActivate = paths.pop();
                                if (paths.length != 0) {
                                    var data = CQ.HTTP.eval(toActivate + "/jcr:content.1" + CQ.HTTP.EXTENSION_JSON);
                                    if (toActivate != path &&
                                            data["<%= NameConstants.PN_PAGE_LAST_REPLICATION_ACTION %>"] == "<%= ReplicationActionType.ACTIVATE.getName() %>") {
                                        continue;
                                    }
                                }
                                response = CQ.HTTP.post(
                                    "/bin/replicate.json",
                                    null,
                                    { "_charset_":"utf-8", "path":toActivate, "cmd":"Activate" }
                                );
                                if (!CQ.HTTP.isOk(response)) {
                                    CQ.Notification.notifyFromResponse(response);
                                }
                            }
                            if (CQ.HTTP.isOk(response)) {
                                CQ.Notification.notify(CQ.I18n.getMessage("Activate Journal Entry"),
                                        CQ.I18n.getMessage("Journal entry successfully activated"));
                            }
                        }
                    },
                    CQ.wcm.Sidekick.LOCK,
                    CQ.wcm.Sidekick.REFERENCES
                ],
                deleteText: CQ.I18n.getMessage("Delete Journal Entry"),
                lockText: CQ.I18n.getMessage("Lock Journal Entry"),
                <%
            }
            %>
            propsDialog: "<%= dlgPath == null ? "" : xssAPI.encodeForJSString(dlgPath) %>",
            locked: <%= currentPage.isLocked() %>
        });
    </script><%
}
%>