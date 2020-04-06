import { DataType, TypeCategory } from "./python";
import { capitalized } from "./utils";
import { TypeHint, labelFor } from "./typeHint";

/**
 * Provides type hints for the Python typing module.
 */
export class TypingHintProvider {

    private docText: string;
    private importStatement: string | null = null;
    private fromTypingImport: boolean = false;
    private typingPrefix: string = "typing";

    private typingImports: string[] = [];

    /**
     * Constructs a new TypingHintProvider.
     * 
     * @param docText The document text to search.
     */
    constructor(docText: string) {
        this.docText = docText;
    }

    /**
     * Determines if this object's document contains a typing import.
     */
    public async containsTyping(): Promise<boolean> {
        let m = new RegExp(
            `^[ \t]*from typing import +([a-zA-Z_][a-zA-Z0-9_-]+)`,
            "m"
        ).exec(this.docText);
        
        if (m) {
            this.importStatement = m[0];
            this.fromTypingImport = true;
            const typings = m[1].split(",");
            typings.forEach(t => {
                this.typingImports.push(t.trim());
            });
            return true;
        } else {
            m = new RegExp(
                `^[ \t]*(import +typing +as +([a-zA-Z_][a-zA-Z0-9_-]+)|import +typing)`,
                "m"
            ).exec(this.docText);
            if (m) {
                this.importStatement = m[0];
                if (m[2]) {
                    this.typingPrefix = m[3];
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Get a hint for a data type if typing is imported.
     * @param type A {@link DataType}.
     * @returns A type hint string.
     */
    public getTypingHint(type: DataType): TypeHint | null {
        const typingName = capitalized(type.name);

        if (type.category === TypeCategory.Collection && this.importStatement) {

            if (this.fromTypingImport && this.typingImports.includes(typingName)) {
                return { label: labelFor(typingName), insertText: ` ${typingName}[` };
            }
            return {
                label: labelFor(`${this.typingPrefix}.${typingName}`),
                insertText: ` ${this.typingPrefix}.${typingName}[`
            };
        }
        return null;
    }

}