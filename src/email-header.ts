export class EmailHeader{
    public key: string;
    public value: string;

    public toJsonObject(){
        var result = {};
        result[this.key] = this.value;

        return result;
    }
}