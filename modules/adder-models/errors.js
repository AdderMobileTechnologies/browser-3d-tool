class MongoRetrieveError {
    constructor(query = {}, mongoError = {}) {
        const _query = query;
        const _mongoError = mongoError;

        this.getQuery = () => { return _query };
        this.getMongoError = () => { return _mongoError };

        this.toString = () => {
            return JSON.stringify({query: _query, mongoError: _mongoError}, null, 4);
        }

    }
}

class NotOwnerError {
    constructor(providedId = "", documentOwner = "") {
        const _providedId = providedId;
        const _documentOwner = documentOwner;

        this.getProvidedId = () => { return _providedId };
        this.getDocumentOwner = () => { return _documentOwner };

        this.toString = () => {
            return JSON.stringify({providedId: _providedId, documentOwner: _documentOwner}, null, 4);
        }
    }
}

class DocumentNotFoundError {
    constructor(providedId = "", query = {}) {
        const _providedId = providedId;
        const _query = query;

        this.getProvidedId = () => { return _providedId };
        this.getQuery = () => { return query };

        this.toString = () => {
            return JSON.stringify({providedId: _providedId, query: _query}, null, 4);
        }
    }
}

module.exports = {
    MongoRetrieveError,
    NotOwnerError,
    DocumentNotFoundError
};