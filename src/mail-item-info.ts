export class MailItemInfo
{
    public MailItemId: string = '';
    public Headers: Array<any>;
    public HtmlBody: string = '';
    public From: string = '';
    public To: string = '';
    public CC: string = '';
    public BCC: string = '';
    public Subject: string = '';
}