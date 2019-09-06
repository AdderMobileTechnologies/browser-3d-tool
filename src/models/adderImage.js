import { Texture } from BABYLON;
// What kind of types do we need to accept?
//  Base64
//  Data
//* aside: for some reason the formatting extension doesn't work on a few files. This is one of them. 

class AdderImage {
    constructor(
        imageData = null,
         type = null, 
         options = {}
    ) 
    {
            if (imageData === null) {
                throw new Error("AdderImage.constructor(): Constructor called with unspecified imageData");
            }

            if (type === null) {
                throw new Error("AdderImage.constructor(): Constructor called with unspecified type");
            } else if (type !== "Base64" && type !== "Data") {
                throw new Error(`AdderImage.constructor(): Provided type ${type} is not allowed. Allowed values: "Base64", "Data"`);
            }

            let _imageData = imageData;
            let _dataType = type;

            this.getBase64 = () => {
                if (_dataType !== "Base64") {
                    throw new Error("AdderImage.getBase64(): Image initialized with different type than Base64");
                }
                return _imageData;
            }
            this.getData = () => {
                if (_dataType !== "Data") {
                    throw new Error("AdderImage.getData(): Image initialized with different type than Data");
                }
                return _imageData;
            }

            this.getImageDataType = () => { return _dataType }

            //TODO: Come back to options
    }

    getBabylonTexture(id = null, scene = null) {
        if (scene === null) {
            throw new Error("AdderImage.getBabylonTexture(): Argument scene was not specified");
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

export default AdderImage