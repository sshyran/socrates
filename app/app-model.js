/*global Backbone Socrates _ */

var ID_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
var ID_LENGTH     = 7;

Socrates.Model = Backbone.Model.extend({

    defaults : {
        document  : null,
        documents : null
    },

    bookmarkKey : 'socrates.bookmarks',

    initialize : function (attributes, options) {
        _.bindAll(this);

        this.initializeRouter();
        this.initializeDocuments();

        this.on('change:document', this.onDocumentChange);
    },

    initializeRouter : function () {
        this.router = new Backbone.Router({
            routes : {
               ''    : 'home',
               ':id' : 'document'
            }
        })
            .on('route:home', this.onRouterHome)
            .on('route:document', this.onRouterDocument);
    },

    initializeDocuments : function () {
        var documents = new Socrates.DocumentCollection()
            .on('add remove', this.writeBookmarks)
            .on('remove', this.onDocumentRemove);

        this.set('documents', documents, {silent:true});

        _.each(this.readBookmarks(), this.addDocument);
    },


    // Actions
    // -------

    addDocument : function (id) {
        var document = new Socrates.DocumentModel({ id : id });
        this.get('documents').add(document);
        return document;
    },

    newDocument : function () {
        return this.addDocument(this.generateDocumentId());
    },

    readBookmarks : function () {
        var bookmarkString = localStorage.getItem(this.bookmarkKey);
        return bookmarkString ? bookmarkString.split(',') : [];
    },

    writeBookmarks : function () {
        var ids = this.get('documents').map(function (document) {
            return document.id;
        });
        localStorage.setItem(this.bookmarkKey, ids.join(','));
    },


    // Route Handlers
    // --------------

    onRouterHome : function () {
        this.set('document', this.newDocument());
    },

    onRouterDocument : function (id) {
        var document = this.get('documents').find(function (document) {
            return id === document.id;
        });

        document || (document = this.addDocument(id));

        this.set('document', document);
    },

    // Event Handlers
    // --------------

    onDocumentChange : function (model, document) {
        this.router.navigate(document.id);
    },

    onDocumentRemove : function (removedDocument) {
        var openDocument = this.get('document');

        // If the open document wasn't removed, don't do anything fancy.
        if (openDocument.id !== removedDocument.id) return;

        // Otherwise, we need to promote another document. Try to take the last
        // of the documents, otherwise make a fresh one.
        var document = this.get('documents').last() || this.newDocument();
        this.set('document', document);
    },


    // Helpers
    // -------

    // Generates a random new document id.
    generateDocumentId : function () {
        var id = '';
        for (var x = 0; x < ID_LENGTH; x++) {
            id += ID_CHARACTERS.charAt(Math.floor(Math.random() * 62));
        }

        return id;
    }

});