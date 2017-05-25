<%@page session="false" %>
<%@include file="/libs/foundation/global.jsp"%>
<%@page import="org.apache.sling.jcr.api.SlingRepository,
        org.apache.jackrabbit.api.JackrabbitSession,
        com.adobe.granite.security.user.UserProperties,
        com.adobe.granite.security.user.UserPropertiesManager,
        com.adobe.granite.security.user.UserPropertiesService,
        org.apache.jackrabbit.api.security.user.UserManager,
        org.apache.jackrabbit.api.security.user.Authorizable,    
        org.apache.jackrabbit.api.security.user.Query,    
        org.apache.jackrabbit.api.security.user.QueryBuilder,    
        org.apache.jackrabbit.api.security.user.User,
        org.apache.sling.api.resource.ResourceResolver,
        java.util.Iterator,
        java.util.List,
        java.util.ArrayList,
        org.apache.sling.commons.json.io.JSONWriter"
%><%

String search = slingRequest.getParameter("search");
String offsetString = slingRequest.getParameter("offset");
String impersonatesOnlyString = slingRequest.getParameter("impersonatesOnly");
final boolean impersonatesOnly = "true".equals(impersonatesOnlyString) || "1".equals(impersonatesOnlyString);

int offsetValue = 0;
try {
    offsetValue = Integer.parseInt(offsetString);
} catch (Exception e) {
    offsetValue = 0;
}

Session session = null;
try {
    SlingRepository repos = sling.getService(SlingRepository.class);

    ResourceResolver resolver = slingRequest.getResourceResolver();
    session = resolver.adaptTo(Session.class);

    UserManager um = resolver.adaptTo(UserManager.class);
    UserPropertiesService upService = sling.getService(UserPropertiesService.class);
    UserPropertiesManager upm = upService.createUserPropertiesManager(session, resourceResolver);

    Authorizable auth = resourceResolver.adaptTo(Authorizable.class);
    final String userID = auth.getID();
    final String paramQuery = search;
    final int paramOffset = offsetValue;
    final int paramMaxResult = 25;

    Query q = new Query() {
        public <T> void build(QueryBuilder<T> queryBuilder) {
            T condition = null;

            if (paramQuery != null) {
                String pattern = paramQuery + "%";
                String profilePath = UserPropertiesService.PROFILE_PATH + "/";
                String givenNamePath = profilePath + UserProperties.GIVEN_NAME;
                String familyNamePath = profilePath + UserProperties.FAMILY_NAME;
                String displayNamePath = profilePath + UserProperties.DISPLAY_NAME;
	
                condition = queryBuilder.or(queryBuilder.nameMatches(pattern),
                        queryBuilder.or(queryBuilder.like(givenNamePath, pattern),
                        queryBuilder.or(queryBuilder.like(familyNamePath, pattern),
                        queryBuilder.like(displayNamePath, pattern))));


            }
            // TODO: Limitation to impersonates currently does not work.
            if (false && impersonatesOnly) {
                condition = (condition == null) ? queryBuilder.impersonates(userID) : queryBuilder.and(queryBuilder.impersonates(userID), condition);
            }
            if (condition != null) queryBuilder.setCondition(condition);

            queryBuilder.setSelector(User.class);
            queryBuilder.setLimit(paramOffset, paramMaxResult);
        }
    };


    Iterator<? extends Authorizable> authorizables = um.findAuthorizables(q);

    final JSONWriter writer = new JSONWriter(response.getWriter());

    List<User> users = new ArrayList<User>();

    //Begin writing JSON response
    writer.setTidy(true);
    writer.array();
    while(authorizables.hasNext()) {
        User user = (User)authorizables.next();        

        UserProperties up = upm.getUserProperties(user, "profile");         

        // TODO Replace with HTML markup?
        writer.object();
        writer.key("id").value(user.getID());
        writer.key("givenName").value(up.getProperty(UserProperties.GIVEN_NAME));
        writer.key("familyName").value(up.getProperty(UserProperties.FAMILY_NAME));
        writer.key("email").value(up.getProperty(UserProperties.EMAIL));
        writer.key("avatarURL").value(up.getResourcePath(UserProperties.PHOTOS, "/primary/image.thumb.jpg", ""));
        writer.endObject();
    }

    writer.endArray();
} catch (Exception e) {
    // TODO: Be more specific on what exception to be catched and do proper error handling.
}
%>