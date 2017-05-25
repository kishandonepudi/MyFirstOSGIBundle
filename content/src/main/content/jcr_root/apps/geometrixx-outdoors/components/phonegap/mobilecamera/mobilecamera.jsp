<%--
/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
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
--%>

<%@include file="/libs/foundation/global.jsp"%>
<c:set var="nodeId" value='${fn:replace(currentNode.identifier, "-", "")}'/>

<!-- Include the mobilecamera client library -->
<cq:includeClientLib categories="cq.mobilecamera" />

<script type="text/javascript">

    // Initialize the camera component once device is ready
    document.addEventListener("deviceready", function() {

        // Initialize component with unique container element
        initializeCameraComponent( {
            rootElementId: "camera${nodeId}"
        });

    }, false);

</script>

<h2>Upload an Image</h2>

<div id="camera${nodeId}">

    <div class="cameraContainer">
        <table class="cameraTable" cellpadding="0" cellspacing="0" border="0">
	        <tr>
	            <td class="cameraIconCell">
	                <img class="cameraIcon" 
	                    src="<%= currentDesign.getPath() %>/images/phonegap/camera/camera.png" />
	            </td>
	        </tr>
	        <tr><td class="tableSpacer">&nbsp;</td></tr>
	        <tr>
	            <td class="photoButtonCell">
	                <img alt="Take photo" class="takePhoto tapable"
	                    src="<%= currentDesign.getPath() %>/images/phonegap/camera/take_photo.png" />
	            </td>
	        </tr>
	        <tr>
	            <td class="photoButtonCell">
	                <img alt="Choose photo from library" class="choosePhoto tapable"
	                    src="<%= currentDesign.getPath() %>/images/phonegap/camera/choose_library.png" />
	            </td>
	        </tr>
	        <tr><td class="tableSpacer">&nbsp;</td></tr>
	    </table>
	
	    
	    <table class="previewTable" cellpadding="0" cellspacing="0" border="0">
	        <tr>
	            <td><img class="previewImage" /></td>
	        </tr>
	    </table>
	    
    </div>
    
    <table class="submitTable" cellpadding="0" cellspacing="0" border="0">
	    <tr>
	        <td align="center"> 
	            <img alt="Submit" class="submit tapable"
	                src="<%= currentDesign.getPath() %>/images/phonegap/camera/submit.png" />
	        </td>
	        <td align="center">
	            <img alt="Discard" class="discard tapable"
	                src="<%= currentDesign.getPath() %>/images/phonegap/camera/discard.png" />
	        </td>
	    </tr>
	</table>
	
	<div class="progressBar">
	   <img src="<%= currentDesign.getPath() %>/images/phonegap/camera/progress.png" />
	</div>

    <input type="hidden" class="encodedFileContent" />
</div>
