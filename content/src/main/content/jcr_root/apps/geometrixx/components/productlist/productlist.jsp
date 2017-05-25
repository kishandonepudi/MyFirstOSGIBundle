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

  Text component

  Draws text. If it's not rich text it is formatted beforehand.

--%><%@ page import="java.io.IOException,
                     java.io.Writer,
                     java.io.PrintWriter,
                     java.util.*,
                     com.adobe.granite.xss.XSSAPI"%><%
%><%@include file="/libs/foundation/global.jsp"%><%

    String rootPath = properties.get("rootPath", "");
    if (rootPath.length() == 0) {
        rootPath = currentNode.getPath();
    }

    //String sortInfo = properties.get("sortInfo", null);

    String[] cols = new String[]{"ProductId","ProductName","Color","CatalogCode","SellingSku"};
    String[] headers = new String[]{"Product Id","Product Name","Color","Catalog Code","Sku Id"};
    String sortInfo = "ProductName";

    List<String> propertiesNames = new ArrayList<String>();
    propertiesNames.addAll(Arrays.asList(cols));

    List<String> headersNames = new ArrayList<String>();
    headersNames.addAll(Arrays.asList(headers));

    %><div class="table"><%
    Resource r = slingRequest.getResourceResolver().getResource(rootPath);

        Node rootNode = r.adaptTo(Node.class);
        ProductList pl = new ProductList(rootNode,propertiesNames,sortInfo);
        pl.draw(out,xssAPI,propertiesNames,headersNames);
    %>

</div>

<%!
    public class ProductList {
        private Set<Product> products;

        public ProductList(Node rootNode, List<String> propertiesNames, String sortInfo) throws RepositoryException {
            this.products = new TreeSet<Product>(new ProductComparator(sortInfo));

            if(rootNode!=null) {
                NodeIterator children = rootNode.getNodes();

                while (children.hasNext()) {
                    Node node = children.nextNode();
                    if(node != null) {
                        String path = node.getPath();
                        Properties properties = new Properties();
                        for (int i = 0; i < propertiesNames.size(); i++) {
                            String name = propertiesNames.get(i);
                            if(node.hasProperty(name)) {
                                properties.put(name,node.getProperty(name).getString());
                            }
                        }
                        this.products.add(new Product(path,properties));
                    }
                }
            }
        }

        public void draw(Writer w, XSSAPI xssAPI, List<String> propertiesNames, List<String> headers) throws IOException {
            PrintWriter out = new PrintWriter(w);

            out.print("<table width='100%'><tbody>");
            out.print("<tr>");
            for (String name : headers) {
                out.print("<th>");
                out.print(xssAPI.encodeForHTML(name));
                out.print("</th>");
            }
            out.print("</tr>");

            for (Product product : products) {
                out.print("<tr>");
                Properties prop = product.getProperties();
                for (String name : propertiesNames) {
                    out.print("<td>");
                    String value = (String) prop.get(name);
                    if(value!=null) {
                        out.print(xssAPI.encodeForHTML(value));
                    } else {
                        out.print("&nbsp;");
                    }
                    out.print("</td>");
                }
                out.print("</tr>");
            }
            out.print("</tbody></table>");
        }

        public Set<Product> getProducts() {
            return products;
        }
        private class ProductComparator implements Comparator<ProductList.Product> {
            private String sortInfo;
            private ProductComparator(String sortInfo) {
                this.sortInfo = sortInfo;
            }

            public int compare(ProductList.Product o1, ProductList.Product o2) {
                if(this.sortInfo!=null) {
                    String v1 = o1.getProperties().getProperty(this.sortInfo,"");
                    String v2 = o2.getProperties().getProperty(this.sortInfo,"");
                    int cmp = v1.compareTo(v2);
                    if(cmp!=0) {
                        return cmp;
                    }
                }

                return o1.getPath().compareTo(o2.getPath());
            }
        }

        public class Product {
            private String path;
            private Properties properties;

            public Product(String path, Properties properties) {
                this.path = path;
                this.properties = properties;
            }

            public String getPath() {
                return path;
            }

            public void setPath(String path) {
                this.path = path;
            }

            public Properties getProperties() {
                return properties;
            }

            public void setProperties(Properties properties) {
                this.properties = properties;
            }
        }
    }
%>