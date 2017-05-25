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
var ActivityStreams = ActivityStreams || {};

jQuery(function($){

    var ActivityStreamList = Backbone.Collection.extend({

        homePath: "/home/users/a/admin",

        initialize:function () {
            this.bind("error", this.defaultErrorHandler);
        },

        url: function() {
            return this.homePath + ".activitystreams";
        },

        parse: function(response) {
            // add empty
            var items = [{
                id: this.homePath + "/activities",
                name: "",
                containerId: "aggregate"
            }].concat(response.items);
            return items;
        },

        defaultErrorHandler: function(collection, error) {
            if (error.status === 404) {
                collection.reset();
            }
        }
    });

    var ActivityStreamListView = Backbone.View.extend({

        template: null,

        events: {
//            'click button#btn-following-add': 'addItem',
//            'click button.btn-delete-following': 'deleteItem'
        },

        initialize:function () {
            this.model.bind("change", this.render, this);
            this.model.bind("reset", this.render, this);
            this.template = _.template($('#granite-tpl-activitystreamlist').html());
        },

        render:function (eventName) {
            $(this.el).html(this.template({model: this.model}));
            return this;
        },

//        addItem: function(){
//            var userid = $("#input-following-name").val();
//            this.model.addUser(userid);
//        },
//
//        deleteItem: function(evt) {
//            var userid = $(evt.target).attr("data-userid");
//            this.model.removeUser(userid);
//        },
//
        close:function () {
            console.log(this, "close");
            this.unbind();
            this.undelegateEvents();
            this.model.unbind("change reset", this.render);
        }

    });


    var ActivityStream = Backbone.Collection.extend({

        path: "/home/users/a/admin/activities",

        initialize:function () {
            this.bind("error", this.defaultErrorHandler);
        },

        url: function() {
            return this.path;
        },

        parse: function(response) {
            return response.items;
        },

        defaultErrorHandler: function(collection, error) {
            if (error.status === 404) {
                collection.reset();
            }
        }
    });

    var ActivityStreamView = Backbone.View.extend({

        template: null,

        events: {
//            'click button#btn-following-add': 'addItem',
//            'click button.btn-delete-following': 'deleteItem'
        },

        initialize:function () {
            this.model.bind("change", this.render, this);
            this.model.bind("reset", this.render, this);
            this.template = _.template($('#granite-tpl-activitystream').html());
        },

        render:function (eventName) {
            $(this.el).html(this.template({model: this.model}));
            return this;
        },

//        addItem: function(){
//            var userid = $("#input-following-name").val();
//            this.model.addUser(userid);
//        },
//
//        deleteItem: function(evt) {
//            var userid = $(evt.target).attr("data-userid");
//            this.model.removeUser(userid);
//        },
//
        close:function () {
            console.log(this, "close");
            this.unbind();
            this.undelegateEvents();
            this.model.unbind("change reset", this.render);
        }

    });

    ActivityStreams.Client = function(){

        var activityStreamList;
        var activityStream;

        $("#input-user").on("change", function(e){
            var userPath = $(this).val();
            activityStream.path = userPath + "/activities";
            activityStream.fetch();
            activityStreamList.homePath = userPath;
            activityStreamList.fetch();
        });

        $("#input-stream").on("change", function(e){
            var streamPath = $(this).val();
            activityStream.path = streamPath;
            activityStream.fetch();
        });

        // -----------------------------------------------
        // create stream

        _g.$("#dlg-create-activitystream").on("shown", function(){
            var path = $("#input-user").val();
            $(this).find('[name="container"]').val(path);
            $(this).find('[name="name"]').focus();
        });

        $("body").on('click.activity.data-api', '[data-toggle="create-activitystream"]', function(e) {
            e.preventDefault();
            var $target = $(this).closest("#dlg-create-activitystream");
            var $modal = _g.$(this).closest(".modal");
            var containerPath = $target.find('input[name="container"]').val();
            var name = $target.find('input[name="name"]').val();

            _g.Activitystreams.createStream(containerPath, name, {
                scope: this,
                success: function(result) {
                    $modal.modal("hide");
                    activityStreamList.fetch();
                },
                error: function(result) {
                    console.log(arguments);
                }
            })
        });

        // ----------------------------------------------------
        // create activity

        _g.$("#dlg-create-activity").on("shown", function(){
            var path = $("#input-stream").val();
            $(this).find('[name="path"]').val(path);
        });

        $('#dlg-create-activity').on('click.activity.data-api', '[data-toggle="create-activity"]', function (e) {
            e.preventDefault();
            var $target = $(this).closest("#dlg-create-activity");
            var $modal = _g.$(this).closest(".modal");
            var path = $target.find('input[name="path"]').val();
            var actorId = $target.find('select[name="actorId"]').val();
            // the exact behavior of how actor-ids are handled are questionable. for now, we just
            // provide the userid
            actorId = actorId.substring(actorId.lastIndexOf('/')+1);
            var data = {
                "verb" : $target.find('input[name="verb"]').val(),
                "title": $target.find('input[name="title"]').val(),
                "content": $target.find('input[name="content"]').val(),
                "actorId": actorId,
                "object": {
                    "objectType": $target.find('input[name="object-type"]').val(),
                    "displayName": $target.find('input[name="object-displayname"]').val(),
                    "content": $target.find('input[name="object-content"]').val(),
                    "summary": $target.find('input[name="object-summary"]').val()
                },
                "target": {
                    "objectType": $target.find('input[name="target-type"]').val(),
                    "displayName": $target.find('input[name="target-displayname"]').val(),
                    "content": $target.find('input[name="target-content"]').val(),
                    "summary": $target.find('input[name="target-summary"]').val()
                }
            };

            _g.Activitystreams.append(path, data, {
                scope: this,
                success: function(result) {
                    $modal.modal("hide");
                    activityStream.fetch();

                },
                error: function(result) {
                    console.log(arguments);
                }
            })
        });

        return {
            start: function() {
                var userPath = $("#input-user").val();
                activityStreamList = new ActivityStreamList();
                activityStreamList.homePath = userPath;

                var activityStreamListView = new ActivityStreamListView({
                    el: $("#input-stream"),
                    model: activityStreamList
                });
                activityStreamListView.render();
                activityStreamList.fetch();

                activityStream = new ActivityStream();
                activityStream.path = userPath + "/activities";
                var activityStreamView = new ActivityStreamView({
                    el: $("#activitystream"),
                    model: activityStream
                });
                activityStreamView.render();
                activityStream.fetch();
            }
        }
    };

    /**
     * DHTML-style loading of activity
     */
    $("body").on('click.activity.data-api', '[data-toggle="activity"]', function (e) {
        e.preventDefault();
        var $this = $(this);
        var $target = $($this.data("target"));
        var id = $this.data("activity-id");
        var url = $target.data("url");
        $.get(url, {"id": id}, function(data){
            $target.html(data);
        });
        $(".active", $this.parent()).removeClass("active");
        $this.addClass("active");
    });

});