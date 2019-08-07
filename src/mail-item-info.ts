export class MailItemInfo
{
    public mailItemId: string = '';
    public headers: Array<any>;
    public htmlBody: string = '';
    public from: string = '';
    public to: string = '';
    public cc: string = '';
    public bcc: string = '';
    public subject: string = '';
}