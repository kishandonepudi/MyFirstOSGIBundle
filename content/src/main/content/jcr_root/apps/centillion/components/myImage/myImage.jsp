<%@ page import="com.day.cq.wcm.foundation.Image" %>
<%@include file="/libs/foundation/global.jsp" %>
<% 
    Image image = new Image(resource);

	image.setSelector(".img"); //use image script

	image.draw(out);

%> <br>