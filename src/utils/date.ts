/**
 * Format date to dd/mm/yyyy
 * @param date - Date to format
 * @returns Formatted date
 */
export const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
};
//-------------------End-------------------//


/**
 * Format date to mm/yyyy
 * @param date - Date to format
 * @returns Formatted date mm/yyyy
 */
export const formatDateToMMYYYY = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' });
};
//-------------------End-------------------//


/**
 * Format history time
 * @param date - Date to format
 * @param t - Translation function
 * @returns Formatted history time
 */
export const formatHistoryTime = (date: Date, t: (key: string, options?: any) => string): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('gacha.history_just_now');
    if (minutes < 60) return t('gacha.history_minutes_ago', { minutes });
    if (hours < 24) return t('gacha.history_hours_ago', { hours });
    if (days < 7) return t('gacha.history_days_ago', { days });

    // Format date as YYYY-MM-DD for UTC
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
//-------------------End-------------------//



