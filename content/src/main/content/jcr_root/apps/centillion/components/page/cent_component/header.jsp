
<%@include file="/libs/foundation/global.jsp"%>
<link href="/etc/designs/centillion_design/clientlibs/css/images/clogo.png" rel="shortcut icon"  />
    <div class="header">
        <div class="container_16">
            <div class="grid_8">
                <div> <cq:include path="logo" resourceType="centillion/components/logo"/> </div>
            </div>
            <div class="grid_8">
                <div class="search_area">
                    <div> <cq:include path="userinfo" resourceType="foundation/components/userinfo"/> </div>
                    <div> </div>

                	<form action="/content/centillion_networks/search.html" method="get">
 					<fieldset>
                        <div class="input_box">
                            <input class="cq-auto-clear" type="text" name="q" placeholder="Search here"><input type="button" onclick="this.form.submit();" class="btn">
                        </div>
                    </fieldset>
                    </form>
                    <div class="clear"></div>
                </div>
            </div>
            <script type="text/javascript" src="/content/centillion_networks/home.topnav.html"></script>
        </div>
    </div>