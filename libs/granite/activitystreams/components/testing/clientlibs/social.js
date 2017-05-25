/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
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
 */

// completely at the wrong place!!!
_.templateSettings = {
    interpolate: /\<\@\=(.+?)\@\>/gim,
    evaluate: /\<\@(.+?)\@\>/gim
};
var Social = Social || {};

jQuery(function($){

    var RelationshipList = Backbone.Collection.extend({

        urlRoot: "/bin/granite/social.graph/",

        userId: "aparker@geometrixx.info",
        type: "following",
        inverse: false,

        initialize:function () {
        },

        url: function() {
            var params = this.inverse ? "?inverse=true": "";
            return this.urlRoot + this.userId + "/relationships/" + this.type + ".json" + params;
        },

        parse: function(response) {
            // transform into array
            var ret = [];
            _.each(response, function(value, key){
                value.userid = key;
                value.id = key; // use key as 'id' to keep backbone happy
                ret.push(value);
            });
            return ret;
        },

        addUser: function(userid) {
            if (this.inverse) {
                // prevent modification for inverse operations
                return;
            }
            var self = this;
            var otherId = encodeURIComponent(userid);
            var url = encodeURI(this.urlRoot + this.userId + "/relationships/" + this.type + "/" + otherId);
            $.ajax(url, {
                type: "POST",
                success: function() {
                    self.fetch();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                }
            })
        },

        removeUser: function(userid) {
            if (this.inverse) {
                // prevent removal for inverse operations
                return;
            }
            var self = this;
            var otherId = encodeURIComponent(userid);
            var url = encodeURI(this.urlRoot + this.userId + "/relationships/" + this.type + "/" + otherId);
            $.ajax(url, {
                type: "DELETE",
                success: function() {
                    self.fetch();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                }
            })

        }

    });

    var RelationshipListView = Backbone.View.extend({

        template: null,

        events: {
            'click button#btn-following-add': 'addItem',
            'click button.btn-delete-following': 'deleteItem'
        },

        initialize:function () {
            this.model.bind("change", this.render, this);
            this.model.bind("reset", this.render, this);
            // initialize template when needed
            this.template = _.template($('#tt-tpl-following-list').html());
        },

        render:function (eventName) {
            $(this.el).html(this.template({model: this.model}));
            return this;
        },

        addItem: function(){
            var userid = $("#input-following-name").val();
            this.model.addUser(userid);
        },

        deleteItem: function(evt) {
            var userid = $(evt.target).attr("data-userid");
            this.model.removeUser(userid);
        },

        close:function () {
            console.log(this, "close");
            this.unbind();
            this.undelegateEvents();
            this.model.unbind("change reset", this.render);
        }

    });

    var FollowersListView = Backbone.View.extend({

        template: null,

        initialize:function () {
            this.model.bind("change", this.render, this);
            this.model.bind("reset", this.render, this);
            this.template = _.template($('#tt-tpl-follower-list').html());
        },

        render:function (eventName) {
            $(this.el).html(this.template({model: this.model}));
            return this;
        },

        close:function () {
            console.log(this, "close");
            this.unbind();
            this.model.unbind("change reset", this.render);
        }

    });

    var Profile = Backbone.Model.extend({

        urlRoot: "/libs/granite/activitystreams/content/testing/social.profiles.json/",
        idAttribute: "userid",

        defaults: {
            userid: null,
            givenName: "",
            familyName: ""
        },
        initialize:function () {
        }

    });

    var ProfileList = Backbone.Collection.extend({
        url: "/libs/granite/activitystreams/content/testing/social.profiles.json",
        model: Profile,
        selected: "admin",
        selectedName: "admin",

        select: function(userid) {
            this.selected = userid;
            var prof = this.get(userid);
            if (prof) {
                this.selectedName = prof.get("formattedName");
            } else {
                this.selectedName = userid;
            }
            this.trigger("change:selected");
        }

    });

    var ProfileView = Backbone.View.extend({

        tagName:"li",

        initialize:function () {
            this.template = _.template($('#tt-tpl-profile-list-item').html());
            this.model.bind("change", this.render, this);
        },

        render:function (eventName) {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },

        close:function () {
            console.log(this, "close");
            this.unbind();
            this.model.unbind("change", this.render);
        }

    });

    var ProfileDetailView = Backbone.View.extend({

        tagName:"div",

        initialize:function () {
            this.template = _.template($('#tt-tpl-profile-detail').html());
            this.model.bind("change", this.render, this);
        },

        render:function (eventName) {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }

    });

    var ProfileListView = Backbone.View.extend({

        tagName:"li",
        className: "dropdown",

        initialize:function () {
            this.template = _.template($('#tt-tpl-profile-list').html());
            this.model.bind('add', this.appendItem, this);
            this.model.on("change:selected", this.render, this);
        },

        render:function (eventName) {
            var self = this;
            $(this.el).html(this.template(this));
            _(this.model.models).each(function(item){ // in case collection is not empty
                self.appendItem(item);
            }, this);
            return this;
        },
        appendItem: function(item){
            var itemView = new ProfileView({
                model: item
            });
            $('ul', this.el).append(itemView.render().el);
        },

        close:function () {
            console.log(this, "close");
            this.unbind();
            this.model.unbind("add", this.appendItem);
            this.model.off("change:selected");
        }

    });

    Social.AppRouter = Backbone.Router.extend({

        routes:{
            "":"home",
            "contact":"contact",
            "profiles/:id":"profileDetails"
        },

        home:function () {
            if (!this.list) {
                this.profileDetails("admin"); // todo, get current user
            }
        },

        profileDetails:function (id) {
            var profile = new Profile({userid:id});
            if (this.list) {
                this.list.select(id);
            } else {
                this.settings(id);
            }
            profile.fetch({
                success:function (data) {
                    // Note that we could also 'recycle' the same instance of EmployeeFullView
                    // instead of creating new instances
                    $('#content').html(new ProfileDetailView({model:data}).render().el);
                }
            });

            this.following = new RelationshipList();
            this.following.userId = id;
            if (this.followingList) {
                this.followingList.close();
            }
            this.followingList = new RelationshipListView({
                el: $("#following"),
                model: this.following
            });
            this.followingList.render();
            this.following.fetch();

            // followers
            this.followers = new RelationshipList();
            this.followers.userId = id;
            this.followers.inverse = true;
            if (this.followersList) {
                this.followersList.close();
            }
            this.followersList = new FollowersListView({
                el: $("#followers"),
                model: this.followers
            });
            this.followersList.render();
            this.followers.fetch();

        },

        settings:function (id) {
            var self = this;
            self.list = new ProfileList();
            self.list.fetch({success: function() {
                if (id) {
                    self.list.select(id);
                }
                if (self.listView) {
                    self.listView.close();
                }
                self.listView = new ProfileListView({model: self.list});
                $('#nav-menu-userselect').html(self.listView.render().el);
            }});
        }

    });
});
