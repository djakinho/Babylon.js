import { Vector4, type Vector2 } from "core/Maths/math.vector";
import { RegisterClass } from "../../../../Misc/typeStore";
import { NodeGeometryBlockConnectionPointTypes } from "../../Enums/nodeGeometryConnectionPointTypes";
import type { INodeGeometryTextureData } from "../../Interfaces/nodeGeometryTextureData";
import { NodeGeometryBlock } from "../../nodeGeometryBlock";
import type { NodeGeometryConnectionPoint } from "../../nodeGeometryBlockConnectionPoint";
import { PropertyTypeForEdition, editableInPropertyPage } from "core/Decorators/nodeDecorator";

/**
 * Block used to fetch a color from texture data
 */
export class GeometryTextureFetchBlock extends NodeGeometryBlock {
    /**
     * Gets or sets a boolean indicating if coordinates should be clamped between 0 and 1
     */
    @editableInPropertyPage("Clamp Coordinates", PropertyTypeForEdition.Boolean, "ADVANCED", { notifiers: { rebuild: true } })
    public clampCoordinates = true;

    /**
     * Creates a new GeometryTextureFetchBlock
     * @param name defines the block name
     */
    public constructor(name: string) {
        super(name);

        this.registerInput("texture", NodeGeometryBlockConnectionPointTypes.Texture);
        this.registerInput("coordinates", NodeGeometryBlockConnectionPointTypes.Vector2);
        this.registerOutput("color", NodeGeometryBlockConnectionPointTypes.Vector4);
    }

    /**
     * Gets the current class name
     * @returns the class name
     */
    public getClassName() {
        return "GeometryTextureFetchBlock";
    }

    /**
     * Gets the texture component
     */
    public get texture(): NodeGeometryConnectionPoint {
        return this.inputs[0];
    }

    /**
     * Gets the coordinates component
     */
    public get coordinates(): NodeGeometryConnectionPoint {
        return this.inputs[1];
    }

    /**
     * Gets the color component
     */
    public get color(): NodeGeometryConnectionPoint {
        return this._outputs[0];
    }

    private _repeatClamp(num: number) {
        if (num >= 0) {
            return num % 1;
        } else {
            return 1 - (Math.abs(num) % 1);
        }
    }

    protected _buildBlock() {
        this.color._storedFunction = (state) => {
            const textureData = this.texture.getConnectedValue(state) as INodeGeometryTextureData;
            if (!textureData || !textureData.data) {
                return null;
            }

            const uv = this.coordinates.getConnectedValue(state) as Vector2;

            if (!uv) {
                return null;
            }

            const u = this.clampCoordinates ? Math.max(0, Math.min(uv.x, 1.0)) : this._repeatClamp(uv.x);
            const v = this.clampCoordinates ? Math.max(0, Math.min(uv.y, 1.0)) : this._repeatClamp(uv.y);

            const x = Math.floor(u * (textureData.width - 1));
            const y = Math.floor(v * (textureData.height - 1));
            const index = x + textureData.width * y;

            return Vector4.FromArray(textureData.data, index * 4);
        };
    }

    protected _dumpPropertiesCode() {
        const codeString = super._dumpPropertiesCode() + `${this._codeVariableName}.clampCoordinates = ${this.clampCoordinates};\n`;
        return codeString;
    }

    /**
     * Serializes this block in a JSON representation
     * @returns the serialized block object
     */
    public serialize(): any {
        const serializationObject = super.serialize();

        serializationObject.clampCoordinates = this.clampCoordinates;

        return serializationObject;
    }

    public _deserialize(serializationObject: any) {
        super._deserialize(serializationObject);

        this.clampCoordinates = serializationObject.clampCoordinates;
    }
}

RegisterClass("BABYLON.GeometryTextureFetchBlock", GeometryTextureFetchBlock);
