<%@ page session="false"
         import="java.io.PrintWriter,
         java.util.Iterator,
         java.util.LinkedList,
         java.util.List,
         org.apache.sling.api.resource.ResourceResolver,
         com.day.cq.wcm.api.PageFilter,
         org.apache.sling.api.servlets.HttpConstants" %><%
%><%@include file="/libs/foundation/global.jsp" %><%

    response.setContentType("text/cache-manifest; charset=utf-8");

    boolean enabled = true;


    if (!enabled) {
        response.sendError(404);
        return;
    }

    List<Entry> resources = new LinkedList<Entry>();

    // just add all images from the design here
    addFiles(resources, resourceResolver, "/etc/designs/geometrixx_mobile/trader/images");

    // add the icons
    addIfExists(resources, resourceResolver, currentDesign.getPath() + "/favicon.ico");
    addIfExists(resources, resourceResolver, currentDesign.getPath() + "/webclip.png");
    addIfExists(resources, resourceResolver, currentDesign.getPath() + "/webclip-precomposed.png");

    // add styles
    addIfExists(resources, resourceResolver, "/etc/designs/geometrixx_mobile/trader/static.css");

    // add jquery mobile
    addFiles(resources, resourceResolver, "/etc/designs/geometrixx_mobile/trader/jqm");
    addFiles(resources, resourceResolver, "/etc/designs/geometrixx_mobile/trader/jqm/images");

    // add the pages
    Page rootPage = currentPage.getAbsoluteParent(3);
    resources.add(new Entry(rootPage));
    Iterator<Page> children = rootPage.listChildren(new PageFilter(request));
    while (children.hasNext()) {
        Page child = children.next();
        Entry e = new Entry(child);
        e.skip = true;
        resources.add(e);
    }

    // get best last modified
    long lastModified = 0;
    for (Entry r: resources) {
        long rlm = r.getLastModified();
        if (rlm > lastModified) {
            lastModified = rlm;
        }
    }

    // handle if modified since
    long modTime = lastModified / 1000; // seconds
    long ims = request.getDateHeader(HttpConstants.HEADER_IF_MODIFIED_SINCE) / 1000;
    //ims = 0; // uncomment for debugging
    if (modTime <= ims) {
        response.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
        return;
    }
    response.setDateHeader(HttpConstants.HEADER_LAST_MODIFIED, lastModified);

    PrintWriter w = new PrintWriter(out);
    w.println("CACHE MANIFEST");
    w.println("");
    w.println("CACHE:");

    for (Entry r: resources) {
        if (!r.skip) {
            w.println(r.getExternalPath());
        }
    }
    w.println("NETWORK:");
    w.println("*");
    w.flush();

%><%!

    private static void addIfExists(List<Entry> resources, ResourceResolver resolver, String path) {
        Resource r = resolver.getResource(path);
        if (r != null) {
            resources.add(new Entry(r));
        }
    }

    private static void addFiles(List<Entry> resources, ResourceResolver resolver, String path) {
        Resource imgs = resolver.getResource(path);
        if (imgs != null) {
            Iterator<Resource> rIter = imgs.listChildren();
            while (rIter.hasNext()) {
                Resource r = rIter.next();
                if (r.isResourceType("nt:file")) {
                    resources.add(new Entry(r));
                }
            }
        }
    }

    private static class Entry {

        private final Resource resource;

        private final Page page;

        private boolean skip;

        private Entry(Resource resource) {
            this.resource = resource;
            this.page = null;
        }

        private Entry(Page page) {
            this.page = page;
            this.resource = null;
        }

        public long getLastModified() {
            if (page != null) {
                return page.getLastModified().getTimeInMillis();
            } else {
                return resource.getResourceMetadata().getModificationTime();
            }
        }

        public String getExternalPath() {
            if (page != null) {
                return page.getPath() + ".html";
            } else {
                return resource.getPath();
            }
        }
    }
%>
