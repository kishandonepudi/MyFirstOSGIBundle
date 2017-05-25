<%@include file="/libs/foundation/global.jsp"%>
    <div class="header">
        <div class="container_16">
            <div class="grid_8">
                <cq:include path="logo" resourceType="Training/Components/logo"/>
            </div>
            <div class="grid_8">
                <div class="search_area">
                    <div> <cq:include path="userinfo" resourceType="foundation/components/userinfo"/> </div>

                    <div> </div>

                	<form action="/content/TrainingPage/English/toolbar/Search.html" method="get">
 					<fieldset>
                        <div class="input_box">
                            <input class="cq-auto-clear" type="text" name="q" placeholder="Search here"><input type="button" onclick="this.form.submit();" class="btn">
                        </div>
                    </fieldset>
                    </form>
                    <div class="clear"></div>
                </div>
            </div>
           <cq:include path="topnav" resourceType="Training/Components/topnav"/>
        </div>
