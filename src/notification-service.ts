
export class NotificationService
{
    public Notify(message: string)
    {
        var notification = CardService.newNotification()
        .setText(message);
        
        return CardService.newActionResponseBuilder()
            .setNotification(notification)
            .build();
    }
}