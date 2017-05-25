/*
 * Copyright 1997-2010 Day Management AG
 * Barfuesserplatz 6, 4001 Basel, Switzerland
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Day Management AG, ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Day.
 */

/**
 */
var Activity = function() {
    return {
        /*String*/ id: "",
        /*String*/ URL: "",
        /*String*/ path: "",
        /*String*/ verb: "",
        /*String*/ title: "",
        /*String*/ content: "",
        /*String*/ authorUserId: "",
        /*ActivityObject*/ target: null,
        /*ActivityObject*/ object: null,
        /*ActivityObject*/ provider: null,

        constructor : function(config) {
            config = config || {};
        },

        toJSON: function() {
            var res = {
                "id": this.id,
                "URL": this.URL,
                "path": this.path,
                "verb": this.verb,
                "title": this.title,
                "content": this.content,
                "authorUserId": this.authorUserId,
                "target": this.target && this.target.toJSON ? this.target.toJSON() : null,
                "object": this.object && this.object.toJSON ? this.object.toJSON() : null,
                "provider": this.provider && this.provider.toJSON ? this.provider.toJSON() : null
            };

            for(var p in res ) {
                if (!res[p]) {
                    delete res[p];
                }
            }
            return res;
        },

        getId: function() {
            return this.id;
        },

        setId: function(id) {
            this.id = id;
            return this;
        },

        getURL: function() {
            return this.URL;
        },

        setURL: function(URL) {
            this.URL = URL;
            return this;
        },

        getPath: function() {
            return this.path;
        },

        setPath: function(path) {
            this.path = path;
            return this;
        },

        getVerb: function() {
            return this.verb;
        },

        setVerb: function(verb) {
            this.verb = verb;
            return this;
        },

        getTitle: function() {
            return this.title;
        },

        setTitle: function(title) {
            this.title = title;
            return this;
        },

        getAuthorUserId: function() {
            return this.authorUserId;
        },

        setAuthorUserId: function(authorUserId) {
            this.authorUserId = authorUserId;
            return this;
        },

        getContent: function() {
            return this.content;
        },

        setContent: function(content) {
            this.content = content;
            return this;
        },

        getTarget: function() {
            return this.target;
        },

        setTarget: function(target) {
            this.target = target;
            return this;
        },

        getObject: function() {
            return this.object;
        },

        setObject: function(object) {
            this.object = object;
            return this;
        },

        getProvider: function() {
            return this.provider;
        },

        setProvider: function(provider) {
            this.provider = provider;
            return this;
        }
    }
};

var ActivityObject = function() {
    return {
        /*String*/ id: "",
        /*String*/ URL: "",
        /*String*/ objectType: "",
        /*String*/ content: "",
        /*String*/ displayName: "",
        /*String*/ summary: "",
        /*String*/ authorUserId: "",

        constructor : function(config) {
            config = config || {};
        },

        toJSON: function() {
            var res = {
                "id": this.id,
                "URL": this.URL,
                "objectType": this.objectType,
                "content": this.content,
                "displayName": this.displayName,
                "summary": this.summary,
                "authorUserId": this.authorUserId
            };

            for(var p in res ) {
                if (!res[p]) {
                    delete res[p];
                }
            }
            return res;
        },

        getId: function() {
            return this.id;
        },

        setId: function(id) {
            this.id = id;
            return this;
        },

        getURL: function() {
            return this.URL;
        },

        setURL: function(URL) {
            this.URL = URL;
            return this;
        },

        getObjectType: function() {
            return this.objectType;
        },

        setObjectType: function(objectType) {
            this.objectType = objectType;
            return this;
        },

        getContent: function() {
            return this.content;
        },

        setContent: function(content) {
            this.content = content;
            return this;
        },

        getDisplayName: function() {
            return this.displayName;
        },

        setDisplayName: function(displayName) {
            this.displayName = displayName;
            return this;
        },

        getSummary: function() {
            return this.summary;
        },

        setSummary: function(summary) {
            this.summary = summary;
            return this;
        },

        getAuthorUserId: function() {
            return this.authorUserId;
        },

        setAuthorUserId: function(authorUserId) {
            this.authorUserId = authorUserId;
            return this;
        }
    }
};
