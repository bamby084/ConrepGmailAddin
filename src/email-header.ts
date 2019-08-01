export class EmailHeader{
    public Key: string;
    public Value: string;

    public toJsonObject(){
        var result = {};
        result[this.Key] = this.Value;

        return result;
    }
}