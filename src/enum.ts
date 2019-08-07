export enum ApiInvokeMode
{
    RightPane = 'RightPane',
    IncomingEmail = 'IncomingEmail',
    OutgoingEmail = 'OutgoingEmail',
    BulkAll = 'BulkAll',
    BulkHeaders =  'BulkHeaders',
    Settings = 'Settings'
}

export enum RequestMethod
{
    ReceiveEmail = 'ReceiveEmail',
    SendEmail = 'SendEmail'
}

export enum HttpStatusCode
{
    Ok = 200,
    NotFound = 404,
    NoContent = 204,
    Created = 201,
    BadRequest = 400,
    InternalServerError = 500
}