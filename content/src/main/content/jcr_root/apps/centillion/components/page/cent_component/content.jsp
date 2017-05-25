<%@include file="/libs/foundation/global.jsp"%>
        <div class="container_16">
            <div class="grid_16">
                <div><p><cq:include path="breadcrumb" resourceType="foundation/components/breadcrumb"/></p></div>

            </div>
            <div class="grid_12 body_container">
                <div><cq:include path="par" resourceType="foundation/components/parsys"/></div>

            </div>
                <div class="grid_4 right_container">


                 <div> <cq:include path="weather" resourceType="centillion/components/weather"/> </div><br><br>
                <div><cq:include path="text" resourceType="centillion/components/text"/></div>
                    <cq:include path="ipar" resourceType="foundation/components/iparsys"/>
             </div>
                <div class="clear"></div>
         </div>
