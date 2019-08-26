import { Texture } from BABYLON;
// What kind of types do we need to accept?
//  Base64
//  Data

class Image {
    constructor(_newImageData = null, _type = null, _options = {}) {
        if (_newImageData === null) {
            throw new Error("Image.constructor(): Constructor called with unspecified _newImageData");
        }

        if (_type === null) {
            throw new Error("Image.constructor(): Constructor called with unspecified _type");
        } else if (_type !== "Base64" && _type !== "Data") {
            throw new Error(`Image.constructor(): Provided type ${_type} is not allowed. Allowed values: "Base64", "Data"`);
        }

        let _imageData = _newImageData;
        let _dataType = _type;

        this.getBase64 = () => {
            if (_dataType !== "Base64") {
                throw new Error("Image.getBase64(): Image initialized with different type than Base64");
            }

            return _imageData;
        }
        this.getData = () => {
            if (_dataType !== "Data") {
                throw new Error("Image.getData(): Image initialized with different type than Data");
            }

            return _imageData;
        }

        this.getImageDataType = () => { return _dataType }

        //TODO: Come back to options
    }

    getBabylonTexture(id = null, scene = null) {
        if (scene === null) {
            throw new Error("Image.getBabylonTexture(): Argument scene was not specified");
        }

        if (id === null) {
            id = String(new Date().getTime());
        }

        let texture = null;
        switch (this.getImageDataType) {
            case "Base64":
                texture = Texture.CreateFromBase64String(this.getBase64(), id, scene);
                break;
            case "Data":
                texture = Texture.LoadFromDataString(id, this.getData(), scene);
                break;
        }

        return texture;
    }
}

export default Image