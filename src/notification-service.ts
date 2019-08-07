
export class NotificationService
{
    public static notify(message: string)
    {
        var notification = CardService.newNotification()
        .setText(message);
        
        return CardService.newActionResponseBuilder()
            .setNotification(notification)
            .build();
    }
}