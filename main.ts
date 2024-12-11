import { Buffer } from 'buffer';
interface FieldDefinition {
    name: string;
    offset: number;
    length: number;
    type: string;
    scale?: number;
}

interface Schema {
    fields: FieldDefinition[];
}

const fields = [
    { name: "length", offset: 0, length: 1, type: "uint8" },
    { name: "messageType", offset: 1, length: 1, type: "uint8" },
    { name: "deviceId", offset: 2, length: 2, type: "hex" },
    { name: "temperature", offset: 10, length: 2, type: "int16", scale: 0.1 },
    { name: "humidity", offset: 12, length: 2, type: "uint16", scale: 0.1 },
    { name: "battery", offset: 8, length: 1, type: "uint8" }
];

const schema: Schema = { fields };

function decodeMessage(hexString: string, schema: Schema): Record<string, any> {
    const buffer = Buffer.from(hexString, "hex");
    const result: Record<string, any> = {};

    schema.fields.forEach(field => {
        const { name, offset, length, type, scale } = field;
        let value: any;

        switch (type) {
            case "uint8":
                value = buffer.readUInt8(offset);
                break;
            case "int16":
                value = buffer.readInt16BE(offset);
                break;
            case "uint16":
                value = buffer.readUInt16BE(offset);
                break;
            case "hex":
                value = buffer.slice(offset, offset + length).toString("hex");
                break;
            default:
                throw new Error(`Unsupported field type: ${type}`);
        }

        if (scale) {
            value = value * scale;
        }

        result[name] = value;
    });

    return result;
}

// Example Usage
const hexResponse = "08108b8182342d580104de00af01020164";
const decodedMessage = decodeMessage(hexResponse, schema);

console.log(decodedMessage);