<%@include file="/libs/foundation/global.jsp"%>


        <div class="container_16">
            <div class="grid_16">
                <div><cq:include path="Breadcrumb" resourceType="foundation/components/breadcrumb"/></div>
                <cq:include path="title_Node" resourceType="Training/Components/title"/>
            </div>

<%@ page import="com.aem. MyAEM " %>
<%= properties.get("title", currentPage.getTitle()) %>

<% MyAEM hw = new MyAEM (); %>
<h1><%= hw.displayMessage("OSGI Service Executed") %></h1> 



            <div class="grid_12 body_container">

                        <div><cq:include path="par" resourceType="foundation/components/parsys"/></div>

            </div>




            <div class="grid_4 right_container">
                    <div> newslist </div>
                   <div><cq:include path="ipar" resourceType="foundation/components/iparsys"/></div>
             </div>
                <div class="clear"></div>
         </div>