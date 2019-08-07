import { Settings } from "./setting";

export class ApiResult
{
    public success: boolean;
    public message: string;
    public data: Settings;

    public static success(data: Settings = null): ApiResult
    {
        var result = new ApiResult();
        result.success = true;
        result.data = data;

        return result;
    }

    public static failure(message: string): ApiResult
    {
        var result = new ApiResult();
        result.success = false;
        result.message = message;

        return result;
    }
}