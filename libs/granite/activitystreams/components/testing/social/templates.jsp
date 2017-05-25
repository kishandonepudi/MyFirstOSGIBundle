<%--

  ADOBE CONFIDENTIAL
  __________________

   Copyright 2012 Adobe Systems Incorporated
   All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
  --%>
<script id="tt-tpl-profile-list" type="text/template">
    <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-user"></i>
        <@= model.selectedName @>
        <b class="caret"></b>
    </a>
    <ul class="dropdown-menu">
        <li><a href="#settings"><i class="icon-cog"></i>&nbsp;Settings</a></li>
        <li class="divider"></li>
    </ul>
</script>


<script id="tt-tpl-profile-list-item" type="text/template">
    <a href='#profiles/<@= userid @>'>
        <@ if (avatar)  { @>
        <img src="<@= avatar @>" width="14" height="14"/>
        <@ } else { @>
        <i class="icon-user"></i>
        <@ } @>
        <@= formattedName @></a>
</script>


<script id="tt-tpl-profile-detail" type="text/template">
    <div class="well">
        <p><img src="<@= avatar @>" width="160" height="160"/></p>
        <h1><@= givenName @> <@= familyName @></h1>
        <table class="table table-striped">
            <@ _.each(this.model.attributes, function(value, key) { @>
            <tr>
                <td><h6><@= key @></h6></td>
                <td><@= value @></td>
            </tr>
            <@ }); @>
            <tr>
            </tr>
        </table>
    </div>
</script>

<script id="tt-tpl-following-list" type="text/template">
    <div class="well form-horizontal">
        <table class="table">
            <tr>
                <th colspan="2"><h6>Following</h6></th>
            </tr>
            <@ _.each(model.models, function(value, key) { @>
            <tr>
                <td><div class="span2"><a href="#profiles/<@= value.get('userid') @>"><@= value.get('userid') @></a></div></td>
                <td><button data-userid="<@= value.get('userid') @>" class="btn-delete-following btn btn-mini btn-danger">Delete</button></td>
            </tr>
            <@ }); @>
            <tr>
                <td colspan="2">
                    <div class="input-append">
                        <input id="input-following-name" class="span2" type="text"><button class="btn" id="btn-following-add" type="button">Add</button>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</script>

<script id="tt-tpl-follower-list" type="text/template">
    <div class="well">
        <table class="table">
            <tr>
                <th colspan="2"><h6>Followers</h6></th>
            </tr>
            <@ _.each(model.models, function(value, key) { @>
            <tr>
                <td colspan="2"><div class="span2"><a href="#profiles/<@= value.get('userid') @>"><@= value.get('userid') @></a></div></td>
            </tr>
            <@ }); @>
        </table>
    </div>
</script>
